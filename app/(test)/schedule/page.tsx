import { Suspense } from "react";
import { getAvailableTourSchedules } from "@/app/_api/actions/schedule/actions";
import { getTourById } from "@/app/_features/tours/actions/getOneTour";

import CalendarClient from "./_components/CalendarClient";
import { Tour } from "@/app/_features/tours/types/TourTypes";
export default async function SchedulePage({
  searchParams,
}: {
  searchParams: any;
}) {
  const tourId = searchParams.tourId || "2b40195e-fef5-4594-a163-8e14b590a1eb";

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
    <main className="min-h-screen bg-white">
      <div className="w-full max-w-7xl mx-auto pt-8 px-4">
        <Suspense fallback={<div>Loading calendar...</div>}>
          <CalendarClient
            initialSchedules={initialSchedules}
            tourId={tourId}
            rate={typedTour?.rate || 0}
          />
        </Suspense>
      </div>
    </main>
  );
}
