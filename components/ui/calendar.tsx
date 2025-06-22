"use client";

import * as React from "react";
import { Calendar as CalendarPrimitive } from "react-calendar";
import { cn } from "@/lib/utils";

export interface CalendarProps {
  mode?: "single" | "multiple" | "range";
  selected?: Date | undefined;
  onSelect?: (date: Date | undefined) => void;
  className?: string;
  initialFocus?: boolean;
}

const Calendar = React.forwardRef<
  React.ElementRef<typeof CalendarPrimitive>,
  CalendarProps
>(({ mode = "single", selected, onSelect, className, ...props }, ref) => {
  const handleDateChange = (value: any) => {
    if (onSelect) {
      if (value instanceof Date) {
        onSelect(value);
      } else if (
        Array.isArray(value) &&
        value.length > 0 &&
        value[0] instanceof Date
      ) {
        onSelect(value[0]);
      } else {
        onSelect(undefined);
      }
    }
  };

  return (
    <CalendarPrimitive
      ref={ref}
      onChange={handleDateChange}
      value={selected}
      className={cn("rounded-md border bg-background p-3 shadow-sm", className)}
      {...props}
    />
  );
});
Calendar.displayName = "Calendar";

export { Calendar };
