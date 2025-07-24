import { createClient } from "@/supabase/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { code, totalAmount } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: "Promo code is required" },
        { status: 400 }
      );
    }

    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid total amount" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Get the promo code with row-level security
    const { data: promo, error } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", code.toUpperCase().trim())
      .eq("is_active", true)
      .single();

    if (error || !promo) {
      return NextResponse.json(
        { error: "Invalid or expired promo code" },
        { status: 404 }
      );
    }

    // Check if promo has expired
    const now = new Date();
    const expiryDate = new Date(promo.expires_at);
    if (now > expiryDate) {
      return NextResponse.json(
        { error: "Promo code has expired" },
        { status: 400 }
      );
    }

    // Check if promo has reached max uses (0 or null means unlimited)
    if (
      promo.max_uses !== null &&
      promo.max_uses !== 0 &&
      promo.times_used >= promo.max_uses
    ) {
      return NextResponse.json(
        { error: "Promo code has reached maximum usage limit" },
        { status: 400 }
      );
    }

    // Calculate discount server-side
    let discountAmount = 0;
    if (promo.discount_type === "percentage") {
      discountAmount = (totalAmount * promo.discount_value) / 100;
    } else {
      discountAmount = promo.discount_value;
    }

    // Ensure discount doesn't exceed total amount
    discountAmount = Math.min(discountAmount, totalAmount);
    const finalAmount = Math.round((totalAmount - discountAmount) * 100) / 100;

    return NextResponse.json({
      success: true,
      promo: {
        id: promo.id,
        code: promo.code,
        discount_type: promo.discount_type,
        discount_value: promo.discount_value,
        discount_amount: Math.round(discountAmount * 100) / 100,
        final_amount: finalAmount,
        stripe_coupon_id: promo.stripe_coupon_id,
      },
    });
  } catch (error) {
    console.error("Error validating promo code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
