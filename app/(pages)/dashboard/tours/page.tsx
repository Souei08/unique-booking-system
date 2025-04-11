import { getAllTours } from "@/app/_features/tours/actions/getTours";

import { TourTable } from "@/app/_features/tours/components/tour-table/TourTable";

import { TOUR_TABLE_COLUMNS } from "@/app/_lib/constants/tables";
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
