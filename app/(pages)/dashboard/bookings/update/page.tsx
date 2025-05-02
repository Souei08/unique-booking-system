import React from "react";

import { UpdateBookingForm } from "@/app/_features/booking/components/CreateBooking/UpdateBookingForm";

const UpdateBooking = () => {
  return (
    <main className="flex-1">
      <div className="px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Update Booking
        </h1>

        <UpdateBookingForm />
      </div>
    </main>
  );
};

export default UpdateBooking;
