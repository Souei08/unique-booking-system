"use client";

import { useSearchParams } from "next/navigation";
import { Calendar } from "./calendar-v2";
import { useState, useEffect } from "react";
import {
  CalendarDate,
  DateValue,
  getLocalTimeZone,
  today,
  parseDate,
} from "@internationalized/date";

interface iAppProps {
  daysofWeek: { day: string; isActive: boolean }[];
  setSelectedDate: (date: DateValue) => void;
  onMonthChange: (month: string, year: string) => void;
  disabledDates?: string[];
  title?: string;
}

export function RenderCalendar({
  daysofWeek,
  setSelectedDate,
  onMonthChange,
  disabledDates = [],
  title,
}: iAppProps) {
  const searchParams = useSearchParams();

  const [date, setDate] = useState<CalendarDate | null>(() => {
    const dateParam = searchParams.get("date");
    return dateParam ? parseDate(dateParam) : null;
  });

  const handleMonthChange = (visibleDate: DateValue) => {
    const currentDate = visibleDate.toDate("America/Grand_Turk");
    const currentMonth = currentDate.toLocaleString("default", {
      month: "long",
    });
    const currentYear = currentDate.getFullYear();
    onMonthChange(currentMonth, currentYear.toString());
  };

  useEffect(() => {
    const dateParam = searchParams.get("date");
    if (dateParam) {
      setDate(parseDate(dateParam));
      setSelectedDate(parseDate(dateParam));
    }
  }, [searchParams]);

  const handleChangeDate = (date: DateValue) => {
    setDate(date as CalendarDate);
    setSelectedDate(date);
  };

  const isDateUnavailable = (date: DateValue) => {
    const dayOfWeek = date.toDate(getLocalTimeZone()).getDay();
    // Adjust the index to match the daysofWeek array
    const adjustedIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    // Check if the date is in the disabledDates array
    const dateString = date.toString();
    const isDisabled = disabledDates.includes(dateString);

    return !daysofWeek[adjustedIndex].isActive || isDisabled;
  };

  return (
    <div className="space-y-3">
      <Calendar
        minValue={today(getLocalTimeZone())}
        defaultValue={today(getLocalTimeZone())}
        value={date}
        onChange={handleChangeDate}
        isDateUnavailable={isDateUnavailable}
        onVisibleDateChange={handleMonthChange}
      />
    </div>
  );
}
