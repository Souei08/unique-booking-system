export const runtime = "nodejs"; // ✅ Required for Stripe webhooks to work correctly

import { buffer } from "node:stream/consumers";
import Stripe from "stripe";
import { NextRequest } from "next/server";
import { headers } from "next/headers";
import supabaseAdmin from "@/supabase/admin";

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil", // Adjust to your desired Stripe version
});

export async function POST(req: NextRequest) {
  const rawBody = await buffer(req.body as any);
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  if (!sig) {
    return new Response("Missing Stripe signature", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response(`Webhook Error: ${(err as Error).message}`, {
      status: 400,
    });
  }

  console.log(event);
  // Handle Stripe event (e.g., checkout.session.completed)
  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.booking_id;
      const paymentId = session.payment_intent as string;

      console.log(session);
      console.log(bookingId);

      // Add retry logic for database operations
      const maxRetries = 3;
      let retryCount = 0;

      while (retryCount < maxRetries) {
        try {
          if (bookingId) {
            // Update booking
            const { error: bookingError } = await supabaseAdmin
              .from("tour_bookings")
              .update({
                status: "confirmed",
                updated_at: new Date().toISOString(),
              })
              .eq("id", bookingId);

            if (bookingError) throw bookingError;

            // Update payment
            const { error: paymentError } = await supabaseAdmin
              .from("payments")
              .upsert(
                {
                  booking_id: bookingId,
                  payment_id: paymentId,
                  payment_method: "card",
                  status: "paid",
                  amount_paid: session.amount_total
                    ? session.amount_total / 100
                    : 0,
                  paid_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
                { onConflict: "booking_id" }
              );

            if (paymentError) throw paymentError;

            // If we get here, everything succeeded
            break;
          }
        } catch (error) {
          retryCount++;
          if (retryCount === maxRetries) {
            // TODO: Consider creating a failed_webhooks table in Supabase to track failed webhook events
            // This will help in debugging and manual intervention for failed payments
            console.error("Failed to process webhook after retries:", error);
            console.error("Event details:", {
              eventId: event.id,
              eventType: event.type,
              bookingId,
              paymentId,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
          // Wait before retrying (exponential backoff)
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, retryCount) * 1000)
          );
        }
      }
    } else if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.booking_id;
      const paymentId = session.payment_intent as string;

      console.log(session);
      console.log(bookingId);
      console.log(paymentId);
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
    // Return 500 to tell Stripe to retry
    return new Response("Webhook processing failed", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
