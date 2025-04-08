import { getAllTours } from "@/app/actions/tours/actions";
import { TOUR_TABLE_COLUMNS } from "@/app/_lib/constants/tables";
import { TourTable } from "./_components/TourTable";
import { Tour } from "@/app/_lib/types/tours";

// Add revalidation timing if needed
export const revalidate = 3600; // Revalidate every hour

export default async function ToursPage() {
  // This runs on the server
  const tours = await getAllTours();

  return (
    <main className="flex-1">
      <div className="px-4 sm:px-6 lg:px-8 py-10">
        <TourTable
          tours={tours as unknown as Tour[]}
          columns={TOUR_TABLE_COLUMNS as any}
        />
      </div>
    </main>
  );
}
