import React, { useState } from "react";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time?: string;
  color?: string;
  status?: "pending" | "completed" | "cancelled";
}

interface CalendarProps {
  events?: CalendarEvent[];
  onEventAdd?: (event: CalendarEvent) => void;
  onEventEdit?: (event: CalendarEvent) => void;
  onEventDelete?: (eventId: string) => void;
  onEventClick: (event: CalendarEvent) => void;
}

interface CalendarDayProps {
  date: number;
  isCurrentMonth: boolean;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  currentDate: Date;
}

const CalendarDay: React.FC<CalendarDayProps> = ({
  date,
  isCurrentMonth,
  events,
  onEventClick,
  currentDate,
}) => {
  if (date === 0) {
    return <div className="p-3.5 bg-gray-50 border-b border-gray-200" />;
  }

  const today = new Date();
  const isToday =
    date === today.getDate() &&
    currentDate.getMonth() === today.getMonth() &&
    currentDate.getFullYear() === today.getFullYear();

  return (
    <div
      className={`p-3.5 ${
        !isCurrentMonth ? "bg-gray-50" : ""
      } border-b border-gray-200 flex flex-col min-h-[120px] transition-all duration-300 hover:bg-gray-100`}
    >
      <span
        className={`text-xs font-semibold ${
          isToday
            ? "bg-indigo-600 text-white"
            : isCurrentMonth
            ? "text-gray-900"
            : "text-gray-500"
        } flex items-center justify-center w-7 h-7 rounded-full mb-1`}
      >
        {date}
      </span>
      <div className="flex flex-col gap-1 overflow-y-auto max-h-[80px]">
        {events.map((event) => (
          <button
            key={event.id}
            onClick={() => onEventClick(event)}
            className={`${event.color || "bg-blue-500"} ${
              event.status === "completed" ? "opacity-75" : ""
            } ${
              event.status === "cancelled" ? "opacity-50 line-through" : ""
            } text-white text-xs p-1 rounded truncate text-left hover:opacity-90 transition-opacity`}
            title={`${event.title} - ${event.time} (${
              event.status || "pending"
            })`}
          >
            {event.time && <span className="mr-1">{event.time}</span>}
            {event.title}
          </button>
        ))}
      </div>
    </div>
  );
};

export const Calendar: React.FC<CalendarProps> = ({
  events = [],
  onEventAdd,
  onEventEdit,
  onEventDelete,
  onEventClick,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get calendar data for current month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    // Get current date for comparison
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Only show current month if it's the current month and year
    const isCurrentMonthAndYear =
      month === currentMonth && year === currentYear;

    // Get days from previous month (only if current month)
    const prevMonthDays = [];
    if (isCurrentMonthAndYear) {
      const prevMonth = new Date(year, month - 1, 0);
      const prevMonthLastDay = prevMonth.getDate();
      for (let i = startingDay - 1; i >= 0; i--) {
        prevMonthDays.push({
          date: prevMonthLastDay - i,
          isCurrentMonth: false,
          isPast: true,
        });
      }
    } else {
      // Fill with empty cells for non-current months
      for (let i = startingDay - 1; i >= 0; i--) {
        prevMonthDays.push({
          date: 0, // Empty cell
          isCurrentMonth: false,
          isPast: true,
        });
      }
    }

    // Get days from current month
    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i);

      // Only show days if it's current month or future months
      if (isCurrentMonthAndYear || dayDate > today) {
        currentMonthDays.push({
          date: i,
          isCurrentMonth: true,
          isPast: isCurrentMonthAndYear && dayDate < today,
        });
      } else {
        currentMonthDays.push({
          date: 0, // Empty cell
          isCurrentMonth: false,
          isPast: true,
        });
      }
    }

    // Get days from next month (only show for current month)
    const nextMonthDays = [];
    const remainingDays = 42 - (prevMonthDays.length + currentMonthDays.length);
    for (let i = 1; i <= remainingDays; i++) {
      nextMonthDays.push({
        date: 0, // Empty cell
        isCurrentMonth: false,
        isPast: false,
      });
    }

    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  // Restrict navigation to current and future months only
  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + (direction === "next" ? 1 : -1),
      1
    );

    // Only allow navigation to current or future months
    const today = new Date();
    const isCurrentOrFuture =
      newDate.getFullYear() > today.getFullYear() ||
      (newDate.getFullYear() === today.getFullYear() &&
        newDate.getMonth() >= today.getMonth());

    if (isCurrentOrFuture) {
      setCurrentDate(newDate);
    }
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  };

  const days = getDaysInMonth(currentDate);

  // Update getEventsForDay to only return events for valid dates
  const getEventsForDay = (date: Date) => {
    if (!date || date.getTime() === 0) return []; // Return empty array for empty cells

    const today = new Date();
    // Only return events for current or future dates
    if (date < today) return [];

    return events.filter(
      (event) => event.date.toDateString() === date.toDateString()
    );
  };

  const handleEventClick = (event: CalendarEvent) => {
    // Implementation of handleEventClick
  };

  return (
    <section className="relative py-8 sm:p-8">
      <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 xl:px-14">
        {/* Calendar Header */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <button
            className="text-gray-500 rounded transition-all duration-300 hover:bg-gray-100 hover:text-gray-900"
            onClick={() => navigateMonth("prev")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M10.0002 11.9999L6 7.99971L10.0025 3.99719"
                stroke="currentcolor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h5 className="text-xl leading-8 font-semibold text-gray-900 text-center flex-grow">
            {formatMonth(currentDate)}
          </h5>
          <button
            className="text-gray-500 rounded transition-all duration-300 hover:bg-gray-100 hover:text-gray-900"
            onClick={() => navigateMonth("next")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M6.00236 3.99707L10.0025 7.99723L6 11.9998"
                stroke="currentcolor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="border border-gray-200">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 divide-x divide-gray-200 border-b border-gray-200">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (day, index) => (
                <div
                  key={day}
                  className="p-3.5 flex flex-col sm:flex-row items-center justify-between"
                >
                  <span className="text-sm font-medium text-gray-500">
                    {day}
                  </span>
                </div>
              )
            )}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 divide-x divide-gray-200">
            {days.map((day, index) => {
              const dayDate = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                day.date
              );
              const dayEvents = getEventsForDay(dayDate);

              return (
                <CalendarDay
                  key={index}
                  date={day.date}
                  isCurrentMonth={day.isCurrentMonth}
                  events={dayEvents}
                  onEventClick={onEventClick}
                  currentDate={currentDate}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
