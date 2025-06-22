// app/api/createPromo/route.ts

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/supabase/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

// POST handler
export async function POST(req: Request) {
  const supabase = createClient();
  let stripeCouponId: string | null = null;

  try {
    const data = await req.json();
    const {
      code,
      discount_type,
      discount_value,
      expires_at,
      max_uses,
      is_active,
    } = data;

    // ✅ Validate
    if (!code || !discount_type || !discount_value) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const normalized = (discount_type || "").toLowerCase().trim();
    let cleanDiscountType: "percentage" | "fixed_amount";
    if (normalized === "percentage") {
      cleanDiscountType = "percentage";
    } else if (["fixed", "fixed_amount"].includes(normalized)) {
      cleanDiscountType = "fixed_amount";
    } else {
      return NextResponse.json(
        { error: "Invalid discount type: must be percentage or fixed_amount." },
        { status: 400 }
      );
    }

    // Step 1: Create Stripe coupon
    const coupon = await stripe.coupons.create({
      percent_off:
        cleanDiscountType === "percentage" ? Number(discount_value) : undefined,
      amount_off:
        cleanDiscountType === "fixed_amount"
          ? Math.round(Number(discount_value) * 100)
          : undefined,
      currency: cleanDiscountType === "fixed_amount" ? "usd" : undefined,
      duration: "once",
      redeem_by: expires_at
        ? Math.floor(new Date(expires_at).getTime() / 1000)
        : undefined,
    });

    stripeCouponId = coupon.id;

    // Step 2: Insert into database
    const { data: promo, error } = await supabase
      .from("promo_codes")
      .insert({
        code: code.toUpperCase(),
        discount_type: cleanDiscountType, // ✅ ALWAYS normalized
        discount_value,
        expires_at,
        max_uses: Number(max_uses),
        is_active,
        stripe_coupon_id: coupon.id,
      })
      .select()
      .single();

    if (error) {
      // If database insert fails, delete the Stripe coupon
      if (stripeCouponId) {
        try {
          await stripe.coupons.del(stripeCouponId);
        } catch (stripeDeleteError) {
          console.error(
            "Failed to delete Stripe coupon after database error:",
            stripeDeleteError
          );
        }
      }
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, promo });
  } catch (error: any) {
    // If any error occurs, clean up the Stripe coupon if it was created
    if (stripeCouponId) {
      try {
        await stripe.coupons.del(stripeCouponId);
      } catch (stripeDeleteError) {
        console.error(
          "Failed to delete Stripe coupon after error:",
          stripeDeleteError
        );
      }
    }
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
