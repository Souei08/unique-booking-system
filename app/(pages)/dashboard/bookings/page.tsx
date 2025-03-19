"use client";

import { useState } from "react";
import { CalendarIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { BookingsTable } from "../_components/Bookings/BookingsTable";
import { bookings } from "../page";

const BookingsPage = () => {
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <main className="flex-1">
      {/* Page header */}
      <div className="border-b border-gray-200 px-4 py-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-medium text-gray-900">All Bookings</h1>
        </div>
        <div className="mt-4 flex sm:mt-0 sm:ml-4">
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            onClick={() => setFilterOpen(true)}
          >
            <FunnelIcon
              className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
            Filters
          </button>
          <button
            type="button"
            className="ml-3 inline-flex items-center rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500"
          >
            <CalendarIcon
              className="-ml-0.5 mr-1.5 h-5 w-5"
              aria-hidden="true"
            />
            New Booking
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-between sm:flex-nowrap">
          <div className="ml-4 mt-2 flex-shrink-0">
            <div className="flex items-center gap-x-3">
              <select
                className="rounded-md border-0 py-1.5 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-purple-600 sm:text-sm sm:leading-6"
                defaultValue="all"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                className="rounded-md border-0 py-1.5 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-purple-600 sm:text-sm sm:leading-6"
                defaultValue="all"
              >
                <option value="all">All Services</option>
                <option value="spa">Spa Services</option>
                <option value="massage">Massage</option>
                <option value="hair">Hair Salon</option>
                <option value="nails">Nail Care</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings table */}
      <div className="px-4 sm:px-6 lg:px-8">
        <BookingsTable bookings={bookings} className="mt-8" />
      </div>
    </main>
  );
};

export default BookingsPage;
