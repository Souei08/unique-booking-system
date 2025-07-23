import type { AriaButtonProps } from "@react-aria/button";
import { useDateFormatter } from "@react-aria/i18n";
import { VisuallyHidden } from "@react-aria/visually-hidden";
import type { CalendarState } from "@react-stately/calendar";
import type { DOMAttributes, FocusableElement } from "@react-types/shared";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { CalendarButton } from "./CalendarButton";

export function CalendarHeader({
  state,
  calendarProps,
  prevButtonProps,
  nextButtonProps,
}: {
  state: CalendarState;
  calendarProps: DOMAttributes<FocusableElement>;
  prevButtonProps: AriaButtonProps<"button">;
  nextButtonProps: AriaButtonProps<"button">;
}) {
  const monthDateFormatter = useDateFormatter({
    month: "long",
    year: "numeric",
    timeZone: state.timeZone,
  });

  const [monthName, _, year] = monthDateFormatter
    .formatToParts(state.visibleRange.start.toDate(state.timeZone))
    .map((part) => part.value);

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-blue-500 rounded-t-2xl shadow-sm relative m-0">
      <VisuallyHidden>
        <h2>{calendarProps["aria-label"]}</h2>
      </VisuallyHidden>

      {/* Left Navigation Button */}
      <div className="flex-shrink-0">
        <CalendarButton {...prevButtonProps} className="p-0">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-blue-400 hover:bg-blue-600 transition-colors duration-150">
            <ChevronLeftIcon className="w-5 h-5 text-white" />
          </span>
        </CalendarButton>
      </div>

      {/* Centered Month and Year */}
      <div className="flex-1 flex justify-center">
        <h2
          aria-hidden
          className="text-2xl font-bold text-white tracking-wide text-center select-none"
        >
          {monthName} <span className="text-white font-semibold">{year}</span>
        </h2>
      </div>

      {/* Right Navigation Button */}
      <div className="flex-shrink-0">
        <CalendarButton {...nextButtonProps} className="p-0">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-blue-400 hover:bg-blue-600 transition-colors duration-150">
            <ChevronRightIcon className="w-5 h-5 text-white" />
          </span>
        </CalendarButton>
      </div>

      {/* Bottom Divider */}
      <div className="absolute left-0 right-0 bottom-0 h-px bg-blue-200" />
    </div>
  );
}
