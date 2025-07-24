import { createClient } from "@/supabase/client";

export interface ManualPaymentStatusUpdate {
  bookingId: string;
  paymentStatus: string;
  reason?: string;
  adminNotes?: string;
}

export async function updateManualPaymentStatus(
  data: ManualPaymentStatusUpdate
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();

    // Update the payment status in the payments table
    const { error: paymentError } = await supabase
      .from("payments")
      .update({
        status: data.paymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("booking_id", data.bookingId);

    if (paymentError) {
      console.error("Error updating payment status:", paymentError);
      throw new Error("Failed to update payment status");
    }

    // Update booking status based on payment status
    let bookingStatus = "pending";
    if (data.paymentStatus === "paid") {
      bookingStatus = "confirmed";
    } else if (data.paymentStatus === "failed" || data.paymentStatus === "cancelled") {
      bookingStatus = "cancelled";
    }

    const { error: bookingError } = await supabase
      .from("tour_bookings")
      .update({
        status: bookingStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.bookingId);

    if (bookingError) {
      console.error("Error updating booking status:", bookingError);
      throw new Error("Failed to update booking status");
    }

    return {
      success: true,
      message: `Payment status updated to ${data.paymentStatus} successfully`,
    };
  } catch (error) {
    console.error("Error in updateManualPaymentStatus:", error);
    throw error;
  }
} 