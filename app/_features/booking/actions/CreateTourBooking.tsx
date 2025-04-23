"use server";

import { createClient } from "@/supabase/server";
import { Booking, SuccessResponse } from "@/app/_api/actions/types";

/**
 * Create a new tour booking
 * @param data The booking data to create
 * @returns Success response with the created booking
 */
export async function createTourBooking(data: {
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

    const { count: currentBookings, error: bookingCountError } = await supabase
      .from("tour_bookings")
      .select("id", { count: "exact" })
      .eq("tour_id", tourId)
      .eq("date", date);

    if (bookingCountError) {
      return {
        success: false,
        message: bookingCountError.message,
      };
    }

    if ((currentBookings || 0) + spots > tour.slots) {
      return {
        success: false,
        message: "Not enough available slots.",
      };
    }

    const { data: booking, error: bookingError } = await supabase
      .from("tour_bookings")
      .insert({
        user_email: customer_email,
        tour_id: tourId,
        date,
        spots,
        total_price,
        status: "pending",
        first_name,
        last_name,
        phone_number,
      })
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
