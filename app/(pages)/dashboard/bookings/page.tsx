import { getAllBookings } from "@/app/_api/actions/booking/actions";
import { BookingTableV2 } from "@/app/_features/booking/components/BookingTableV2";

import ContentLayout from "@/app/_features/dashboard/components/ContentLayout";

// Add revalidation timing if needed
export const revalidate = 3600; // Revalidate every hour

export default async function BookingsPage() {
  // This runs on the server
  const bookings = await getAllBookings();

  const updatedBookings = bookings.map((booking) => ({
    id: booking.id,
    customer: `${booking.first_name} ${booking.last_name}`,
    tour_id: booking.tour_id,
    date: booking.date,
    status: booking.status,
    spots: booking.slots,
    total_price: booking.total_price,
    created_at: booking.created_at,
  }));

  return (
    <ContentLayout
      title="List of Bookings"
      description="View and manage all current bookings for tours.q"
      buttonText={"Create a new booking"}
      navigation={{ type: "route", path: "/dashboard/bookings/create" }}
    >
      <BookingTableV2 bookings={updatedBookings as any} />
    </ContentLayout>
  );
}
