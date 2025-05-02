import { Booking } from "../types/bookings-types";

export const BOOKING_TABLE_COLUMNS = [
  {
    header: "Customer Name",
    accessor: "customer" as keyof Booking,
    isHiddenOnMobile: false,
  },
  {
    header: "Tour ID",
    accessor: "tour_id" as keyof Booking,
    isHiddenOnMobile: true,
  },
  {
    header: "Selected Date",
    accessor: "date" as keyof Booking,
    isHiddenOnMobile: false,
  },
  // {
  //   header: "Selected Time",
  //   accessor: "start_time" as keyof Booking,
  //   isHiddenOnMobile: false,
  // },
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
  {
    header: "Status",
    accessor: "status" as keyof Booking,
    isHiddenOnMobile: false,
  },
] as const;
