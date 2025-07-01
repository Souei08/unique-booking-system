import { createClient } from "@/supabase/client";
import { BookingTable } from "@/app/_features/booking/types/booking-types";

export async function getBookingByToken(
  manageToken: string | null
): Promise<BookingTable | null> {
  const supabase = await createClient();

  // Convert empty string to null to avoid UUID conversion error
  const tokenParam = manageToken?.trim() || null;

  const { data, error } = await supabase
    .rpc("get_one_booking_v2", {
      _booking_id: null,
      _manage_token: tokenParam,
    })
    .single();

  if (error) {
    console.error("Error fetching booking details:", error);
    throw new Error("Failed to fetch booking details");
  }

  return data as BookingTable | null;
}
