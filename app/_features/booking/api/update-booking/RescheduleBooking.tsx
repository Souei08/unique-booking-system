import { createClient } from "@/supabase/client";

interface RescheduleData {
  booking_id: string;
  new_booking_date: string; // Format: YYYY-MM-DD
  new_selected_time: string; // Format: HH:mm:ss
}

export async function rescheduleBooking(data: RescheduleData): Promise<{
  success: boolean;
  booking_id: string;
}> {
  const supabase = await createClient();

  const { booking_id, new_booking_date, new_selected_time } = data;

  // Input Validation
  if (!booking_id || !new_booking_date || !new_selected_time) {
    throw new Error("Missing required fields.");
  }

  try {
    // Update the tour_bookings table directly
    const { data: result, error } = await supabase
      .from("tour_bookings")
      .update({
        booking_date: new_booking_date,
        selected_time: new_selected_time,
        status: "rescheduled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking_id)
      .select()
      .single();

    if (error) {
      console.error("Reschedule Update Failed:", error);
      throw new Error("Rescheduling failed. Please try again.");
    }

    if (!result) {
      throw new Error("Rescheduling failed. No data returned.");
    }

    return {
      success: true,
      booking_id: result.id,
    };
  } catch (err: any) {
    console.error("Unhandled Error:", err);
    throw new Error(err.message || "An unexpected error occurred.");
  }
}
