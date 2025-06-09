import { NextRequest, NextResponse } from "next/server";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId, metadata } = await request.json();

    if (!paymentIntentId || !metadata) {
      return NextResponse.json(
        { error: "Missing paymentIntentId or metadata" },
        { status: 400 }
      );
    }

    const updatedIntent = await stripe.paymentIntents.update(paymentIntentId, {
      metadata,
    });

    return NextResponse.json({ success: true, updatedIntent });
  } catch (error) {
    console.error("Error updating payment intent metadata:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
