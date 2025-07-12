import { createClient } from "@/supabase/client";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient();

    // Step 1: Get the promo code to retrieve the Stripe coupon ID
    const { data: promo, error: fetchError } = await supabase
      .from("promo_codes")
      .select("stripe_coupon_id")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error fetching promo:", fetchError);
      return NextResponse.json({ error: "Promo not found" }, { status: 404 });
    }

    // Step 2: Delete from Stripe first (if coupon exists)
    if (promo.stripe_coupon_id) {
      try {
        await stripe.coupons.del(promo.stripe_coupon_id);
        console.log(
          "Stripe coupon deleted successfully:",
          promo.stripe_coupon_id
        );
      } catch (stripeError: any) {
        console.error("Error deleting Stripe coupon:", stripeError);
        // If Stripe deletion fails, we should not proceed with Supabase deletion
        return NextResponse.json(
          { error: "Failed to delete Stripe coupon" },
          { status: 500 }
        );
      }
    }

    // Step 3: Delete from Supabase
    const { error: deleteError } = await supabase
      .from("promo_codes")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting promo from Supabase:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete promo from database" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Promo deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/delete-promo/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
