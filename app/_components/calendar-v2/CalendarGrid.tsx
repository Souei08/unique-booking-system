import {
  DateDuration,
  endOfMonth,
  getWeeksInMonth,
} from "@internationalized/date";
import { DateValue, useCalendarGrid, useLocale } from "react-aria";
import { CalendarState } from "react-stately";
import { CalendarCell } from "./CalendarCell";

export function CalendarGrid({
  state,
  offset = {},
  isDateUnavailable,
}: {
  state: CalendarState;
  offset?: DateDuration;
  isDateUnavailable?: (date: DateValue) => boolean;
}) {
  const startDate = state.visibleRange.start.add(offset);
  const endDate = endOfMonth(startDate);
  const { locale } = useLocale();
  const { gridProps, headerProps, weekDays } = useCalendarGrid(
    {
      startDate,
      endDate,
      weekdayStyle: "short",
    },
    state
  );

  // Get the number of weeks in the month so we can render the proper number of rows.
  const weeksInMonth = getWeeksInMonth(startDate, locale);
  return (
    // <div className="w-full bg-white p-2 sm:p-4">
    <div className="w-full">
      <table {...gridProps} cellPadding="0" className="w-full table-fixed">
        <thead {...headerProps}>
          <tr className="border-b border-gray-200">
            {weekDays.map((day, index) => (
              <th
                key={index}
                className="py-2 sm:py-3 text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide"
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {Array.from({ length: weeksInMonth }, (_, weekIndex) => (
            <tr key={weekIndex} className="hover:bg-gray-50 transition-colors">
              {state
                .getDatesInWeek(weekIndex, startDate)
                .map((date, i) =>
                  date ? (
                    <CalendarCell
                      key={i}
                      state={state}
                      date={date}
                      currentMonth={startDate}
                      isUnavailable={isDateUnavailable?.(date)}
                    />
                  ) : (
                    <td key={i} className="p-1 sm:p-2" />
                  )
                )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
