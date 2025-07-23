import { cn } from "@/app/_lib/utils/utils";
import {
  CalendarDate,
  getLocalTimeZone,
  isSameMonth,
  isToday,
} from "@internationalized/date";
import { useRef } from "react";
import { mergeProps, useCalendarCell, useFocusRing } from "react-aria";
import { CalendarState } from "react-stately";

export function CalendarCell({
  state,
  date,
  currentMonth,
  isUnavailable,
}: {
  state: CalendarState;
  date: CalendarDate;
  currentMonth: CalendarDate;
  isUnavailable?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { cellProps, buttonProps, isSelected, isDisabled, formattedDate } =
    useCalendarCell({ date }, state, ref);

  // Override isDisabled if the date is unavailable
  const finalIsDisabled = isDisabled || isUnavailable;

  const { focusProps, isFocusVisible } = useFocusRing();

  const isOutsideMonth = !isSameMonth(currentMonth, date);
  const isDateToday = isToday(date, getLocalTimeZone());

  return (
    <td
      {...cellProps}
      className={cn(
        "p-2 text-center align-middle border border-slate-200",
        isFocusVisible ? "z-10" : "z-0"
      )}
    >
      <div
        {...mergeProps(buttonProps, focusProps)}
        ref={ref}
        hidden={isOutsideMonth}
        className={cn(
          "w-full aspect-square max-w-[2.5rem] mx-auto outline-none group",
          "flex items-center justify-center",
          "transition-all duration-200 ease-in-out"
        )}
      >
        <div
          className={cn(
            "w-full h-full flex items-center justify-center p-4 rounded-md cursor-pointer",
            "text-sm font-medium",
            "transition-all duration-200 ease-in-out",
            finalIsDisabled && "text-slate-300 cursor-not-allowed",
            isFocusVisible && "ring-2 ring-blue-500 ring-offset-2",
            isSelected && "bg-blue-600 text-white",
            !isSelected &&
              !finalIsDisabled &&
              !isOutsideMonth &&
              "hover:bg-green-50 text-blue-700 bg-white border-2 border-blue-200",
            !isSelected &&
              !finalIsDisabled &&
              isOutsideMonth &&
              "hover:bg-slate-100 text-slate-400 bg-white",
            isOutsideMonth && "text-slate-300"
            // isDateToday && !isSelected && "text-brand font-semibold"
          )}
        >
          {formattedDate}
        </div>
      </div>
    </td>
  );
}
