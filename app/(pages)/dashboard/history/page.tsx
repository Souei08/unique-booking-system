"use client";

import { useState } from "react";
import {
  CalendarIcon,
  FunnelIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { bookings } from "../page";

const HistoryPage = () => {
  const [dateFilter, setDateFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");

  // Sort bookings by date in descending order
  const sortedBookings = [...bookings].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  return (
    <main className="flex-1">
      {/* Page header */}
      <div className="border-b border-gray-200 px-4 py-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-medium text-gray-900">Booking History</h1>
        </div>
        <div className="mt-4 flex sm:mt-0 sm:ml-4">
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            <CalendarIcon
              className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
            Filter by Date
          </button>
          <button
            type="button"
            className="ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Export History
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-md border-0 py-1.5 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-purple-600 sm:text-sm"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>

          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="rounded-md border-0 py-1.5 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-purple-600 sm:text-sm"
          >
            <option value="all">All Services</option>
            <option value="spa">Spa Services</option>
            <option value="massage">Massage</option>
            <option value="hair">Hair Salon</option>
            <option value="nails">Nail Care</option>
          </select>
        </div>
      </div>

      {/* History list */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 lg:pl-8"
                    >
                      Service & Customer
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Date & Time
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Staff
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900"
                    >
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {sortedBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6 lg:pl-8">
                        <div className="flex items-center">
                          <div
                            className={`h-2.5 w-2.5 rounded-full ${booking.bgColorClass} mr-3`}
                          />
                          <div>
                            <div className="font-medium text-gray-900">
                              {booking.title}
                            </div>
                            <div className="text-gray-500">
                              {booking.customer.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div>{booking.date}</div>
                        <div>{booking.time}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {booking.staff.map((member) => (
                          <div key={member.handle}>{member.name}</div>
                        ))}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            booking.status === "Confirmed"
                              ? "bg-green-100 text-green-800"
                              : booking.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">
                        {booking.price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HistoryPage;
