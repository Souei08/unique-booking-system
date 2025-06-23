import ContentLayout from "@/app/(pages)/dashboard/ContentLayout";
import { getAllTours } from "@/app/_features/tours/api/getTours";
import { TourTableV2 } from "@/app/_features/tours/components/TourTableV2";
import { Tour } from "@/app/_features/tours/tour-types";

// Add revalidation timing if needed
export const revalidate = 3600; // Revalidate every hour

export default async function ToursPage() {
  // This runs on the server
  const tours = await getAllTours();

  return (
    <ContentLayout
      title="Tours"
      buttonText="Create Tour"
      description="View and manage all current tours."
      modalTitle="Create a new tour"
      modalDescription="Create a new tour to add to the list."
      modalRoute="tours"
    >
      <TourTableV2 tours={tours as unknown as Tour[]} />
    </ContentLayout>
  );
}
