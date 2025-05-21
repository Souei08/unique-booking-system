import { createClient } from "@/supabase/client";

export async function updateBookingStatus(
  bookingId: string,
  status: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tour_bookings")
    .update({ status })
    .eq("id", bookingId);

  if (error) {
    console.error("Error updating booking status:", error);
    throw new Error("Failed to update booking status");
  }
}
