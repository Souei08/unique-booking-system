import React, { useState, useEffect } from "react";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time?: string;
  color?: string;
  status?: "pending" | "completed" | "cancelled";
  max_slots?: number;
}

interface CalendarProps {
  events?: CalendarEvent[];
  onEventAdd?: (event: CalendarEvent) => void;
  onEventEdit?: (event: CalendarEvent) => void;
  onEventDelete?: (eventId: string) => void;
  onEventClick: (event: CalendarEvent) => void;
  selectedDate?: Date | null;
}

interface CalendarDayProps {
  date: number;
  isCurrentMonth: boolean;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  currentDate: Date;
  isSelected?: boolean;
}

const CalendarDay: React.FC<CalendarDayProps> = ({
  date,
  isCurrentMonth,
  events,
  onEventClick,
  currentDate,
  isSelected = false,
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
      } border-b border-gray-200 flex flex-col min-h-[120px] transition-all duration-300 hover:bg-gray-100 ${
        isSelected ? "bg-blue-50" : ""
      }`}
    >
      <span
        className={`text-xs font-semibold ${
          isToday && !isSelected
            ? "bg-indigo-600 text-white"
            : isSelected
            ? "bg-blue-500 text-white"
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
            onClick={() => {
              onEventClick(event);
            }}
            className="cursor-pointer p-2 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors duration-200"
            // title={`Available Slots: ${event.max_slots}`}
          >
            <span className="text-sm font-medium text-blue-700">
              {event.max_slots}
            </span>
          </button>

          // <button
          //   key={event.id}
          //   onClick={() => onEventClick(event)}
          //   className={`${event.color || "bg-blue-500"} ${
          //     event.status === "completed" ? "opacity-75" : ""
          //   } ${
          //     event.status === "cancelled" ? "opacity-50 line-through" : ""
          //   } text-white text-xs p-1 rounded truncate text-left hover:opacity-90 transition-opacity`}
          //   title={`${event.title} - ${event.time} (${
          //     event.status || "pending"
          //   })`}
          // >
          //   {event.time && <span className="mr-1">{event.time}</span>}
          //   {event.title}
          // </button>
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
  selectedDate = null,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // If selectedDate is provided, navigate to that month
  useEffect(() => {
    if (selectedDate) {
      setCurrentDate(
        new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
      );
    }
  }, [selectedDate]);

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
    // Set today to midnight to compare only the date part without time
    const todayWithoutTime = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Only show current month if it's the current month and year
    const isCurrentMonthAndYear =
      month === currentMonth && year === currentYear;

    // Get days from previous month (only if current month)
    const prevMonthDays = [];
    // Always use empty cells for previous month days
    for (let i = startingDay - 1; i >= 0; i--) {
      prevMonthDays.push({
        date: 0, // Empty cell
        isCurrentMonth: false,
        isPast: true,
      });
    }

    // Get days from current month
    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i);
      // Set dayDate to midnight to compare only the date part without time
      const dayDateWithoutTime = new Date(
        dayDate.getFullYear(),
        dayDate.getMonth(),
        dayDate.getDate()
      );

      // Only show days if it's current month or future months
      if (isCurrentMonthAndYear || dayDateWithoutTime >= todayWithoutTime) {
        currentMonthDays.push({
          date: i,
          isCurrentMonth: true,
          isPast:
            isCurrentMonthAndYear && dayDateWithoutTime < todayWithoutTime,
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
    // Return empty array for invalid dates or empty cells
    if (!date || date.getTime() === 0 || isNaN(date.getTime())) return [];

    const today = new Date();
    // Set both dates to midnight to compare only the date part without time
    const dateWithoutTime = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const todayWithoutTime = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    // Only return events for current or future dates
    if (dateWithoutTime < todayWithoutTime) return [];

    return events.filter((event) => {
      // Also normalize event dates for comparison
      const eventDate = new Date(event.date);
      const eventDateWithoutTime = new Date(
        eventDate.getFullYear(),
        eventDate.getMonth(),
        eventDate.getDate()
      );
      return eventDateWithoutTime.getTime() === dateWithoutTime.getTime();
    });
  };

  return (
    <section className="relative py-8 sm:p-8">
      <div className="w-full">
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
          <h5 className="text-xl leading-8 font-semibold text-gray-900 text-center flex-1">
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

              // Check if this day is the selected date
              const isSelected = selectedDate
                ? dayDate.getDate() === selectedDate.getDate() &&
                  dayDate.getMonth() === selectedDate.getMonth() &&
                  dayDate.getFullYear() === selectedDate.getFullYear()
                : false;

              return (
                <CalendarDay
                  key={index}
                  date={day.date}
                  isCurrentMonth={day.isCurrentMonth}
                  events={dayEvents}
                  onEventClick={onEventClick}
                  currentDate={currentDate}
                  isSelected={isSelected}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
