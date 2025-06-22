import { BookingTableV2 } from "@/app/_features/booking/components/BookingTableV2";
import ContentLayout from "@/app/(pages)/dashboard/ContentLayout";

export default function BookingsPage() {
  return (
    <ContentLayout
      title="List of Bookings"
      description="View and manage all current bookings for tours."
      buttonText="Create Direct Booking"
      modalTitle="Create a Direct Booking"
      modalDescription="Create a direct booking for a customer."
      modalRoute="booking"
    >
      <BookingTableV2 />;
    </ContentLayout>
  );
}
