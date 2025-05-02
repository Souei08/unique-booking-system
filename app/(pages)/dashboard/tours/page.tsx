import ContentLayout from "@/app/_features/dashboard/components/ContentLayout";
import { getAllTours } from "@/app/_features/tours/actions/getTours";
import { TourTableV2 } from "@/app/_features/tours/components/TourTableV2";
import { Tour } from "@/app/_features/tours/types/TourTypes";

// Add revalidation timing if needed
export const revalidate = 3600; // Revalidate every hour

export default async function ToursPage() {
  // This runs on the server
  const tours = await getAllTours();

  return (
    <ContentLayout
      title="List of Tours"
      description="View and manage all current tours."
      buttonText={"Create a new tour"}
      navigation={{ type: "dialog" }}
    >
      <TourTableV2 tours={tours as unknown as Tour[]} />
    </ContentLayout>
  );
}
