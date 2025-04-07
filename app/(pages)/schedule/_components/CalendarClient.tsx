"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "@/app/_components/common/calendar";
import Button from "@/app/_components/common/button/index";
import Input from "@/app/_components/common/input/index";
import Label from "@/app/_components/common/label/index";
import { Schedule } from "@/app/_lib/types/schedules";
import ScheduleForm from "@/app/_components/forms/schedule/ScheduleForm";
import EventModal from "./EventModal";
import { transformSchedulesToEvents } from "@/app/_lib/utils/schedule";
import type { CalendarEvent } from "./types";
import { getRecurringSchedules } from "@/app/actions/schedule/actions";
interface CalendarClientProps {
  initialSchedules: Schedule[];
  tourId: string;
}

export default function CalendarClient({
  initialSchedules,
  tourId,
}: CalendarClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null
  );
  const [numberOfSpots, setNumberOfSpots] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>(
    transformSchedulesToEvents(initialSchedules)
  );
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"calendar" | "form">("calendar");

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      try {
        const recurringSchedules = await getRecurringSchedules(tourId);
        // Transform recurring schedules into Schedule objects
        const transformedSchedules: Schedule[] = recurringSchedules.map(
          (rs, index) => ({
            id: `temp-${index}`,
            tour_id: tourId,
            start_time: rs.start_time,
            end_time: new Date(
              new Date(rs.start_time).getTime() + 2 * 60 * 60 * 1000
            ).toISOString(), // 2 hours duration
            available_slots: 10,
            price: 0, // Default price, should be replaced with actual tour price
            status: "active",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        );
        setSchedules(transformedSchedules);
      } catch (error) {
        console.error("Error fetching schedules:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [tourId]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      // Find schedules for the selected date
      const dateSchedules = schedules.filter(
        (schedule) =>
          new Date(schedule.start_time).toDateString() === date.toDateString()
      );
      setSelectedSchedule(dateSchedules.length > 0 ? dateSchedules[0] : null);
    } else {
      setSelectedSchedule(null);
    }
  };

  const handleContinueToCheckout = () => {
    if (selectedSchedule) {
      // Redirect to checkout page with booking details
      router.push(
        `/checkout?tourId=${tourId}&scheduleId=${selectedSchedule.id}&spots=${numberOfSpots}`
      );
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleStatusChange = (
    event: CalendarEvent,
    newStatus: CalendarEvent["status"]
  ) => {
    const updatedEvent = { ...event, status: newStatus };
    handleEventEdit(updatedEvent);
  };

  const handleEventEdit = (updatedEvent: CalendarEvent) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
  };

  const handleEventDelete = (eventId: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== eventId)
      );
      setIsModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Select a Date</h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose a date to see available time slots.
        </p>
        <div className="mt-4">
          <Calendar events={events} onEventClick={handleEventClick} />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium text-gray-900">Booking Details</h2>
        <p className="mt-1 text-sm text-gray-500">
          Select a time slot and specify the number of spots.
        </p>

        {selectedDate ? (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-900">
              Available Time Slots for {selectedDate.toLocaleDateString()}
            </h3>
            <div className="mt-2 space-y-2">
              {schedules
                .filter(
                  (schedule) =>
                    new Date(schedule.start_time).toDateString() ===
                    selectedDate.toDateString()
                )
                .map((schedule) => (
                  <div
                    key={schedule.id}
                    className={`cursor-pointer rounded-md border p-3 ${
                      selectedSchedule?.id === schedule.id
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200"
                    }`}
                    onClick={() => setSelectedSchedule(schedule)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(schedule.start_time).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {schedule.available_slots} spots available
                        </p>
                      </div>
                      {selectedSchedule?.id === schedule.id && (
                        <div className="h-5 w-5 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="h-3 w-3"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>

            {selectedSchedule && (
              <div className="mt-6">
                <Label htmlFor="spots">Number of Spots</Label>
                <Input
                  id="spots"
                  type="number"
                  min={1}
                  max={selectedSchedule.available_slots}
                  value={numberOfSpots}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNumberOfSpots(parseInt(e.target.value) || 1)
                  }
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {selectedSchedule.available_slots} spots available
                </p>

                <Button
                  onClick={handleContinueToCheckout}
                  className="mt-6 w-full"
                  disabled={!selectedSchedule}
                >
                  Continue to Checkout
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 rounded-md border border-gray-200 p-4 text-center">
            <p className="text-sm text-gray-500">
              Please select a date to see available time slots.
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-4 mb-6 border-b">
        <button
          className={`pb-2 px-4 font-medium border-b-2 transition-all duration-300 ${
            activeTab === "calendar"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-blue-600"
          }`}
          onClick={() => setActiveTab("calendar")}
        >
          Calendar View
        </button>
        <button
          className={`pb-2 px-4 font-medium border-b-2 transition-all duration-300 ${
            activeTab === "form"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-blue-600"
          }`}
          onClick={() => setActiveTab("form")}
        >
          Manage Recurring Schedule
        </button>
      </div>

      {activeTab === "calendar" && (
        <Calendar
          events={events}
          onEventAdd={() => {}}
          onEventEdit={handleEventEdit}
          onEventDelete={handleEventDelete}
          onEventClick={handleEventClick}
        />
      )}

      {activeTab === "form" && (
        <ScheduleForm
          tourId={tourId}
          //   onSubmitSuccess={() => setActiveTab("calendar")}
        />
      )}

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEvent(null);
          }}
          onEdit={handleEventEdit}
          onDelete={handleEventDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
