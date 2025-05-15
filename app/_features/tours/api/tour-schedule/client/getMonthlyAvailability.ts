import { createClient } from "@/supabase/client";

interface MonthlyAvailability {
  date: string;
  available_slots: number;
  total_booked_slots: number;
}

export async function getMonthlyAvailability(
  tourId: string,
  month: number,
  year: number
) {
  try {
    const supabase = await createClient();

    // Get the first and last day of the month
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    // Format dates for the query
    const startDate = firstDay.toISOString().split("T")[0];
    const endDate = lastDay.toISOString().split("T")[0];

    // Get all bookings for the specified month
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("booking_date, selected_time, slots")
      .eq("tour_id", tourId)
      .gte("booking_date", startDate)
      .lte("booking_date", endDate);

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);
      return [];
    }

    // Get tour schedule to know available times
    const { data: schedule, error: scheduleError } = await supabase
      .from("tour_schedules")
      .select("weekday, available_time")
      .eq("tour_id", tourId);

    if (scheduleError) {
      console.error("Error fetching tour schedule:", scheduleError);
      return [];
    }

    // Create a map of available slots for each date
    const availabilityMap = new Map<string, MonthlyAvailability>();

    // Initialize all dates in the month
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      const weekday = d.getDay(); // 0-6, where 0 is Sunday

      // Check if this weekday is available in the schedule
      const isAvailableDay = schedule.some((s) => s.weekday === weekday);

      if (isAvailableDay) {
        availabilityMap.set(dateStr, {
          date: dateStr,
          available_slots: 0, // Will be calculated based on bookings
          total_booked_slots: 0,
        });
      }
    }

    // Calculate booked slots for each date
    bookings.forEach((booking) => {
      const dateStr = booking.booking_date;
      const existing = availabilityMap.get(dateStr);

      if (existing) {
        existing.total_booked_slots += booking.slots;
        availabilityMap.set(dateStr, existing);
      }
    });

    // Convert map to array and calculate available slots
    return Array.from(availabilityMap.values()).map((entry) => ({
      ...entry,
      available_slots: Math.max(0, 20 - entry.total_booked_slots), // Assuming max 20 slots per day
    }));
  } catch (error: any) {
    console.error("Error getting monthly availability:", error);
    return [];
  }
}
