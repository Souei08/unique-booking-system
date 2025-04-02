"use server";

import { addDays, format } from "date-fns";
import { createClient } from "@/supabase/server";

export interface Schedule {
  id?: string;
  tour_id: string;
  date: Date;
  max_slots: number;
  start_time: string;
}

interface SuccessResponse {
  success: boolean;
  message?: string;
}

export const saveRecurringSchedules = async (
  tourId: string,
  schedules: { weekday: string; start_time: string }[]
) => {
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
};

export const getRecurringSchedules = async (tourId: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tour_schedules")
    .select("weekday, start_time")
    .eq("tour_id", tourId);

  if (error) return [];

  return data.map((s) => ({
    weekday: s.weekday,
    start_time: s.start_time,
  }));
};

export const getAvailableTourSchedules = async (
  tourId: string,
  daysAhead = 365
) => {
  const supabase = await createClient();

  const { data: rules, error } = await supabase
    .from("tour_schedules")
    .select("weekday, start_time")
    .eq("tour_id", tourId);

  if (error || !rules) {
    return {
      success: false,
      message: error?.message || "No recurring schedules found",
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
  const futureDates: {
    id: string;
    tour_id: string;
    date: string;
    start_time: string;
    max_slots: number;
  }[] = [];

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
          date: date.toISOString().split("T")[0],
          start_time: rule.start_time,
          max_slots: 8,
        });
      }
    });
  }

  return { success: true, schedules: futureDates };
};

// ===================================================================================

export const bookTour = async (
  userId: string,
  scheduleId: string,
  totalPrice: number
): Promise<SuccessResponse> => {
  const supabase = await createClient();

  try {
    const { data: schedule, error: scheduleError } = await supabase
      .from("tour_schedules")
      .select("id, max_slots")
      .eq("id", scheduleId)
      .single();

    if (scheduleError || !schedule) throw new Error("Schedule not found");

    const { count: bookingsCount } = await supabase
      .from("tour_bookings")
      .select("id", { count: "exact" })
      .eq("schedule_id", scheduleId);

    if (!bookingsCount || bookingsCount >= schedule.max_slots)
      throw new Error("No available slots");

    const { error: insertError } = await supabase.from("tour_bookings").insert({
      user_id: userId,
      schedule_id: scheduleId,
      total_price: totalPrice,
      status: "pending",
    });

    if (insertError) throw insertError;

    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};
