"use server";

import { createClient } from "@/supabase/server";

export interface Schedule {
  id?: string;
  tour_id: string;
  date: string;
  max_slots: number;
  start_time: string;
}

interface SuccessResponse {
  success: boolean;
  message?: string;
}

type Weekday =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

interface WeekdaySchedule {
  day: Weekday;
  time: string;
}

export const generateTourSchedules = async (
  tourId: string,
  weekdaySchedules: WeekdaySchedule[]
): Promise<SuccessResponse> => {
  const supabase = await createClient();

  try {
    const { data: tour, error: tourError } = await supabase
      .from("tours")
      .select("id, slots")
      .eq("id", tourId)
      .single();

    console.log("Tour data:", tour);
    console.log("Tour error:", tourError);

    if (tourError || !tour) throw new Error("Tour not found");

    const schedules: Schedule[] = [];
    const today = new Date();
    const currentYear = today.getFullYear();

    // Map weekday names to their corresponding numbers
    const weekdayMap: Record<Weekday, number> = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    // Generate schedules for the whole year
    const totalWeeks = 52; // weeks in a year

    for (let week = 1; week <= totalWeeks; week++) {
      weekdaySchedules.forEach(({ day, time }) => {
        const dayNumber = weekdayMap[day];
        const tourDate = getDateFromWeek(currentYear, week, dayNumber);

        // Only add future dates
        if (new Date(tourDate) >= today) {
          schedules.push({
            tour_id: tour.id,
            date: tourDate,
            max_slots: tour.slots,
            start_time: time,
          });
        }
      });
    }

    const { error: insertError } = await supabase
      .from("tour_schedules")
      .insert(schedules);
    if (insertError) throw insertError;

    console.log("Schedules created");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

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

export const getAvailableTourSchedules = async (
  tourId: string
): Promise<{ success: boolean; schedules?: Schedule[]; message?: string }> => {
  const supabase = await createClient();

  try {
    const { data: schedules, error } = await supabase
      .from("tour_schedules")
      .select("id, tour_id, date, max_slots, start_time")
      .eq("tour_id", tourId);

    if (error) throw error;

    return { success: true, schedules };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

const getDateFromWeek = (year: number, week: number, day: number): string => {
  const firstJan = new Date(year, 0, 1);
  const daysOffset = (week - 1) * 7 + (day - firstJan.getDay());
  return new Date(year, 0, 1 + daysOffset).toISOString().split("T")[0];
};
