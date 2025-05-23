import { createCalendar } from "@internationalized/date";
import { CalendarProps, DateValue, useCalendar, useLocale } from "react-aria";
import { useCalendarState } from "react-stately";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarGrid } from "./CalendarGrid";
import { useEffect, useRef } from "react";

export function Calendar(
  props: CalendarProps<DateValue> & {
    isDateUnavailable?: (date: DateValue) => boolean;
    onVisibleDateChange?: (date: DateValue) => void;
  }
) {
  const { locale } = useLocale();
  const state = useCalendarState({
    ...props,
    visibleDuration: { months: 1 },
    locale,
    createCalendar,
  });

  const { calendarProps, prevButtonProps, nextButtonProps } = useCalendar(
    props,
    state
  );

  const prevMonthRef = useRef<number | null>(null);

  // Call onVisibleDateChange only when the month changes
  useEffect(() => {
    const currentMonth = state.visibleRange.start
      .toDate("America/Grand_Turk")
      .getMonth();

    if (prevMonthRef.current !== currentMonth) {
      props.onVisibleDateChange?.(state.visibleRange.start);
    }

    prevMonthRef.current = currentMonth;
  }, [state.visibleRange.start, props.onVisibleDateChange]);

  return (
    <div
      {...calendarProps}
      // className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg p-4 border border-gray-100"
      className="w-full max-w-md mx-auto bg-white "
    >
      <div className="space-y-4">
        <CalendarHeader
          state={state}
          calendarProps={calendarProps}
          prevButtonProps={prevButtonProps}
          nextButtonProps={nextButtonProps}
        />
        <div className="flex justify-center">
          <CalendarGrid
            state={state}
            isDateUnavailable={props.isDateUnavailable}
          />
        </div>
      </div>
    </div>
  );
}
