"use client";

import { useState } from "react";
import {
  CalendarIcon,
  UserGroupIcon,
  HomeIcon,
  CurrencyDollarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

import Sidebar from "./_components/Sidebar";
import Header from "./_components/Header";

import { RecentBookings } from "./_components/Bookings/RecentBookings";
import { BookingsTable } from "./_components/Bookings/BookingsTable";
import { BookingsList } from "./_components/Bookings/BookingsList";

// Navigation items for booking system
export const navigation = [
  { name: "Dashboard", href: "#", icon: HomeIcon, current: true },
  { name: "Bookings", href: "#", icon: CalendarIcon, current: false },
  { name: "Customers", href: "#", icon: UserGroupIcon, current: false },
  { name: "Revenue", href: "#", icon: CurrencyDollarIcon, current: false },
  { name: "History", href: "#", icon: ClockIcon, current: false },
];

// Booking categories/services
export const services = [
  { name: "Spa Services", href: "#", bgColorClass: "bg-indigo-500" },
  { name: "Massage", href: "#", bgColorClass: "bg-green-500" },
  { name: "Hair Salon", href: "#", bgColorClass: "bg-yellow-500" },
  { name: "Nail Care", href: "#", bgColorClass: "bg-pink-500" },
];

// Sample booking data
export const bookings = [
  {
    id: 1,
    title: "Full Body Massage",
    service: "Massage",
    customer: {
      name: "Sarah Johnson",
      handle: "sarahj",
      imageUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    staff: [
      {
        name: "Maria Garcia",
        handle: "mariag",
        imageUrl:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
    ],
    duration: "60 min",
    time: "10:00 AM",
    date: "March 20, 2024",
    status: "Confirmed",
    price: "$85.00",
    featured: true,
    bgColorClass: "bg-green-600",
    startTime: "2024-03-20T10:00:00",
    endTime: "2024-03-20T11:00:00",
  },
  {
    id: 2,
    title: "Hair Styling",
    service: "Hair Salon",
    customer: {
      name: "Emily Chen",
      handle: "emilyc",
      imageUrl:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    staff: [
      {
        name: "John Smith",
        handle: "johns",
        imageUrl:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
    ],
    duration: "45 min",
    time: "2:30 PM",
    date: "March 20, 2024",
    status: "Pending",
    price: "$65.00",
    featured: true,
    bgColorClass: "bg-yellow-600",
    startTime: "2024-03-20T14:30:00",
    endTime: "2024-03-20T15:15:00",
  },
];

const DashboardPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const featuredBookings = bookings.filter((booking) => booking.featured);

  return (
    <div className="min-h-full">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        navigation={navigation}
        // services={services}
      />

      <div className="flex flex-col lg:pl-64">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1">
          {/* Page title & actions */}
          <div className="border-b border-gray-200 px-4 py-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg/6 font-medium text-gray-900 sm:truncate">
                Booking Dashboard
              </h1>
            </div>
            <div className="mt-4 flex sm:mt-0 sm:ml-4">
              <button
                type="button"
                className="order-1 ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:order-0 sm:ml-0"
              >
                Export Schedule
              </button>
              <button
                type="button"
                className="order-0 inline-flex items-center rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-purple-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 sm:order-1 sm:ml-3"
              >
                New Booking
              </button>
            </div>
          </div>

          {/* Booking sections */}
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Stats Overview */}
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Today's Bookings"
                value="24"
                icon={CalendarIcon}
                trend="+4.75%"
                trendDirection="up"
              />
              <StatsCard
                title="Total Revenue"
                value="$1,245"
                icon={CurrencyDollarIcon}
                trend="+10.18%"
                trendDirection="up"
              />
              <StatsCard
                title="Pending Bookings"
                value="12"
                icon={ClockIcon}
                trend="-1.23%"
                trendDirection="down"
              />
              <StatsCard
                title="Active Customers"
                value="245"
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
      </div>
    </div>
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
    <div className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6">
      <dt>
        <div className="absolute rounded-md bg-purple-500 p-3">
          <Icon className="h-6 w-6 text-white" aria-hidden="true" />
        </div>
        <p className="ml-16 truncate text-sm font-medium text-gray-500">
          {title}
        </p>
      </dt>
      <dd className="ml-16 flex items-baseline">
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
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

export default DashboardPage;
