import React from "react";

import { CreateBookingForm } from "@/app/_features/booking/components/CreateBooking/CreateBookingForm";

const CreateBooking = () => {
  return (
    <main className="flex-1">
      <div className="px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Create New Booking
        </h1>
        <CreateBookingForm />
      </div>
    </main>
  );
};

export default CreateBooking;
