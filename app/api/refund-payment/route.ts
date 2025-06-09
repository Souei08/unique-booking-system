import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export async function POST(request: Request) {
  try {
    const { paymentId, amount } = await request.json();

    if (!paymentId) {
      return NextResponse.json(
        { message: "Payment ID is required" },
        { status: 400 }
      );
    }

    // Step 1: Fetch the PaymentIntent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);

    if (!paymentIntent.latest_charge) {
      return NextResponse.json(
        { message: "No charge found for this payment intent." },
        { status: 400 }
      );
    }

    const chargeId = paymentIntent.latest_charge as string;
    const charge = await stripe.charges.retrieve(chargeId);

    const alreadyRefunded = charge.refunded;
    const totalRefunded = charge.amount_refunded / 100;
    const totalPaid = charge.amount / 100;

    if (alreadyRefunded && !amount) {
      return NextResponse.json(
        { message: "This payment has already been fully refunded." },
        { status: 400 }
      );
    }

    if (amount && totalRefunded >= totalPaid) {
      return NextResponse.json(
        { message: "The full amount has already been refunded." },
        { status: 400 }
      );
    }

    // ✅ Validation passed. Proceed with refund
    const refund = await stripe.refunds.create({
      payment_intent: paymentId,
      ...(amount && { amount: Math.round(amount * 100) }),
    });

    return NextResponse.json({
      success: true,
      refundId: refund.id,
      amount: refund.amount / 100,
    });
  } catch (error: any) {
    console.error("Refund creation error:", error);

    return NextResponse.json(
      { message: error.message || "Refund failed." },
      { status: 500 }
    );
  }
}
