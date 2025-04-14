import { Tour } from "@/app/_api/actions/types";

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
