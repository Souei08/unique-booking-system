"use client";

import { useState, useEffect } from "react";
import { ScheduleData } from "./ScheduleView";
import CalendarClient from "./CalendarClient";

interface ScheduleViewClientProps {
  tourId: string;
  className?: string;
  onSubmit?: (data: ScheduleData) => void;
  showSubmitButton?: boolean;
  initialSchedules: any[];
  tourRate: number;
}

export default function ScheduleViewClient({
  tourId,
  className = "",
  onSubmit,
  showSubmitButton = false,
  initialSchedules,
  tourRate,
}: ScheduleViewClientProps) {
  return (
    <div className={className}>
      <CalendarClient
        initialSchedules={initialSchedules}
        tourId={tourId}
        rate={tourRate}
        onSubmit={onSubmit}
        showSubmitButton={showSubmitButton}
      />
    </div>
  );
}
