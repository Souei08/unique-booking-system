import { createClient } from "@/supabase/client";

interface CancelBookingResponse {
  success: boolean;
  message: string;
}

export async function cancelBooking(
  bookingId: string,
  stripePaymentId: string | null,
  refundAmount?: number
): Promise<CancelBookingResponse> {
  try {
    if (stripePaymentId) {
      const response = await fetch("/api/refund-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentId: stripePaymentId,
          amount: refundAmount,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: error.message || "Failed to process refund",
        };
      }
    }

    // const supabase = await createClient();

    // const { error } = await supabase
    //   .from("tour_bookings")
    //   .update({
    //     status: "cancelled",
    //     updated_at: new Date().toISOString(),
    //   })
    //   .eq("id", bookingId);

    // if (error) {
    //   return {
    //     success: false,
    //     message: "Failed to cancel booking",
    //   };
    // }

    return {
      success: true,
      message: stripePaymentId
        ? refundAmount
          ? `Booking cancelled and partial refund of $${refundAmount.toFixed(
              2
            )} processed successfully`
          : "Booking cancelled and full refund processed successfully"
        : "Booking cancelled successfully",
    };
  } catch (error: any) {
    console.error("Error in cancelBooking:", error);
    return {
      success: false,
      message: error.message || "Failed to cancel booking",
    };
  }
}
