import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

interface LineItemInput {
  label: string;
  price: number;
  quantity: number;
}

interface CustomSlotField {
  name: string;
  label: string;
  type: string;
  required: boolean;
}

interface CustomSlotType {
  name: string;
  price: number;
}

interface SlotDetail {
  type: string;
  price: number;
  [key: string]: any;
}

interface RequestPayload {
  booking_id: string;
  email: string;
  name: string;
  phone: string;
  slots: number | LineItemInput[];
  booking_price: number;
  tourProducts?: {
    name: string;
    quantity: number;
    unit_price: number;
  }[];
  bookingTitle: string;
  slotDetails?: SlotDetail[];
  customSlotTypes?: CustomSlotType[];
  customSlotFields?: CustomSlotField[];
  previousSessionId?: string; // Optional — to expire old session
}

// Shared function to prepare payment session data
async function preparePaymentSessionData(data: RequestPayload) {
  const {
    booking_id,
    email,
    name,
    phone,
    slots,
    booking_price,
    tourProducts = [],
    bookingTitle,
    slotDetails = [],
    customSlotTypes = [],
    customSlotFields = [],
  } = data;

  // 1. Normalize slot line items
  let normalizedSlots: LineItemInput[] = [];

  if (customSlotTypes.length > 0 && slotDetails.length > 0) {
    const groupedSlots = slotDetails.reduce((acc, slot) => {
      const type = slot.type;
      if (!acc[type]) {
        acc[type] = {
          count: 0,
          price: slot.price,
          customFields: customSlotFields.reduce(
            (fields, field) => ({
              ...fields,
              [field.name]: slot[field.name],
            }),
            {}
          ),
        };
      }
      acc[type].count++;
      return acc;
    }, {} as Record<string, { count: number; price: number; customFields: Record<string, any> }>);

    normalizedSlots = Object.entries(groupedSlots).map(([type, details]) => ({
      label: `${bookingTitle} - ${type}`,
      price: Math.round(details.price * 100),
      quantity: details.count,
    }));
  } else if (typeof slots === "number" && slots > 0) {
    normalizedSlots = [
      {
        label: bookingTitle,
        price: Math.round(booking_price * 100),
        quantity: slots,
      },
    ];
  } else if (Array.isArray(slots)) {
    normalizedSlots = slots;
  }

  // 2. Normalize products
  const mappedTourProducts: LineItemInput[] = tourProducts.map((p) => ({
    label: p.name,
    price: Math.round(p.unit_price), // already in cents
    quantity: p.quantity,
  }));

  // 3. Combine all items
  const allItems: LineItemInput[] = [...normalizedSlots, ...mappedTourProducts];

  const stripeLineItems = allItems.map((item) => ({
    quantity: item.quantity,
    price_data: {
      currency: "usd",
      unit_amount: item.price,
      product_data: {
        name: item.label,
      },
    },
  }));

  // 4. Metadata
  const metadata: Record<string, string> = {
    booking_id,
    customer_name: name,
    customer_email: email,
    customer_phone: phone,
  };

  return {
    stripeLineItems,
    metadata,
  };
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const data: RequestPayload = await request.json();
    const { booking_id, email, slots, tourProducts = [] } = data;

    if (!booking_id || !email || (!slots && tourProducts.length === 0)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const { stripeLineItems, metadata } = await preparePaymentSessionData(data);

    // Create new session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: stripeLineItems,
      metadata,
      payment_intent_data: { metadata },
      success_url: `${baseUrl}/booking-success?booking_id=${booking_id}&status=success`,
      cancel_url: `${baseUrl}/booking-cancelled?booking_id=${booking_id}&status=cancelled`,
      customer_email: email,
    });

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error("❌ Stripe Checkout Error:", error);
    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
export async function PUT(request: Request): Promise<NextResponse> {
  try {
    const data: RequestPayload = await request.json();
    const {
      booking_id,
      email,
      slots,
      tourProducts = [],
      previousSessionId,
    } = data;

    console.log(data);

    if (
      !booking_id ||
      !email ||
      (!slots && tourProducts.length === 0) ||
      !previousSessionId
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    function extractSessionIdFromUrl(url: string): string | null {
      try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split("/");
        const sessionId = pathParts[pathParts.length - 1]; // after "/pay/"
        return sessionId.startsWith("cs_") ? sessionId : null;
      } catch {
        return null;
      }
    }

    // Step 1: Extract session ID if a full URL was passed
    const sessionId = extractSessionIdFromUrl(previousSessionId);

    let expiredOldSession = false;

    // Step 2: Expire the previous session (if valid and not expired)
    if (sessionId) {
      try {
        const existingSession = await stripe.checkout.sessions.retrieve(
          sessionId
        );

        const now = Math.floor(Date.now() / 1000); // UNIX timestamp
        const notExpired =
          existingSession.expires_at && existingSession.expires_at > now;

        if (notExpired && existingSession.status === "open") {
          await stripe.checkout.sessions.expire(sessionId);
          expiredOldSession = true;
        }
      } catch (err) {
        console.warn(
          `⚠️ Could not retrieve or expire session ${sessionId}:`,
          err
        );
      }
    }

    // Step 3: Prepare new session data
    const { stripeLineItems, metadata } = await preparePaymentSessionData(data);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: stripeLineItems,
      metadata,
      payment_intent_data: { metadata },
      success_url: `${baseUrl}/booking-success?booking_id=${booking_id}&status=success`,
      cancel_url: `${baseUrl}/booking-cancelled?booking_id=${booking_id}&status=cancelled`,
      customer_email: email,
    });

    // Step 4: Return the new session info
    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
      previousSessionExpired: expiredOldSession,
    });
  } catch (error: any) {
    console.error("❌ Stripe Checkout Update Error:", error);
    return NextResponse.json(
      {
        error: "Failed to update checkout session",
        details: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
