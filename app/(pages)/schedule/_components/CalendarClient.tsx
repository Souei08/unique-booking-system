"use client";

import { useState } from "react";
import { Calendar } from "@/app/_components/common/calendar";
import ScheduleForm from "@/app/_components/forms/schedule/ScheduleForm";
import EventModal from "./EventModal";
import { transformSchedulesToEvents } from "@/app/_lib/utils/schedule";
import type { CalendarEvent } from "./types";

interface CalendarClientProps {
  initialSchedules: any[];
  tourId: string;
}

export default function CalendarClient({
  initialSchedules,
  tourId,
}: CalendarClientProps) {
  const [events, setEvents] = useState<CalendarEvent[]>(
    transformSchedulesToEvents(initialSchedules)
  );
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"calendar" | "form">("calendar");

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

  return (
    <>
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
    </>
  );
}
