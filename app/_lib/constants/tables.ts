import { Tour } from "../types/tours";

export const TOUR_TABLE_COLUMNS = [
  { header: "Title", accessor: "title" as keyof Tour, isHiddenOnMobile: false },
  {
    header: "Description",
    accessor: "description" as keyof Tour,
    isHiddenOnMobile: true,
  },
  {
    header: "Duration",
    accessor: "duration" as keyof Tour,
    isHiddenOnMobile: false,
  },
  {
    header: "Group Size",
    accessor: "group_size" as keyof Tour,
    isHiddenOnMobile: true,
  },
  { header: "Slots", accessor: "slots" as keyof Tour, isHiddenOnMobile: true },
  { header: "Rate", accessor: "rate" as keyof Tour, isHiddenOnMobile: false },
  {
    header: "Location",
    accessor: "location" as keyof Tour,
    isHiddenOnMobile: false,
  },
  {
    header: "Created At",
    accessor: "created_at" as keyof Tour,
    isHiddenOnMobile: true,
  },
] as const;

export const TOUR_COLLAPSIBLE_COLUMNS = [
  {
    header: "Schedule",
    accessor: "schedule" as keyof Tour,
    isHiddenOnMobile: true,
  },
  {
    header: "Experience Level",
    accessor: "experience_level" as keyof Tour,
    isHiddenOnMobile: true,
  },
  {
    header: "Cantering Allowed",
    accessor: "cantering_allowed" as keyof Tour,
    isHiddenOnMobile: true,
  },
  {
    header: "Weight Limit",
    accessor: "weight_limit" as keyof Tour,
    isHiddenOnMobile: true,
  },
  {
    header: "Min Age",
    accessor: "min_age" as keyof Tour,
    isHiddenOnMobile: true,
  },
  {
    header: "Includes",
    accessor: "includes" as keyof Tour,
    isHiddenOnMobile: true,
  },
  {
    header: "Booking Link",
    accessor: "booking_link" as keyof Tour,
    isHiddenOnMobile: true,
  },
] as const;
