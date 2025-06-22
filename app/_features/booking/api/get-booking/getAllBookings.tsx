import { createClient } from "@/supabase/client";
import { BookingTable } from "@/app/_features/booking/types/booking-types";

interface BookingFilters {
  tour_filter?: string | null; // UUID
  user_name_filter?: string | null; // Search name
  status_filter?: string | null; // e.g., 'confirmed', 'cancelled'
  booking_id_filter?: string | null; // Booking ID filter
  date_range?: {
    from: string; // ISO string
    to: string; // ISO string
  } | null;
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
    booking_id_filter = null,
    date_range = null,
    limit_count = 10,
    offset_count = 0,
  } = filters;

  // Call your SQL function (RPC)
  const { data, error } = await supabase.rpc("get_all_bookings_v2", {
    tour_filter,
    user_name_filter,
    status_filter,
    booking_id_filter,
    created_start: date_range?.from || null,
    created_end: date_range?.to || null,
    limit_count,
    offset_count,
  });

  if (error) {
    console.error("Error fetching bookings:", error);
    throw new Error("Failed to fetch bookings");
  }

  // Transform to BookingTable[]
  const transformedData: BookingTable[] =
    data?.map((booking: any) => ({
      id: booking.booking_id,
      booking_id: booking.booking_id,
      tour_id: booking.tour_id,
      user_id: booking.user_id,
      slots: booking.slots,
      booking_created_at: booking.booking_created_at,
      booking_date: booking.booking_date,
      selected_time: booking.selected_time,
      full_name: booking.full_name || "",
      email: booking.email || "",
      phone_number: booking.phone_number || "",
      manage_token: booking.manage_token || "",
      tour_title: booking.tour_title || "",
      payment_method: booking.payment_method || "",
      booking_status: booking.booking_status || "",
      payment_status: booking.payment_status || "",
      reference_number: booking.reference_number || "",
      tour_rate: booking.original_amount || booking.amount_paid || 0,
      slot_details: booking.slot_details || [],
      promo_code_id: booking.promo_code_id || null,
      promo_code: booking.promo_code || "",
      original_amount: booking.original_amount || 0,
      discount_amount: booking.discount_amount || 0,
      amount_paid: booking.amount_paid || 0,
      // Extra: keep total_count for pagination
      total_count: booking.total_count || 0,
    })) || [];

  return transformedData;
}
