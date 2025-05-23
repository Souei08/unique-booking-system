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
    <div className="flex items-center justify-between py-2 border-b border-gray-100">
      <VisuallyHidden>
        <h2>{calendarProps["aria-label"]}</h2>
      </VisuallyHidden>

      <h2 aria-hidden className="text-xl font-semibold text-gray-800">
        {monthName} <span className="text-gray-500 font-medium">{year}</span>
      </h2>
      <div className="flex items-center gap-2">
        <CalendarButton
          {...prevButtonProps}
          className="p-2 hover:bg-gray-50 rounded-full transition-colors"
        >
          <ChevronLeftIcon className="w-5 h-5 text-gray-600 hover:text-gray-900" />
        </CalendarButton>
        <CalendarButton
          {...nextButtonProps}
          className="p-2 hover:bg-gray-50 rounded-full transition-colors"
        >
          <ChevronRightIcon className="w-5 h-5 text-gray-600 hover:text-gray-900" />
        </CalendarButton>
      </div>
    </div>
  );
}
