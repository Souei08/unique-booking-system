"use client";

import { useState } from "react";
import { MagnifyingGlassIcon, UserPlusIcon } from "@heroicons/react/24/outline";

import { bookings } from "../page";

// Extract unique customers from bookings
const customers = Array.from(
  new Set(bookings.map((booking) => booking.customer.handle))
).map((handle) => {
  const booking = bookings.find((b) => b.customer.handle === handle);
  return booking?.customer;
});

const CustomersPage = () => {
  const [query, setQuery] = useState("");

  return (
    <main className="flex-1">
      {/* Page header */}
      <div className="border-b border-gray-200 px-4 py-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-medium text-gray-900">Customers</h1>
        </div>
        <div className="mt-4 flex sm:mt-0 sm:ml-4">
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500"
          >
            <UserPlusIcon
              className="-ml-0.5 mr-1.5 h-5 w-5"
              aria-hidden="true"
            />
            Add Customer
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="relative mt-2 rounded-md shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </div>
          <input
            type="text"
            name="search"
            className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"
            placeholder="Search customers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Customers list */}
      <div className="px-4 sm:px-6 lg:px-8">
        <ul role="list" className="divide-y divide-gray-100">
          {customers.map(
            (customer) =>
              customer && (
                <li
                  key={customer.handle}
                  className="flex items-center justify-between gap-x-6 py-5"
                >
                  <div className="flex min-w-0 gap-x-4">
                    <img
                      className="h-12 w-12 flex-none rounded-full bg-gray-50"
                      src={customer.imageUrl}
                      alt=""
                    />
                    <div className="min-w-0 flex-auto">
                      <p className="text-sm font-semibold leading-6 text-gray-900">
                        {customer.name}
                      </p>
                      <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                        @{customer.handle}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    View Profile
                  </button>
                </li>
              )
          )}
        </ul>
      </div>
    </main>
  );
};

export default CustomersPage;
