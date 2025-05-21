import { createClient } from "@/supabase/client";
import { BookingTable } from "@/app/_features/booking/types/booking-types";

export async function getAllBookings(): Promise<BookingTable[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_all_bookings_v2", {});

  if (error) {
    // console.error("Error fetching all bookings:", error);
    console.log(error);
    throw new Error("Failed to fetch all bookings");
  }

  console.log(data);

  return data;
}
