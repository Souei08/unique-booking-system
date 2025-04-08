"use client";
import Table from "@/app/_components/common/tables";
import type { Booking } from "@/app/_lib/types/bookings-types";
import { useRouter } from "next/navigation";
import { BookingActions } from "./BookingActions";

interface BookingTableProps {
  bookings: Booking[];
  columns: any[];
}

export function BookingTable({ bookings, columns }: BookingTableProps) {
  const router = useRouter();

  // Use the TourActions component hooks instead of destructuring the component
  const actions = BookingActions({
    onAddBooking: () => {
      router.refresh();
    },
    onEditBooking: () => {
      router.refresh();
    },
    onScheduleBooking: () => {
      router.refresh();
    },
  });

  return (
    <Table<Booking>
      data={bookings}
      columns={columns}
      title="Bookings"
      description="View and manage all available bookings"
      isCollapsible={true}
      buttonText="Add Booking"
      handleEdit={actions.handleEditBooking}
      handleSchedule={actions.handleScheduleBooking}
    />
  );
}
