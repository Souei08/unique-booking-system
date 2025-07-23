import { BookingTableV2 } from "@/app/_features/booking/components/BookingTableV2";
import ContentLayout from "@/app/(pages)/dashboard/ContentLayout";

export default function BookingsPage() {
  return (
    <ContentLayout
      title="Bookings"
      description="View and manage all current bookings for tours."
      buttonText="Create Direct Booking"
      modalTitle="Admin Direct Booking"
      modalDescription="Easily create a direct booking for a customer with just a few clicks."
      modalRoute="booking"
    >
      <BookingTableV2 />;
    </ContentLayout>
  );
}
