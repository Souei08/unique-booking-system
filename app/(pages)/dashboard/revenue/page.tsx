"use client";

import { useState } from "react";
import {
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";

import { bookings } from "../_data/bookingsData";

const RevenuePage = () => {
  const [timeframe, setTimeframe] = useState("week");

  // Calculate total revenue
  const totalRevenue = bookings
    .reduce(
      (sum, booking) => sum + parseFloat(booking.price.replace("$", "")),
      0
    )
    .toFixed(2);

  return (
    <main className="flex-1">
      {/* Page header */}
      <div className="border-b border-gray-200 px-4 py-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-medium text-gray-900">Revenue</h1>
        </div>
        <div className="mt-4 flex sm:mt-0 sm:ml-4">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="rounded-md border-0 py-1.5 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-purple-600 sm:text-sm sm:leading-6"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Revenue stats */}
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6">
            <dt>
              <div className="absolute rounded-md bg-purple-500 p-3">
                <CurrencyDollarIcon
                  className="h-6 w-6 text-white"
                  aria-hidden="true"
                />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">
                Total Revenue
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">
                ${totalRevenue}
              </p>
              <p className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                <ArrowUpIcon
                  className="h-5 w-5 flex-shrink-0 self-center text-green-500"
                  aria-hidden="true"
                />
                <span className="sr-only">Increased by</span>
                8.2%
              </p>
            </dd>
          </div>
          {/* Add more stats cards as needed */}
        </dl>
      </div>
    </main>
  );
};

export default RevenuePage;
