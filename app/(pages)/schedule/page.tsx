import { Suspense } from "react";
import CalendarClient from "./_components/CalendarClient";
import { getRecurringSchedules } from "@/app/actions/schedule/actions";

interface SchedulePageProps {
  searchParams: {
    tourId: string;
  };
}

export default async function SchedulePage({
  searchParams,
}: SchedulePageProps) {
  const { tourId } = searchParams;

  if (!tourId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Tour ID Required
          </h1>
          <p className="mt-2 text-gray-600">
            Please provide a valid tour ID to view available schedules.
          </p>
        </div>
      </div>
    );
  }

  // Fetch initial schedules
  const recurringSchedules = await getRecurringSchedules(tourId);

  // Transform recurring schedules into Schedule objects
  const initialSchedules = recurringSchedules.map((rs, index) => ({
    id: `temp-${index}`,
    tour_id: tourId,
    start_time: rs.start_time,
    end_time: new Date(
      new Date(rs.start_time).getTime() + 2 * 60 * 60 * 1000
    ).toISOString(), // 2 hours duration
    available_slots: 10,
    price: 0, // Default price, should be replaced with actual tour price
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">
            Select a Date & Time
          </h1>
          <p className="mt-2 text-gray-600">
            Choose your preferred date and time for the tour.
          </p>

          <div className="mt-8">
            <Suspense
              fallback={
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                </div>
              }
            >
              <CalendarClient
                initialSchedules={initialSchedules}
                tourId={tourId}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
