"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar } from "@/app/_components/calendar/calendar";
import { transformSchedulesToEvents } from "@/app/_lib/utils/schedule";
import type { CalendarEvent } from "../../(test)/schedule/_components/types";

import { getRemainingSlots } from "@/app/_api/actions/schedule/actions";

interface CalendarClientProps {
  initialSchedules: any[];
  tourId: string;
  rate: number;
  onSelectionChange?: (selection: {
    event: CalendarEvent | null;
    remainingSlots: number | null;
  }) => void;
  showBookingSummary?: boolean;
  children: (props: {
    onCheckout: () => void;
    rate: number;
    selectedEvent: CalendarEvent | null;
    remainingSlots: number | null;
    isLoading: boolean;
  }) => React.ReactNode;
  defaultSelectedDate?: Date | null;
}

export default function CalendarClient({
  initialSchedules,
  tourId,
  rate,
  onSelectionChange,
  showBookingSummary = true,
  children,
  defaultSelectedDate,
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    defaultSelectedDate || null
  );

  // Create a memoized function to notify parent component when selection changes
  const notifySelectionChange = useCallback(() => {
    if (onSelectionChange) {
      onSelectionChange({
        event: selectedEvent,
        remainingSlots,
      });
    }
  }, [selectedEvent, remainingSlots, onSelectionChange]);

  // Only call the notification function when selection changes
  useEffect(() => {
    notifySelectionChange();
  }, [notifySelectionChange]);

  const handleEventClick = useCallback(
    async (event: CalendarEvent) => {
      setSelectedEvent(event);
      setIsLoading(true);

      // Set the selected date when an event is clicked
      if (event.date instanceof Date) {
        setSelectedDate(event.date);
      } else {
        // If date is not a Date object, create a new Date from it
        setSelectedDate(new Date(event.date));
      }

      try {
        // Extract date and time from the event
        const dateStr =
          event.date instanceof Date
            ? event.date.toLocaleDateString("en-CA")
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
    },
    [tourId]
  );

  const handleCheckout = async () => {
    if (!selectedEvent || !remainingSlots) return;

    try {
      // Here you would typically redirect to a checkout page or handle the booking process
      // For now, we'll just show an alert
      alert("Proceeding to checkout...");
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
          selectedDate={selectedDate}
        />
      </div>
      {showBookingSummary && (
        <div className="lg:w-96">
          {children({
            selectedEvent,
            rate,
            onCheckout: handleCheckout,
            remainingSlots,
            isLoading,
          })}
        </div>
      )}
    </div>
  );
}
