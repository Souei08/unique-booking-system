"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/app/components/Calendar";
import { getAvailableTourSchedules } from "@/app/actions/schedule/actions";

// Add Schedule interface
interface Schedule {
  id: string;
  tour_id: string;
  date: string;
  max_slots: number;
  start_time: string;
}

// Enhanced CalendarEvent interface
interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time?: string;
  description?: string;
  color?: string; // For event differentiation
  status?: "pending" | "completed" | "cancelled"; // Add status for event management
  max_slots?: number; // Add this for tour schedule
  tour_id?: string; // Add this for reference
}

// Create an EventModal component for handling event actions
interface EventModalProps {
  event: CalendarEvent;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (id: string) => void;
  onStatusChange: (
    event: CalendarEvent,
    status: CalendarEvent["status"]
  ) => void;
}

const EventModal = ({
  event,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
}: EventModalProps) => {
  if (!isOpen) return null;

  // Format date and time for display
  const formatDateTime = (date: Date) => {
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  const { date, time } = formatDateTime(event.date);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">{event.title}</h2>
        <div className="space-y-4">
          <div>
            <p className="text-gray-600">Time: {time}</p>
            <p className="text-gray-600">Date: {date}</p>
            {event.max_slots && (
              <p className="text-gray-600">
                Available Slots: {event.max_slots}
              </p>
            )}
            {event.description && (
              <p className="text-gray-600">Description: {event.description}</p>
            )}
            <p className="text-gray-600">Status: {event.status || "pending"}</p>
          </div>

          {/* Only show status changes for non-tour events or if user has permission */}
          {!event.tour_id && (
            <div className="space-y-2">
              <h3 className="font-medium">Change Status:</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => onStatusChange(event, "pending")}
                  className="px-3 py-1 text-sm rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                >
                  Pending
                </button>
                <button
                  onClick={() => onStatusChange(event, "completed")}
                  className="px-3 py-1 text-sm rounded bg-green-100 text-green-700 hover:bg-green-200"
                >
                  Complete
                </button>
                <button
                  onClick={() => onStatusChange(event, "cancelled")}
                  className="px-3 py-1 text-sm rounded bg-red-100 text-red-700 hover:bg-red-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          {!event.tour_id && (
            <button
              onClick={() => onDelete(event.id)}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
            >
              Delete
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tour schedules
  const fetchTourSchedules = async (tourId: string) => {
    try {
      setLoading(true);
      const response = await getAvailableTourSchedules(tourId);

      if (response.success && response.schedules) {
        // Convert Schedule objects to CalendarEvent objects with proper date handling
        const calendarEvents: CalendarEvent[] = response.schedules.map(
          (schedule) => {
            // Parse the date string and handle timezone properly
            const [year, month, day] = schedule.date.split("-").map(Number);
            const [hours, minutes] = schedule.start_time.split(":").map(Number);

            // Create date object (month is 0-based in JavaScript)
            const eventDate = new Date(year, month - 1, day, hours, minutes);

            return {
              id: schedule.id!,
              title: `Tour Schedule`, // You can customize this
              date: eventDate,
              time: schedule.start_time,
              color: "bg-blue-500",
              status: "pending",
              max_slots: schedule.max_slots,
              tour_id: schedule.tour_id,
              description: `Available Slots: ${schedule.max_slots}`,
            };
          }
        );

        // Sort events by date and time
        calendarEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

        setEvents(calendarEvents);
      } else {
        setError(response.message || "Failed to fetch schedules");
      }
    } catch (err) {
      setError("Failed to fetch tour schedules");
      console.error("Error fetching schedules:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch schedules when component mounts
  useEffect(() => {
    // Replace 'your-tour-id' with actual tour ID
    fetchTourSchedules("2b40195e-fef5-4594-a163-8e14b590a1eb");
  }, []);

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle event click
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  // Handle status change
  const handleStatusChange = (
    event: CalendarEvent,
    newStatus: CalendarEvent["status"]
  ) => {
    const updatedEvent = { ...event, status: newStatus };
    handleEventEdit(updatedEvent);
  };

  // Format time for display
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Enhanced event addition with proper date handling
  const handleEventAdd = (newEvent: CalendarEvent) => {
    // Ensure proper date object creation
    const eventDate = new Date(newEvent.date);

    // Check if the time slot is available
    const eventsOnSameDate = events.filter((event) => {
      const sameDate = event.date.toDateString() === eventDate.toDateString();
      const sameTime = event.time === newEvent.time;
      return sameDate && sameTime;
    });

    if (eventsOnSameDate.length > 0) {
      alert(
        "There's already an event scheduled at this time. Please choose a different time."
      );
      return;
    }

    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-red-500",
      "bg-yellow-500",
    ];

    const newEventWithColor = {
      ...newEvent,
      date: eventDate, // Use the properly created date object
      time: formatTime(eventDate), // Format time consistently
      color:
        newEvent.color || colors[Math.floor(Math.random() * colors.length)],
    };

    setEvents((prevEvents) => [
      ...prevEvents,
      newEventWithColor as CalendarEvent,
    ]);
  };

  // Enhanced event editing with proper date handling
  const handleEventEdit = (updatedEvent: CalendarEvent) => {
    const eventDate = new Date(updatedEvent.date);

    const conflictingEvents = events.filter((event) => {
      const sameDate = event.date.toDateString() === eventDate.toDateString();
      const sameTime = event.time === updatedEvent.time;
      const differentEvent = event.id !== updatedEvent.id;
      return sameDate && sameTime && differentEvent;
    });

    if (conflictingEvents.length > 0) {
      alert(
        "There's already an event scheduled at this time. Please choose a different time."
      );
      return;
    }

    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === updatedEvent.id
          ? { ...updatedEvent, date: eventDate, time: formatTime(eventDate) }
          : event
      )
    );
  };

  // Add event deletion
  const handleEventDelete = (eventId: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== eventId)
      );
      setIsModalOpen(false);
    }
  };

  // Add loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Loading schedules...</div>
      </main>
    );
  }

  // Add error state
  if (error) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Calendar
        events={events}
        onEventAdd={handleEventAdd}
        onEventEdit={handleEventEdit}
        onEventDelete={handleEventDelete}
        onEventClick={handleEventClick}
      />

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
    </main>
  );
}
