import React from "react";

import Table from "@/app/_components/common/tables";

interface Rental {
  id: string;
  title: string;
  description: string;
  location: string;
  category: "villa" | "apartment" | "studio";
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenities: string[];
  parking_spaces: number;
  min_price: number;
  base_price: number;
  booking_link: string;
  cancellation_policy: string;
  rules: string[];
  created_at: string;
}

const columns = [
  { header: "Title", accessor: "title" as keyof Rental },
  { header: "Description", accessor: "description" as keyof Rental },
  { header: "Location", accessor: "location" as keyof Rental },
  { header: "Category", accessor: "category" as keyof Rental },
  { header: "Max Guests", accessor: "max_guests" as keyof Rental },
  { header: "Bedrooms", accessor: "bedrooms" as keyof Rental },
  { header: "Beds", accessor: "beds" as keyof Rental },
  { header: "Bathrooms", accessor: "bathrooms" as keyof Rental },
  { header: "Min Price", accessor: "min_price" as keyof Rental },
  { header: "Base Price", accessor: "base_price" as keyof Rental },
  { header: "Created At", accessor: "created_at" as keyof Rental },
];

const rentals: Rental[] = [
  {
    id: "1",
    title: "Cozy Cottage",
    description: "A cozy cottage in the countryside",
    location: "Countryside",
    category: "villa",
    max_guests: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 1,
    amenities: ["WiFi", "Fireplace"],
    parking_spaces: 1,
    min_price: 100.0,
    base_price: 150.0,
    booking_link: "http://example.com/book-cozy-cottage",
    cancellation_policy: "Flexible",
    rules: ["No smoking", "No pets"],
    created_at: "2023-01-01T00:00:00Z",
  },
  // Add more rental objects as needed
];

const RentalsPage = () => {
  return (
    <main className="flex-1">
      <div className="px-4 sm:px-6 lg:px-8 py-10">
        <Table<Rental>
          data={rentals}
          columns={columns}
          title="Rentals"
          description="View and manage all available rentals"
          isCollapsible={true}
          buttonText="Add Rental"
          handleEdit={() => {}}
          handleSchedule={() => {}}
          handleAdd={() => {}}
        />
      </div>
    </main>
  );
};

export default RentalsPage;
