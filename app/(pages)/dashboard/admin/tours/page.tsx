import React from "react";

import Table from "@/app/_components/common/tables";

interface Tour {
  id: string;
  title: string;
  description: string;
  duration: number;
  group_size: number;
  slots: number;
  schedule: string[];
  rate: number;
  experience_level: "beginner" | "advanced" | "all";
  cantering_allowed: boolean;
  weight_limit: number;
  min_age: number;
  location: string;
  includes: string[];
  booking_link: string;
  created_at: string;
}

const tableColumns = [
  { header: "Title", accessor: "title" as keyof Tour },
  { header: "Description", accessor: "description" as keyof Tour },
  { header: "Duration", accessor: "duration" as keyof Tour },
  { header: "Group Size", accessor: "group_size" as keyof Tour },
  { header: "Slots", accessor: "slots" as keyof Tour },
  { header: "Rate", accessor: "rate" as keyof Tour },
  { header: "Location", accessor: "location" as keyof Tour },
  { header: "Created At", accessor: "created_at" as keyof Tour },
];

const collapsibleColumns = [
  { header: "Schedule", accessor: "schedule" as keyof Tour },
  { header: "Experience Level", accessor: "experience_level" as keyof Tour },
  { header: "Cantering Allowed", accessor: "cantering_allowed" as keyof Tour },
  { header: "Weight Limit", accessor: "weight_limit" as keyof Tour },
  { header: "Min Age", accessor: "min_age" as keyof Tour },
  { header: "Includes", accessor: "includes" as keyof Tour },
  { header: "Booking Link", accessor: "booking_link" as keyof Tour },
];

const tours: Tour[] = [
  {
    id: "1",
    title: "Safari Adventure",
    description: "An exciting safari tour",
    duration: 3,
    group_size: 10,
    slots: 5,
    schedule: ["2023-10-01", "2023-10-15"],
    rate: 200.0,
    experience_level: "all",
    cantering_allowed: false,
    weight_limit: 220,
    min_age: 5,
    location: "Savannah",
    includes: ["Guide", "Meals"],
    booking_link: "http://example.com/book-safari",
    created_at: "2023-01-01T00:00:00Z",
  },
  // Add more tour objects as needed
];

const ToursPage = () => {
  return (
    <main className="flex-1">
      <div className="px-4 sm:px-6 lg:px-8 py-10">
        <Table<Tour>
          data={tours}
          columns={tableColumns}
          title="Tours"
          description="View and manage all available tours"
          isCollapsible={true} // Enable collapsible rows
        />
      </div>
    </main>
  );
};

export default ToursPage;
