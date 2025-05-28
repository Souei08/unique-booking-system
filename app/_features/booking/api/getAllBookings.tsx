import { createClient } from "@/supabase/client";
import { BookingTable } from "@/app/_features/booking/types/booking-types";

interface BookingFilters {
  tour_filter?: string | null; // UUID
  user_name_filter?: string | null; // Search name
  status_filter?: string | null; // e.g., 'confirmed', 'cancelled'
  limit_count?: number; // pagination limit
  offset_count?: number; // pagination offset
}

export async function getAllBookings(
  filters: BookingFilters = {}
): Promise<BookingTable[]> {
  const supabase = await createClient();

  const {
    tour_filter = null,
    user_name_filter = null,
    status_filter = null,
    limit_count = 10,
    offset_count = 0,
  } = filters;

  const { data, error } = await supabase.rpc("get_all_bookings_v2", {
    tour_filter,
    user_name_filter,
    status_filter,
    limit_count,
    offset_count,
  });

  if (error) {
    console.error("Error fetching bookings:", error);
    throw new Error("Failed to fetch bookings");
  }

  return data;
}
