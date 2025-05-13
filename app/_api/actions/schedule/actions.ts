"use server";

import { addDays, format } from "date-fns";
import { createClient } from "@/supabase/server";
import { ScheduleRule, SuccessResponse } from "../types";

// Define the Schedule interface
interface Schedule {
  id: string;
  tour_id: string;
  date: Date;
  start_time: string;
  max_slots: number;
}

/**
 * Save recurring schedules for a tour
 * @param tourId The ID of the tour
 * @param schedules The schedules to save
 * @returns Success response
 */
export async function saveRecurringSchedules(
  tourId: string,
  schedules: ScheduleRule[]
): Promise<SuccessResponse> {
  try {
    const supabase = await createClient();

    // Remove existing rules first
    const { error: deleteError } = await supabase
      .from("tour_schedules")
      .delete()
      .eq("tour_id", tourId);

    if (deleteError) return { success: false, message: deleteError.message };

    // Insert new ones
    const { error: insertError } = await supabase.from("tour_schedules").insert(
      schedules.map((s) => ({
        tour_id: tourId,
        weekday: s.weekday,
        start_time: s.start_time,
      }))
    );

    if (insertError) return { success: false, message: insertError.message };

    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Get recurring schedules for a tour
 * @param tourId The ID of the tour
 * @returns Array of schedule rules
 */
export async function getRecurringSchedules(tourId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("tour_schedules")
      .select("weekday, available_time")
      .eq("tour_id", tourId);

    if (error) return [];

    return data.map((s) => ({
      weekday: s.weekday,
      available_time: s.available_time,
    }));
  } catch (error: any) {
    console.error("Error getting recurring schedules:", error);
    return [];
  }
}

/**
 * Get available tour schedules for a specific period
 * @param tourId The ID of the tour
 * @param daysAhead Number of days ahead to generate schedules for
 * @returns Object with success status and schedules
 */
export async function getAvailableTourSchedules(
  tourId: string,
  daysAhead = 365
) {
  try {
    const supabase = await createClient();

    const { data: rules, error: rulesError } = await supabase
      .from("tour_schedules")
      .select("weekday, start_time")
      .eq("tour_id", tourId);

    if (rulesError || !rules) {
      return {
        success: false,
        message: rulesError?.message || "No recurring schedules found",
      };
    }

    const { data: tour, error: tourError } = await supabase
      .from("tours")
      .select("slots")
      .eq("id", tourId)
      .single();

    if (tourError || !tour) {
      return {
        success: false,
        message: tourError?.message || "Tour not found",
      };
    }

    const weekdayMap: Record<string, number> = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    const today = new Date();
    const futureDates: Schedule[] = [];

    for (let i = 0; i <= daysAhead; i++) {
      const date = addDays(today, i);
      const weekday = date.getDay();

      rules.forEach((rule) => {
        if (weekdayMap[rule.weekday] === weekday) {
          futureDates.push({
            id: `${tourId}-${date.toISOString().split("T")[0]}-${
              rule.start_time
            }`,
            tour_id: tourId,
            date: date,
            start_time: rule.start_time,
            max_slots: tour.slots,
          });
        }
      });
    }

    return { success: true, schedules: futureDates };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Get remaining slots for a tour on a specific date/time
 * @param tourId The ID of the tour
 * @param date The calendar date (YYYY-MM-DD)
 * @param startTime Time in HH:mm format
 */
export async function getRemainingSlots(
  tourId: string,
  date: string,
  startTime: string
): Promise<{ success: boolean; remaining: number; message?: string }> {
  try {
    const supabase = await createClient();
    const weekday = format(new Date(date), "EEEE");

    // First get base slots from the tour
    const { data: tour, error: tourError } = await supabase
      .from("tours")
      .select("slots")
      .eq("id", tourId)
      .single();

    if (tourError || !tour) {
      return { success: false, remaining: 0, message: "Tour not found" };
    }

    const defaultSlots = tour.slots;

    // Check if a rule exists for the given weekday + time
    const { data: rule, error: ruleError } = await supabase
      .from("tour_schedules")
      .select("id")
      .eq("tour_id", tourId)
      .eq("weekday", weekday)
      // .eq("start_time", startTime)
      .maybeSingle();

    if (!rule) {
      // If no recurring rule exists, just return full default capacity
      return { success: true, remaining: defaultSlots };
    }

    // Get the sum of slots booked for this tour on this date
    const { data: bookings, error: bookingError } = await supabase
      .from("tour_bookings")
      .select("slots")
      .eq("tour_id", tourId)
      .eq("date", date);
    // .eq("status", "confirmed"); // Only count confirmed bookings

    if (bookingError) {
      return { success: false, remaining: 0, message: bookingError.message };
    }

    // Sum up all the slots booked
    const bookedSlots = bookings.reduce(
      (sum, booking) => sum + booking.slots,
      0
    );
    const remaining = defaultSlots - bookedSlots;

    return {
      success: true,
      remaining: Math.max(remaining, 0),
    };
  } catch (error: any) {
    return {
      success: false,
      remaining: 0,
      message: error.message,
    };
  }
}
