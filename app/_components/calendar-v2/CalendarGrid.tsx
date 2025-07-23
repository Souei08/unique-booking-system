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
      weekdayStyle: "narrow",
    },
    state
  );

  // Get the number of weeks in the month so we can render the proper number of rows.
  const weeksInMonth = getWeeksInMonth(startDate, locale);
  return (
    <div className="w-full">
      <table {...gridProps} cellPadding="0" className="w-full table-fixed">
        <thead {...headerProps}>
          <tr>
            {weekDays.map((day, index) => (
              <th
                key={index}
                className="py-2 text-md font-semibold text-slate-700 uppercase tracking-wider bg-slate-100 border-b border-slate-200"
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: weeksInMonth }, (_, weekIndex) => (
            <tr key={weekIndex} className="border-t border-slate-200">
              {state.getDatesInWeek(weekIndex, startDate).map((date, i) =>
                date ? (
                  <CalendarCell
                    key={i}
                    state={state}
                    date={date}
                    currentMonth={startDate}
                    isUnavailable={isDateUnavailable?.(date)}
                  />
                ) : (
                  <td
                    key={i}
                    className="p-2 text-center align-middle border border-slate-200"
                  >
                    <div className="w-full aspect-square max-w-[2.5rem] mx-auto outline-none group flex items-center justify-center transition-all duration-200 ease-in-out">
                      <div className="w-full h-full flex items-center justify-center p-4 rounded-md text-sm font-medium transition-all duration-200 ease-in-out bg-white"></div>
                    </div>
                  </td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
