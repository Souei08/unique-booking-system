import { createClient } from "@/supabase/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { promoCodeId, promoCode } = await request.json();

    if (!promoCodeId || !promoCode) {
      return NextResponse.json(
        { error: "Promo code ID and code are required" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Use a transaction to reserve the promo code
    const { data, error } = await supabase.rpc("reserve_promo_code", {
      p_promo_code_id: promoCodeId,
      p_promo_code: promoCode,
    });

    if (error) {
      console.error("Error reserving promo code:", error);
      return NextResponse.json(
        { error: "Failed to reserve promo code" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Promo code is no longer available" },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      reserved: true,
      promo: data,
    });
  } catch (error) {
    console.error("Error in reserve-promo:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
