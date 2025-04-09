import { Suspense } from "react";
import { getAvailableTourSchedules } from "@/app/actions/schedule/actions";
import { getTourById } from "@/app/actions/tours/actions";
import ScheduleViewClient from "./ScheduleViewClient";
import { Tour } from "@/app/_lib/types/tours";

export interface ScheduleData {
  tourId: string;
  rate: number;
  schedules: any[]; // You might want to type this more specifically based on your schedule structure
}

interface ScheduleViewProps {
  tourId: string;
  className?: string;
  onSubmit?: (data: ScheduleData) => void;
  showSubmitButton?: boolean;
}

// This is a Server Component
export default async function ScheduleView({
  tourId,
  className = "",
  onSubmit,
  showSubmitButton = false,
}: ScheduleViewProps) {
  // Fetch initial schedules and tour details on the server
  const [schedulesResult, tour] = await Promise.all([
    getAvailableTourSchedules(tourId),
    getTourById(tourId),
  ]);

  const initialSchedules = schedulesResult.success
    ? schedulesResult.schedules || []
    : [];

  // Cast the tour to the correct type
  const typedTour = tour as unknown as Tour | null;

  return (
    <Suspense fallback={<div>Loading calendar...</div>}>
      <ScheduleViewClient
        tourId={tourId}
        className={className}
        onSubmit={onSubmit}
        showSubmitButton={showSubmitButton}
        initialSchedules={initialSchedules}
        tourRate={typedTour?.rate || 0}
      />
    </Suspense>
  );
}
