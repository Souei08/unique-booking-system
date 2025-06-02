import { createClient } from "@/supabase/client";

export const updateBookingPaymentStatus = async (
  bookingId: string,
  paymentId: string | null
) => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc(
      "update_booking_payment_status",
      {
        _booking_id: bookingId,
        _payment_id: paymentId,
      }
    );

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error updating booking payment status:", error);
    throw error;
  }
};
