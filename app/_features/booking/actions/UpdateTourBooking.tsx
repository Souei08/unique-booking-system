"use server";

import { createClient } from "@/supabase/server";
import { SuccessResponse } from "@/app/_api/actions/types";

/**
 * Update an existing tour booking
 * @param data The booking data to update
 * @returns Success response with the updated booking
 */
export async function updateTourBooking(data: {
  bookingId: string;
  tourId: string;
  date: string;
  start_time: string;
  spots: number;
  total_price: number;
  customer_email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
}): Promise<SuccessResponse> {
  const supabase = await createClient();
  const {
    bookingId,
    tourId,
    date,
    start_time,
    spots,
    total_price,
    customer_email,
    first_name,
    last_name,
    phone_number,
  } = data;

  if (
    !bookingId ||
    !tourId ||
    !date ||
    !start_time ||
    !spots ||
    !total_price ||
    !customer_email ||
    !first_name ||
    !last_name ||
    !phone_number
  ) {
    return { success: false, message: "Missing fields" };
  }

  try {
    // Get max slots from tour table
    const { data: tour, error: tourError } = await supabase
      .from("tours")
      .select("slots")
      .eq("id", tourId)
      .single();

    if (tourError || !tour) {
      return {
        success: false,
        message: tourError?.message || "Tour not found.",
      };
    }

    // Get current booking to exclude it from the count
    const { data: currentBooking } = await supabase
      .from("tour_bookings")
      .select("id")
      .eq("id", bookingId)
      .single();

    // Count other bookings for the same tour and date
    const { count: otherBookings, error: bookingCountError } = await supabase
      .from("tour_bookings")
      .select("id", { count: "exact" })
      .eq("tour_id", tourId)
      .eq("date", date)
      .neq("id", bookingId);

    if (bookingCountError) {
      return {
        success: false,
        message: bookingCountError.message,
      };
    }

    if ((otherBookings || 0) + spots > tour.slots) {
      return {
        success: false,
        message: "Not enough available slots.",
      };
    }

    const { data: booking, error: bookingError } = await supabase
      .from("tour_bookings")
      .update({
        user_email: customer_email,
        tour_id: tourId,
        date,
        spots,
        total_price,
        first_name,
        last_name,
        phone_number,
      })
      .eq("id", bookingId)
      .select()
      .single();

    if (bookingError) {
      return {
        success: false,
        message: bookingError.message,
      };
    }

    return {
      success: true,
      data: booking,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message,
    };
  }
}
