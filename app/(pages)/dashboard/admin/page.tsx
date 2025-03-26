"use client";

import { useState } from "react";
import {
  CalendarIcon,
  UserGroupIcon,
  HomeIcon,
  CurrencyDollarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

import { RecentBookings } from "../_components/Bookings/RecentBookings";
import { BookingsTable } from "../_components/Bookings/BookingsTable";
import { BookingsList } from "../_components/Bookings/BookingsList";
import { bookings } from "../_data/bookingsData";

const AdminPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const featuredBookings = bookings.filter((booking) => booking.featured);

  return (
    <main className="flex-1">
      {/* Page title & actions */}
      {/* <div className="px-4 py-4  sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8"> */}
      <div className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-medium text-strong sm:truncate">
            Dashboard
          </h1>
        </div>
        {/* <div className="mt-4 flex sm:mt-0 sm:ml-4">
          <button
            type="button"
            className="order-1 ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:order-0 sm:ml-0"
          >
            Export Schedule
          </button>
          <button
            type="button"
            className="order-0 inline-flex items-center rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue- focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 sm:order-1 sm:ml-3"
          >
            New Booking
          </button>
        </div> */}
      </div>

      {/* Booking sections */}
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Today's Tours"
            value="15"
            icon={CalendarIcon}
            trend="+4.75%"
            trendDirection="up"
          />
          <StatsCard
            title="Total Revenue"
            value="$2,145"
            icon={CurrencyDollarIcon}
            trend="+10.18%"
            trendDirection="up"
          />
          <StatsCard
            title="Equipment Rentals"
            value="8"
            icon={ClockIcon}
            trend="+3.23%"
            trendDirection="up"
          />
          <StatsCard
            title="Active Customers"
            value="185"
            icon={UserGroupIcon}
            trend="+5.25%"
            trendDirection="up"
          />
        </div>

        {/* Bookings Content */}
        <RecentBookings bookings={featuredBookings} />
        <BookingsList bookings={bookings} className="sm:hidden" />
        <BookingsTable bookings={bookings} className="hidden sm:block" />
      </div>
    </main>
  );
};

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trend: string;
  trendDirection: "up" | "down";
}

const StatsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendDirection,
}: StatsCardProps) => {
  return (
    <div className="relative overflow-hidden border border-gray-200 rounded-lg bg-white px-4 pb-6 pt-5 shadow sm:px-6 sm:pt-6">
      <dt>
        <div className="absolute rounded-md bg-brand p-3">
          <Icon className="h-6 w-6 text-white" aria-hidden="true" />
        </div>
        <p className="ml-16 truncate text-sm font-medium text-weak">{title}</p>
      </dt>
      <dd className="ml-16 flex items-baseline">
        <p className="text-2xl font-semibold text-strong">{value}</p>
        <p
          className={`ml-2 flex items-baseline text-sm font-semibold ${
            trendDirection === "up" ? "text-green-600" : "text-red-600"
          }`}
        >
          {trend}
        </p>
      </dd>
    </div>
  );
};

export default AdminPage;
