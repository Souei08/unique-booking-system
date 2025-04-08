import { Booking } from "../types/bookings-types";

export const BOOKING_TABLE_COLUMNS = [
  { header: "ID", accessor: "id" as keyof Booking, isHiddenOnMobile: false },
  {
    header: "Tour ID",
    accessor: "tour_id" as keyof Booking,
    isHiddenOnMobile: true,
  },
  {
    header: "User ID",
    accessor: "user_id" as keyof Booking,
    isHiddenOnMobile: true,
  },
  {
    header: "Date",
    accessor: "date" as keyof Booking,
    isHiddenOnMobile: false,
  },
  {
    header: "Start Time",
    accessor: "start_time" as keyof Booking,
    isHiddenOnMobile: false,
  },
  {
    header: "Spots",
    accessor: "spots" as keyof Booking,
    isHiddenOnMobile: true,
  },
  {
    header: "Total Price",
    accessor: "total_price" as keyof Booking,
    isHiddenOnMobile: false,
  },
  {
    header: "Created At",
    accessor: "created_at" as keyof Booking,
    isHiddenOnMobile: true,
  },
] as const;
