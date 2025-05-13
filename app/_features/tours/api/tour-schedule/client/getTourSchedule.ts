import { createClient } from "@/supabase/client";

export async function getTourSchedule(tourId: string) {
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
