import ScheduleView from "@/app/_components/scheduler/ScheduleView";

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: any;
}) {
  const tourId = searchParams.tourId || "2b40195e-fef5-4594-a163-8e14b590a1eb";

  return (
    <main className="min-h-screen bg-white">
      <div className="w-full max-w-7xl mx-auto pt-8 px-4">
        <ScheduleView tourId={tourId} />
      </div>
    </main>
  );
}
