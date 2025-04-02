import { createClient } from "@/supabase/server";
import { addDays } from "date-fns";

interface Schedule {
  weekday: string;
  start_time: string;
}

export const schedulesService = {
  async saveRecurringSchedules(tourId: string, schedules: Schedule[]) {
    try {
      const supabase = await createClient();

      // Remove existing rules first
      const { error: deleteError } = await supabase
        .from("tour_schedules")
        .delete()
        .eq("tour_id", tourId);

      if (deleteError) throw new Error(deleteError.message);

      // Insert new ones
      const { error: insertError } = await supabase
        .from("tour_schedules")
        .insert(
          schedules.map((s) => ({
            tour_id: tourId,
            weekday: s.weekday,
            start_time: s.start_time,
          }))
        );

      if (insertError) throw new Error(insertError.message);

      return { success: true };
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  async getRecurringSchedules(tourId: string) {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from("tour_schedules")
        .select("weekday, start_time")
        .eq("tour_id", tourId);

      if (error) throw new Error(error.message);

      return data.map((s) => ({
        weekday: s.weekday,
        start_time: s.start_time,
      }));
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  async getAvailableSchedules(tourId: string, daysAhead = 365) {
    try {
      const supabase = await createClient();

      const { data: rules, error } = await supabase
        .from("tour_schedules")
        .select("weekday, start_time")
        .eq("tour_id", tourId);

      if (error) throw new Error(error.message);

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
      const futureDates: any[] = [];

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

      return futureDates;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  async bookTour(userId: string, scheduleId: string, totalPrice: number) {
    try {
      const supabase = await createClient();

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

      const { error: insertError } = await supabase
        .from("tour_bookings")
        .insert({
          user_id: userId,
          schedule_id: scheduleId,
          total_price: totalPrice,
          status: "pending",
        });

      if (insertError) throw insertError;

      return { success: true };
    } catch (error: any) {
      throw new Error(error.message);
    }
  },
};
