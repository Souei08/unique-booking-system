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

  // Add retry logic for database operations
  const maxRetries = 3;
  let retryCount = 0;

  console.log("event", event.type);

  // Handle Stripe event (e.g., checkout.session.completed)
  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.booking_id;
      const paymentId = session.payment_intent as string;
      const paymentRefId = session.metadata?.payment_ref_id;

      console.log("session", session);

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
                  payment_ref_id: paymentRefId,
                  payment_method: "card",
                  status: "paid",
                  amount_paid: session.amount_total
                    ? session.amount_total / 100
                    : 0,
                  paid_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
                { onConflict: "payment_ref_id" }
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
    }

    // ✅ ADDITION: Handle `payment_intent.succeeded`
    else if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object as Stripe.PaymentIntent;
      const paymentId = intent.id;
      const bookingId = intent.metadata?.booking_id || null;
      const paymentIdRef = intent.metadata?.payment_ref_id || null;

      const amountPaid = intent.amount_received / 100;

      while (retryCount < maxRetries) {
        try {
          // Upsert payment to the main payments table
          const { error: paymentError } = await supabaseAdmin
            .from("payments")
            .upsert(
              {
                booking_id: bookingId,
                payment_id: paymentId,
                payment_ref_id: paymentIdRef,
                payment_method: "card",
                status: "paid",
                amount_paid: amountPaid,
                paid_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              { onConflict: "payment_ref_id" }
            );

          if (paymentError) throw paymentError;

          if (bookingId) {
            // Update the booking status only if booking exists
            const { error: bookingError } = await supabaseAdmin
              .from("tour_bookings")
              .update({
                status: "confirmed",
                updated_at: new Date().toISOString(),
              })
              .eq("id", bookingId);

            if (bookingError) throw bookingError;
          } else {
            // No bookingId? Save as orphan
            await supabaseAdmin.from("orphaned_payments").insert({
              payment_id: paymentId,
              amount_paid: amountPaid,
              customer_email:
                intent.receipt_email || intent.metadata?.customer_email || null,
              metadata: intent.metadata,
              received_at: new Date().toISOString(),
            });
          }

          break; // Success
        } catch (error) {
          retryCount++;
          if (retryCount === maxRetries) {
            console.error("Failed after retries:", error);
            console.error("Event:", {
              type: event.type,
              id: event.id,
              bookingId,
              paymentId,
            });
          }

          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, retryCount) * 1000)
          );
        }
      }
    }

    // ✅ REFUND EVENTS (Handles both full & partial)
    else if (
      event.type === "charge.refunded" ||
      event.type === "charge.refund.updated"
    ) {
      const charge = event.data.object as Stripe.Charge;

      const paymentId = charge.payment_intent as string;
      if (!paymentId) {
        console.error("Missing payment_intent in charge event:", charge);
        return new Response("Missing payment_intent", { status: 400 });
      }

      const refundAmount = charge.amount_refunded / 100;
      const isFullRefund = charge.amount === charge.amount_refunded;

      const refundStatus = isFullRefund ? "refunded" : "partially_refunded";

      const bookingStatus = "cancelled";

      while (retryCount < maxRetries) {
        try {
          const { data: paymentData, error: fetchError } = await supabaseAdmin
            .from("payments")
            .select("booking_id")
            .eq("payment_id", paymentId)
            .single();

          if (fetchError) throw fetchError;

          if (!paymentData?.booking_id) {
            console.warn("No booking_id linked to payment:", paymentId);
            break;
          }

          const updatePayment = await supabaseAdmin
            .from("payments")
            .update({
              status: refundStatus,
              refunded_amount: refundAmount,
              refunded_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("payment_id", paymentId);

          if (updatePayment.error) throw updatePayment.error;

          const updateBooking = await supabaseAdmin
            .from("tour_bookings")
            .update({
              status: bookingStatus,
              updated_at: new Date().toISOString(),
            })
            .eq("id", paymentData.booking_id);

          if (updateBooking.error) throw updateBooking.error;

          break;
        } catch (error) {
          retryCount++;
          if (retryCount === maxRetries) {
            console.error("Final retry failed for refund update:", error);
            console.error("Event payload:", JSON.stringify(event, null, 2));
          }
          await new Promise((res) =>
            setTimeout(res, Math.pow(2, retryCount) * 1000)
          );
        }
      }
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
    // Return 500 to tell Stripe to retry
    return new Response("Webhook processing failed", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
