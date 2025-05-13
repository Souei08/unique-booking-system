import { createClient } from "@/supabase/client";
import { BookingTable } from "@/app/_features/booking/types/booking-types";

export async function getAllBookings(): Promise<BookingTable[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_all_bookings", {});

  if (error) {
    console.error("Error fetching all bookings:", error);
    throw new Error("Failed to fetch all bookings");
  }

  return data;
}
