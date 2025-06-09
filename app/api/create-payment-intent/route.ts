import { NextRequest, NextResponse } from "next/server";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function POST(request: NextRequest) {
  try {
    const { amount, paymentIntentId, bookingId, name, email, phone } =
      await request.json();

    let paymentIntent;

    if (paymentIntentId) {
      // Attempt to update existing PaymentIntent
      paymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
        amount,
        metadata: {
          booking_id: bookingId,
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
        },
        receipt_email: email,
      });
    } else {
      // Create a new PaymentIntent
      paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "usd",
        payment_method_types: ["card"],
        metadata: {
          booking_id: bookingId,
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
        },
        receipt_email: email,
      });
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Error creating/updating payment intent:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
