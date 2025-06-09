"use client";

import { useState } from "react";
import {
  CalendarIcon,
  UserGroupIcon,
  HomeIcon,
  CurrencyDollarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@heroicons/react/24/outline";
import Script from "next/script";
import { StatsCard } from "@/app/_features/dashboard/components/StatsCard";
import { UpcomingTours } from "@/app/_features/dashboard/components/UpcomingTours";
import { RecentBookings } from "@/app/_features/dashboard/components/RecentBookings";
import { QuickActions } from "@/app/_features/dashboard/components/QuickActions";
import ContentLayout from "./ContentLayout";

const AdminPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock data - replace with real data from your API
  const upcomingTours = [
    {
      id: 1,
      name: "Mountain Hiking Adventure",
      date: "2024-03-25",
      time: "09:00 AM",
      location: "Mount Everest Base Camp",
      participants: 12,
      guide: "John Doe",
      status: "confirmed" as const,
    },
    {
      id: 2,
      name: "City Cultural Tour",
      date: "2024-03-26",
      time: "02:00 PM",
      location: "Downtown Area",
      participants: 8,
      guide: "Jane Smith",
      status: "pending" as const,
    },
  ];

  const recentBookings = [
    {
      id: 1,
      customer: "Alice Johnson",
      tour: "Mountain Hiking Adventure",
      date: "2024-03-25",
      amount: "$150",
      status: "confirmed" as const,
    },
    {
      id: 2,
      customer: "Bob Wilson",
      tour: "City Cultural Tour",
      date: "2024-03-26",
      amount: "$75",
      status: "pending" as const,
    },
  ];

  return (
    <>
      <Script
        src="https://scripts.simpleanalytics.com/hello.js"
        strategy="afterInteractive"
      />
      <ContentLayout
        title="Dashboard"
        description="Overview of your tours, bookings, and business metrics"
        // buttonText="New Tour"
        // modalRoute="tours"
        // modalTitle="Create New Tour"
        // modalDescription="Fill in the details to create a new tour"
      >
        <div className="mt-5 space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Today's Tours"
              value="15"
              icon={CalendarIcon}
              trendDirection="up"
            />
            <StatsCard
              title="Total Revenue"
              value="$2,145"
              icon={CurrencyDollarIcon}
              trendDirection="up"
            />
            <StatsCard
              title="Equipment Rentals"
              value="8"
              icon={ClockIcon}
              trendDirection="up"
            />
            <StatsCard
              title="Active Customers"
              value="185"
              icon={UserGroupIcon}
              trendDirection="up"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-6">
            <UpcomingTours tours={upcomingTours} />
            <RecentBookings bookings={recentBookings} />
          </div>

          {/* Quick Actions */}
          <div className="mt-6">
            <QuickActions />
          </div>
        </div>
      </ContentLayout>
    </>
  );
};

export default AdminPage;
