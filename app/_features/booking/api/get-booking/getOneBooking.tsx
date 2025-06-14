import { createClient } from "@/supabase/client";
import { BookingTable } from "@/app/_features/booking/types/booking-types";

export async function getOneBooking(
  bookingId: string
): Promise<BookingTable | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc("get_one_booking_v2", { _booking_id: bookingId })
    .single();

  if (error) {
    console.error("Error fetching booking details:", error);
    throw new Error("Failed to fetch booking details");
  }

  return data as BookingTable | null;
}
