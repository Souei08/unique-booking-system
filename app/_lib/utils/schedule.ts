import type { CalendarEvent } from "@/app/(pages)/schedule/_components/types";

export function transformSchedulesToEvents(schedules: any[]): CalendarEvent[] {
  return schedules
    .map((schedule) => {
      const [year, month, day] = schedule.date.split("-").map(Number);
      const [hours, minutes] = schedule.start_time.split(":").map(Number);
      const eventDate = new Date(year, month - 1, day, hours, minutes);

      // Ensure the status is one of the allowed types
      const validStatuses: Array<"pending" | "completed" | "cancelled"> = [
        "pending",
        "completed",
        "cancelled",
      ];
      const status = validStatuses.includes(schedule.status)
        ? schedule.status
        : "pending";

      return {
        id: schedule.id,
        title: `Tour Schedule`,
        date: eventDate,
        time: schedule.start_time,
        color: "bg-blue-500",
        status: status,
        max_slots: schedule.max_slots,
        tour_id: schedule.tour_id,
        description: `Available Slots: ${schedule.max_slots}`,
      };
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}
