import { getAllBookings } from "@/app/_api/actions/booking/actions";
import { Booking } from "@/app/_lib/types/bookings-types";

import { BOOKING_TABLE_COLUMNS } from "@/app/_lib/constants/booking-table-const";
import { BookingTable } from "../../../_features/booking/components/BookingTable/BookingTable";

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
