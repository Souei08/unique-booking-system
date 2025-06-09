"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function TimePicker({
  value,
  onChange,
  disabled,
  className,
}: TimePickerProps) {
  // Generate hours in 12-hour format
  const hours = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 1;
    return hour.toString().padStart(2, "0");
  });
  // Generate all minutes (0-59)
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0")
  );
  const periods = ["AM", "PM"];

  // Convert 24h to 12h format
  const convertTo12Hour = (time: string) => {
    if (!time) return { hour: "", minute: "", period: "AM" };
    const [hour, minute] = time.split(":");
    const hourNum = parseInt(hour);
    const period = hourNum >= 12 ? "PM" : "AM";
    const hour12 = hourNum % 12 || 12;
    return {
      hour: hour12.toString().padStart(2, "0"),
      minute: minute || "00",
      period,
    };
  };

  // Convert 12h to 24h format
  const convertTo24Hour = (hour: string, minute: string, period: string) => {
    if (!hour || !minute) return "";
    let hour24 = parseInt(hour);
    if (period === "PM" && hour24 !== 12) hour24 += 12;
    if (period === "AM" && hour24 === 12) hour24 = 0;
    return `${hour24.toString().padStart(2, "0")}:${minute}`;
  };

  const {
    hour: selectedHour,
    minute: selectedMinute,
    period: selectedPeriod,
  } = convertTo12Hour(value);

  const handleHourChange = (hour: string) => {
    if (!hour) return;
    onChange(convertTo24Hour(hour, selectedMinute || "00", selectedPeriod));
  };

  const handleMinuteChange = (minute: string) => {
    if (!minute) return;
    onChange(convertTo24Hour(selectedHour || "01", minute, selectedPeriod));
  };

  const handlePeriodChange = (period: string) => {
    if (!selectedHour || !selectedMinute) return;
    onChange(convertTo24Hour(selectedHour, selectedMinute, period));
  };

  return (
    <div className={cn("grid grid-cols-3 gap-2 w-full", className)}>
      <div className="grid gap-1.5">
        <Label className="text-sm text-muted-foreground">Hour</Label>
        <Select
          value={selectedHour}
          onValueChange={handleHourChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Hour" />
          </SelectTrigger>
          <SelectContent>
            {hours.map((hour) => (
              <SelectItem key={hour} value={hour}>
                {hour}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label className="text-sm text-muted-foreground">Minute</Label>
        <Select
          value={selectedMinute}
          onValueChange={handleMinuteChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Minute" />
          </SelectTrigger>
          <SelectContent>
            {minutes.map((minute) => (
              <SelectItem key={minute} value={minute}>
                {minute}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label className="text-sm text-muted-foreground">Period</Label>
        <Select
          value={selectedPeriod}
          onValueChange={handlePeriodChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="AM/PM" />
          </SelectTrigger>
          <SelectContent>
            {periods.map((period) => (
              <SelectItem key={period} value={period}>
                {period}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
