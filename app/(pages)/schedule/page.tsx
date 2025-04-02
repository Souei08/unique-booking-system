import { Suspense } from "react";
import { schedulesService } from "@/app/_services/schedules/service";
import CalendarClient from "./_components/CalendarClient";

interface PageProps {
  searchParams: { tourId?: string };
}

export default async function SchedulePage({ searchParams }: PageProps) {
  const tourId = searchParams.tourId || "2b40195e-fef5-4594-a163-8e14b590a1eb";

  // Fetch initial schedules on the server
  const initialSchedules = await schedulesService.getAvailableSchedules(
    tourId,
    365
  );

  return (
    <main className="min-h-screen bg-white">
      <div className="w-full max-w-5xl mx-auto pt-8 px-4">
        <Suspense fallback={<div>Loading calendar...</div>}>
          <CalendarClient initialSchedules={initialSchedules} tourId={tourId} />
        </Suspense>
      </div>
    </main>
  );
}
