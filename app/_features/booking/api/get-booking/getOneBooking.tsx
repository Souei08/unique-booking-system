import { createClient } from "@/supabase/client";
import { BookingTable } from "@/app/_features/booking/types/booking-types";

export async function getOneBooking(
  bookingId: string | null,
  manageToken: string | null
): Promise<BookingTable | null> {
  const supabase = await createClient();

  // Convert empty strings to null to avoid UUID conversion error
  const bookingIdParam = bookingId?.trim() || null;
  const manageTokenParam = manageToken?.trim() || null;

  const { data, error } = await supabase
    .rpc("get_one_booking_v2", {
      _booking_id: bookingIdParam,
      _manage_token: manageTokenParam,
    })
    .single();

  if (error) {
    console.error("Error fetching booking details:", error);
    throw new Error("Failed to fetch booking details");
  }

  return data as BookingTable | null;
}
