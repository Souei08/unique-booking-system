"use client";

import { useState } from "react";

import { Calendar } from "@/app/_components/calendar/calendar";
import BookingSummary from "@/app/_components/scheduler/BookingSummary";

import { transformSchedulesToEvents } from "@/app/_lib/utils/schedule";
import { getRemainingSlots } from "@/app/actions/schedule/actions";

import type { CalendarEvent } from "./types";
import { ScheduleData } from "./ScheduleView";

interface CalendarClientProps {
  initialSchedules: any[];
  tourId: string;
  rate: number;
  onSubmit?: (data: ScheduleData) => void;
  showSubmitButton?: boolean;
}

export default function CalendarClient({
  initialSchedules,
  tourId,
  rate,
  onSubmit,
  showSubmitButton = false,
}: CalendarClientProps) {
  // Transform the schedules and ensure dates are properly parsed
  const events: CalendarEvent[] = (() => {
    // Ensure we have valid date strings before parsing
    const schedulesWithValidDates = initialSchedules.map((schedule) => ({
      ...schedule,
      date:
        typeof schedule.date === "string"
          ? schedule.date
          : new Date(schedule.date).toISOString().split("T")[0],
    }));
    return transformSchedulesToEvents(schedulesWithValidDates);
  })();

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [remainingSlots, setRemainingSlots] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEventClick = async (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsLoading(true);
    try {
      // Extract date and time from the event
      const dateStr =
        event.date instanceof Date
          ? event.date.toISOString().split("T")[0]
          : event.date;

      const timeStr = event.time || "";

      const result = await getRemainingSlots(tourId, dateStr, timeStr);
      if (result.success && result.remaining !== undefined) {
        setRemainingSlots(result.remaining);
      } else {
        console.error("Error fetching remaining slots:", result.message);
        setRemainingSlots(null);
      }
    } catch (error) {
      console.error("Error fetching remaining slots:", error);
      setRemainingSlots(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!selectedEvent || !remainingSlots) return;

    try {
      if (onSubmit) {
        const scheduleData: ScheduleData = {
          tourId,
          rate,
          schedules: [selectedEvent],
        };
        onSubmit(scheduleData);
      } else {
        // Default behavior if no onSubmit handler is provided
        alert("Proceeding to checkout...");
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("An error occurred during checkout. Please try again.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1">
        <Calendar
          events={events}
          onEventAdd={() => {}}
          onEventEdit={() => {}}
          onEventDelete={() => {}}
          onEventClick={handleEventClick}
        />
      </div>
      <div className="lg:w-96">
        <BookingSummary
          selectedEvent={selectedEvent}
          rate={rate}
          onCheckout={handleCheckout}
          remainingSlots={remainingSlots}
          isLoading={isLoading}
          showSubmitButton={showSubmitButton}
        />
      </div>
    </div>
  );
}
