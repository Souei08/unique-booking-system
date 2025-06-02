import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

interface LineItemInput {
  label: string;
  price: number; // in cents
  quantity: number;
}

interface RequestPayload {
  booking_id: string;
  email: string;
  name: string;
  phone: string;
  slots: number | LineItemInput[]; // can be a number (count) or array
  booking_price: number;
  tourProducts: {
    name: string;
    quantity: number;
    unit_price: number;
  }[];
  bookingTitle: string;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const {
      booking_id,
      email,
      name,
      phone,
      slots,
      booking_price,
      tourProducts = [],
      bookingTitle,
    }: RequestPayload = await request.json();

    if (!booking_id || !email || (!slots && tourProducts.length === 0)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // Normalize slots: convert number to a proper LineItemInput[]
    const normalizedSlots: LineItemInput[] =
      typeof slots === "number"
        ? slots > 0
          ? [
              {
                label: bookingTitle,
                price: booking_price, // adjust based on your actual slot price in cents
                quantity: slots,
              },
            ]
          : []
        : slots;

    // Map tour products into LineItemInput[]
    const mappedTourProducts: LineItemInput[] = tourProducts.map((p) => ({
      label: p.name,
      price: p.unit_price,
      quantity: p.quantity,
    }));

    const allItems: LineItemInput[] = [
      ...normalizedSlots,
      ...mappedTourProducts,
    ];

    const stripeLineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      allItems.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(item.price), // assumed already in cents
          product_data: {
            name: item.label,
          },
        },
      }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: stripeLineItems,
      metadata: {
        booking_id: booking_id,
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
      },
      payment_intent_data: {
        metadata: {
          booking_id: booking_id,
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
        },
      },
      success_url: `${baseUrl}/booking-success?booking_id=${booking_id}&status=success`,
      cancel_url: `${baseUrl}/booking-cancelled?booking_id=${booking_id}&status=cancelled`,
      customer_email: email,
    });

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error: unknown) {
    console.error("❌ Stripe Checkout Error:", error);
    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
