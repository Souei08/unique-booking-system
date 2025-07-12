import ContentLayout from "@/app/(pages)/dashboard/ContentLayout";
import { TourTableV2 } from "@/app/_features/tours/components/TourTableV2";

// Add revalidation timing if needed
export const revalidate = 3600; // Revalidate every hour

export default async function ToursPage() {
  return (
    <ContentLayout
      title="Tours"
      buttonText="Create a new tour"
      description="View and manage all current tours."
      // modalTitle="Create a new tour"
      // modalDescription="Create a new tour to add to the list."
      // modalRoute="tours"
      displayMode="redirect" // Can be "modal", "page", or "redirect"
      redirectUrl="/tours/create"
    >
      <TourTableV2 />
    </ContentLayout>
  );
}

// Alternative example with redirect mode:
// export default async function ToursPage() {
//   return (
//     <ContentLayout
//       title="Tours"
//       buttonText="Create a new tour"
//       description="View and manage all current tours."
//       displayMode="redirect"
//       redirectUrl="/tours/create"
//     >
//       <TourTableV2 />
//     </ContentLayout>
//   );
// }
