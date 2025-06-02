import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: { bookingId: string } }
) {
  try {
    const { payment_link } = await request.json();
    console.log("Storing payment link for booking:", {
      bookingId: params.bookingId,
      payment_link,
    });

    if (!payment_link) {
      console.error("Missing payment link");
      return NextResponse.json(
        { error: "Payment link is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // First, check if the booking exists
    const { data: booking, error: fetchError } = await supabase
      .from("tour_bookings")
      .select("id, status")
      .eq("id", params.bookingId)
      .single();

    if (fetchError || !booking) {
      console.error("Booking not found:", fetchError);
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Update the booking with the payment link
    const { data, error } = await supabase
      .from("tour_bookings")
      .update({
        payment_link: payment_link,
        status: "pending_payment",
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.bookingId)
      .select()
      .single();

    if (error) {
      console.error("Error updating booking:", error);
      throw error;
    }

    console.log("Payment link stored successfully:", data);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error storing payment link:", error);
    return NextResponse.json(
      {
        error: "Failed to store payment link",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
