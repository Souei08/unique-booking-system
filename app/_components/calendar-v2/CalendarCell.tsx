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
        "p-2 text-center align-middle",
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
            "w-full h-full flex items-center justify-center p-4 rounded-md",
            "text-sm font-medium",
            "transition-all duration-200 ease-in-out",
            finalIsDisabled && "text-gray-300 cursor-not-allowed",
            isFocusVisible && "ring-2 ring-brand ring-offset-2",
            isSelected && "bg-brand text-white",
            !isSelected &&
              !finalIsDisabled &&
              "hover:bg-gray-100 text-gray-700 bg-fill",
            isOutsideMonth && "text-gray-300"
            // isDateToday && !isSelected && "text-brand font-semibold"
          )}
        >
          {formattedDate}
        </div>
      </div>
    </td>
  );
}
