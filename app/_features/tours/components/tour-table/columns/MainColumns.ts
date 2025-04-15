import { Tour } from "@/app/_features/tours/types/TourTypes";

export const TOUR_TABLE_COLUMNS = [
  { header: "Title", accessor: "title" as keyof Tour, isHiddenOnMobile: false },
  {
    header: "Description",
    accessor: "description" as keyof Tour,
    isHiddenOnMobile: true,
    maxWidth: "200px",
  },
  {
    header: "Duration",
    accessor: "duration" as keyof Tour,
    isHiddenOnMobile: false,
  },
  {
    header: "Group Size Limit",
    accessor: "group_size_limit" as keyof Tour,
    isHiddenOnMobile: true,
  },
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
