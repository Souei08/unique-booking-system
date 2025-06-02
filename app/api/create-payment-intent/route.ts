import { NextRequest, NextResponse } from "next/server";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function POST(request: NextRequest) {
  try {
    const { amount, email, name, phone, tourDetails, productDetails } =
      await request.json();

    // Transform product details to only include name, price, and quantity
    const simplifiedProducts = Object.values(productDetails).map(
      (product: any) => ({
        name: product.name,
        price: product.price,
        quantity: product.quantity,
      })
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      metadata: {
        customer_email: email,
        customer_name: name,
        customer_phone: phone,
        tour_name: tourDetails.title,
        tour_price: tourDetails.rate.toString(),
        tour_subtotal: (
          tourDetails.rate * tourDetails.numberOfPeople
        ).toString(),
        products: JSON.stringify(simplifiedProducts),
      },
      payment_method_types: ["card"],
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: `Internal server error ${error}` },
      { status: 500 }
    );
  }
}
