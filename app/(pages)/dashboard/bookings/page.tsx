import { getAllBookings } from "@/app/actions/booking/actions";
import { BOOKING_TABLE_COLUMNS } from "@/app/_lib/constants/booking-table-const";
import { BookingTable } from "./_components/BookingTable";
import { Booking } from "@/app/_lib/types/bookings-types";

// Add revalidation timing if needed
export const revalidate = 3600; // Revalidate every hour

export default async function BookingsPage() {
  // This runs on the server
  const bookings = await getAllBookings();

  return (
    <main className="flex-1">
      <div className="px-4 sm:px-6 lg:px-8 py-10">
        <BookingTable
          bookings={bookings as unknown as Booking[]}
          columns={BOOKING_TABLE_COLUMNS as any}
        />
      </div>
    </main>
  );
}
