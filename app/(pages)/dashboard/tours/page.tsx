import React from "react";
import Table from "@/app/_components/common/tables";
import { toursService } from "@/app/_services/tours/service";
import { TOUR_TABLE_COLUMNS } from "@/app/_lib/constants/tables";
import type { Tour } from "@/app/_lib/types/tours";

// Add revalidation timing if needed
export const revalidate = 3600; // Revalidate every hour

export default async function ToursPage() {
  const tours = await toursService.findAll({
    orderBy: "created_at",
    ascending: false,
  });

  return (
    <main className="flex-1">
      <div className="px-4 sm:px-6 lg:px-8 py-10">
        <Table<Tour>
          data={tours}
          columns={TOUR_TABLE_COLUMNS as any}
          title="Tours"
          description="View and manage all available tours"
          isCollapsible={true}
          buttonText="Add Tour"
        />
      </div>
    </main>
  );
}
