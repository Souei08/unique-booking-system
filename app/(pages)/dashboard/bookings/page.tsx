import { BookingTableV2 } from "@/app/_features/booking/components/BookingTableV2";
import { getAllBookings } from "@/app/_features/booking/api/getAllBookings";
import ContentLayout from "@/app/(pages)/dashboard/ContentLayout";

// Add revalidation timing if needed
export const revalidate = 3600; // Revalidate every hour

export default async function BookingsPage() {
  // This runs on the server
  const bookings = await getAllBookings();

  const updatedBookings = bookings.map((booking) => ({
    id: booking.id,
    customer: `${booking.first_name} ${booking.last_name}`,
    tour_id: booking.tour_id,
    tour_title: booking.tour_title,
    slots: booking.slots,
    total_price: booking.total_price,
    created_at: booking.created_at,
    booking_date: booking.booking_date,
    selected_time: booking.selected_time,
    status: booking.status,
  }));

  return (
    <ContentLayout
      title="List of Bookings"
      description="View and manage all current bookings for tours."
      buttonText="Create Direct Booking"
      modalTitle="Create a Direct Booking"
      modalDescription="Create a direct booking for a customer."
      modalRoute="booking"
    >
      <BookingTableV2 bookings={updatedBookings as any} />
    </ContentLayout>
  );
}
