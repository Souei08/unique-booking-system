import { createClient } from "@/supabase/client";
import { getRemainingSlots } from "@/app/_features/booking/api/getRemainingSlots";

interface DateAvailability {
  date: string;
  isAvailable: boolean;
  availableSlots: number;
  availableTimes: {
    time: string;
    remainingSlots: number;
  }[];
}

export async function getMonthlyAvailability(
  tourId: string,
  month: number,
  year: number
): Promise<DateAvailability[]> {
  try {
    const supabase = await createClient();

    // Get the first and last day of the month
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    // Get tour schedule
    const { data: schedule, error: scheduleError } = await supabase
      .from("tour_schedules")
      .select("weekday, available_time")
      .eq("tour_id", tourId);

    if (scheduleError) {
      console.error("Error fetching tour schedule:", scheduleError);
      return [];
    }

    const availability: DateAvailability[] = [];

    // Check each date in the month
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      const weekday = d.getDay(); // 0-6, where 0 is Sunday
      const weekdayName = d.toLocaleDateString("en-US", { weekday: "long" });

      // Find schedule for this weekday
      const daySchedule = schedule.find(
        (s) => s.weekday.toLowerCase() === weekdayName.toLowerCase()
      );

      if (daySchedule) {
        const availableTimes = JSON.parse(daySchedule.available_time);
        const timeSlots = await Promise.all(
          availableTimes.map(async (time: { start_time: string }) => {
            const remainingSlots = await getRemainingSlots(
              tourId,
              dateStr,
              time.start_time
            );
            return {
              time: time.start_time,
              remainingSlots,
            };
          })
        );

        // Check if any time slots are available
        const hasAvailableSlots = timeSlots.some(
          (slot) => slot.remainingSlots > 0
        );
        const totalAvailableSlots = timeSlots.reduce(
          (sum, slot) => sum + slot.remainingSlots,
          0
        );

        availability.push({
          date: dateStr,
          isAvailable: hasAvailableSlots,
          availableSlots: totalAvailableSlots,
          availableTimes: timeSlots,
        });
      }
    }

    return availability;
  } catch (error: any) {
    console.error("Error getting monthly availability:", error);
    return [];
  }
}
