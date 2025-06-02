import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/supabase/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabase = createClient();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    booking_id,
    payment_id,
    amount_paid,
    payment_method = "card",
    payment_status = "paid", // or "failed", etc.
    paid_at = new Date().toISOString(),
  } = req.body;

  if (!booking_id || !payment_id || amount_paid == null) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // 1. Update the booking status
    const { error: bookingError } = await supabase
      .from("tour_bookings")
      .update({
        status: "confirmed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking_id);

    if (bookingError) {
      throw new Error("Failed to update booking: " + bookingError.message);
    }

    // 2. Upsert payment record
    const { error: paymentError } = await supabase.from("payments").upsert(
      {
        booking_id,
        payment_id,
        amount_paid,
        payment_method,
        status: payment_status,
        paid_at,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "payment_id",
      }
    );

    if (paymentError) {
      throw new Error("Failed to update payment: " + paymentError.message);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : "Something went wrong",
    });
  }
}
