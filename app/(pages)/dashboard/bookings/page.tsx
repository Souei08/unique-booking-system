import { BookingTableV2 } from "@/app/_features/booking/components/BookingTableV2";
import { getAllBookings } from "@/app/_features/booking/api/getAllBookings";
import ContentLayout from "@/app/(pages)/dashboard/ContentLayout";
import { Suspense } from "react";

// Add revalidation timing if needed
export const revalidate = 0; // Disable static revalidation to allow dynamic updates

async function BookingsList() {
  const bookings = await getAllBookings();

  const updatedBookings = bookings.map((booking) => ({
    booking_id: booking.booking_id,
    full_name: booking.full_name,
    tour_id: booking.tour_id,
    tour_title: booking.tour_title,
    slots: booking.slots,
    amount_paid: booking.amount_paid,
    created_at: booking.booking_created_at,
    booking_date: booking.booking_date,
    selected_time: booking.selected_time,
    booking_status: booking.booking_status,
    payment_status: booking.payment_status,
    reference_number: booking.reference_number,
  }));

  return <BookingTableV2 bookings={updatedBookings as any} />;
}

export default async function BookingsPage() {
  return (
    <ContentLayout
      title="List of Bookings"
      description="View and manage all current bookings for tours."
      buttonText="Create Direct Booking"
      modalTitle="Create a Direct Booking"
      modalDescription="Create a direct booking for a customer."
      modalRoute="booking"
    >
      <Suspense fallback={<div>Loading bookings...</div>}>
        <BookingsList />
      </Suspense>
    </ContentLayout>
  );
}
