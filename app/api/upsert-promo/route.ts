// app/api/upsert-promo/route.ts

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/supabase/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

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

    const normalized = discount_type.toLowerCase().trim();
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

    // ✅ Step 1: Check if promo already exists
    const { data: existingPromo, error: findError } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", code.toUpperCase())
      .single();

    if (findError && findError.code !== "PGRST116") {
      // Not a "no rows found" error
      return NextResponse.json({ error: findError.message }, { status: 500 });
    }

    // ✅ Enhanced validation: Check if promo code already exists
    if (existingPromo) {
      return NextResponse.json(
        {
          error: "Promo code already exists",
          details:
            "A promo code with this name already exists. Please use a different code or update the existing one.",
          existingPromo: {
            id: existingPromo.id,
            code: existingPromo.code,
            discount_type: existingPromo.discount_type,
            discount_value: existingPromo.discount_value,
            expires_at: existingPromo.expires_at,
            max_uses: existingPromo.max_uses,
            is_active: existingPromo.is_active,
            times_used: existingPromo.times_used,
          },
        },
        { status: 409 } // Conflict status code
      );
    }

    // ✅ Step 2: Create new Stripe coupon
    const newCoupon = await stripe.coupons.create({
      name: code,
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
      max_redemptions:
        max_uses !== null && max_uses !== undefined
          ? Number(max_uses)
          : undefined,
    });

    stripeCouponId = newCoupon.id;

    // ✅ Step 3: Insert into Supabase (not upsert since we validated uniqueness)
    const { data: newPromo, error: insertError } = await supabase
      .from("promo_codes")
      .insert({
        code: code.toUpperCase(),
        discount_type: cleanDiscountType,
        discount_value,
        expires_at,
        max_uses: max_uses === undefined ? null : Number(max_uses),
        is_active,
        stripe_coupon_id: stripeCouponId,
      })
      .select()
      .single();

    if (insertError) {
      await stripe.coupons.del(stripeCouponId); // cleanup
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, promo: newPromo });
  } catch (error: any) {
    if (stripeCouponId) {
      try {
        await stripe.coupons.del(stripeCouponId);
      } catch (err) {
        console.error("Cleanup failed for Stripe coupon", err);
      }
    }
    console.error("Error in upsert promo:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
