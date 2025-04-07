"use client";

import { CheckIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function BookingSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center">
          <div className="rounded-full bg-green-100 p-3">
            <CheckIcon className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="mt-4 text-center text-2xl font-bold tracking-tight text-gray-900">
            Booking Confirmed!
          </h1>
          <p className="mt-2 text-center text-gray-600">
            Thank you for your booking. We have sent a confirmation email with
            your booking details.
          </p>
        </div>

        <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h2 className="text-lg font-medium text-gray-900">What's Next?</h2>
          <ul className="mt-4 space-y-3 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600">
                <CheckIcon className="h-3 w-3" />
              </span>
              <span>Check your email for booking confirmation</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600">
                <CheckIcon className="h-3 w-3" />
              </span>
              <span>Review your booking details</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600">
                <CheckIcon className="h-3 w-3" />
              </span>
              <span>Prepare for your adventure!</span>
            </li>
          </ul>
        </div>

        <div className="mt-8 flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <Link
            href="/tours"
            className="flex-1 rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-center text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Browse More Tours
          </Link>
          <Link
            href="/dashboard/bookings"
            className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-3 text-center text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            View My Bookings
          </Link>
        </div>
      </div>
    </div>
  );
}
