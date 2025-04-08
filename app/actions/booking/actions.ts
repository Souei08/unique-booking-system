"use server";

import { createClient } from "@/supabase/server";
import { Booking, SuccessResponse } from "../types";

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
}): Promise<SuccessResponse> {
  const supabase = await createClient();
  const { tourId, date, start_time, spots, total_price } = data;

  if (!tourId || !date || !start_time || !spots || !total_price) {
    return { success: false, message: "Missing fields" };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    // Get max slots from tour_schedules based on weekday + time
    const scheduleDay = new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
    });
    const { data: scheduleRule, error: ruleError } = await supabase
      .from("tour_schedules")
      .select("max_slots")
      .eq("tour_id", tourId)
      .eq("weekday", scheduleDay)
      .eq("start_time", start_time)
      .single();

    if (ruleError || !scheduleRule) {
      return {
        success: false,
        message: "Tour schedule not found for selected day/time.",
      };
    }

    const { count: currentBookings } = await supabase
      .from("tour_bookings")
      .select("id", { count: "exact" })
      .eq("tour_id", tourId)
      .eq("date", date)
      .eq("start_time", start_time);

    if ((currentBookings || 0) + spots > scheduleRule.max_slots) {
      return {
        success: false,
        message: "Not enough available slots.",
      };
    }

    const { data: booking, error: bookingError } = await supabase
      .from("tour_bookings")
      .insert({
        user_id: user.id,
        tour_id: tourId,
        date,
        start_time,
        total_price,
        status: "pending",
      })
      .select()
      .single();

    if (bookingError) throw bookingError;

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

/**
 * Get all bookings for the current user
 * @returns Array of bookings
 */
export async function getUserBookings(): Promise<Booking[]> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("tour_bookings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching bookings:", error);
    throw new Error("Failed to fetch bookings");
  }

  return data;
}

/**
 * Get all bookings
 * @returns Array of all bookings
 */
export async function getAllBookings(): Promise<Booking[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tour_bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all bookings:", error);
    throw new Error("Failed to fetch all bookings");
  }

  return data;
}

/**
 * Get a booking by ID
 * @param id The ID of the booking to get
 * @returns The booking
 */
export async function getBookingById(id: string): Promise<Booking | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tour_bookings")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching booking:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching booking:", error);
    return null;
  }
}

/**
 * Cancel a booking
 * @param id The ID of the booking to cancel
 * @returns Success response
 */
export async function cancelBooking(id: string): Promise<SuccessResponse> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("tour_bookings")
      .update({ status: "cancelled" })
      .eq("id", id);

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
