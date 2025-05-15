import { createClient } from "@/supabase/client";
import { WeekdaySchedule } from "@/app/_features/booking/types/tour-schedule-types";

export async function saveTourSchedule(
  tourId: string,
  schedules: WeekdaySchedule[]
) {
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
        // start_time: s.start_time,
        available_time: s.available_time,
      }))
    );

    if (insertError) return { success: false, message: insertError.message };

    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
