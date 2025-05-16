"use client";

import { useState } from "react";
import {
  CalendarIcon,
  UserGroupIcon,
  HomeIcon,
  CurrencyDollarIcon,
  ClockIcon,
  MapPinIcon,
  TicketIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import Script from "next/script";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
      status: "confirmed",
    },
    {
      id: 2,
      name: "City Cultural Tour",
      date: "2024-03-26",
      time: "02:00 PM",
      location: "Downtown Area",
      participants: 8,
      guide: "Jane Smith",
      status: "pending",
    },
  ];

  const recentBookings = [
    {
      id: 1,
      customer: "Alice Johnson",
      tour: "Mountain Hiking Adventure",
      date: "2024-03-25",
      amount: "$150",
      status: "confirmed",
    },
    {
      id: 2,
      customer: "Bob Wilson",
      tour: "City Cultural Tour",
      date: "2024-03-26",
      amount: "$75",
      status: "pending",
    },
  ];

  return (
    <>
      <Script
        src="https://scripts.simpleanalytics.com/hello.js"
        strategy="afterInteractive"
      />
      <main className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <Button className="flex items-center gap-2 bg-brand hover:bg-brand/90">
            <PlusIcon className="h-4 w-4" />
            New Tour
          </Button>
        </div>

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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Upcoming Tours */}
          <Card className="transition-all duration-200 hover:shadow-lg">
            <CardHeader className="border-b bg-muted/50">
              <CardTitle className="text-xl">Upcoming Tours</CardTitle>
              <CardDescription>
                Next scheduled tours and activities
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {upcomingTours.map((tour) => (
                  <div
                    key={tour.id}
                    className="group flex items-center justify-between rounded-lg border p-4 transition-all duration-200 hover:border-brand/50 hover:bg-muted/50"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold group-hover:text-brand">
                          {tour.name}
                        </h3>
                        <Badge
                          variant={
                            tour.status === "confirmed"
                              ? "default"
                              : "secondary"
                          }
                          className="font-medium"
                        >
                          {tour.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          {tour.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <ClockIcon className="h-4 w-4" />
                          {tour.time}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPinIcon className="h-4 w-4" />
                          {tour.location}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 ring-2 ring-brand/20">
                        <AvatarFallback className="bg-brand/10 text-brand">
                          {tour.guide[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        <div className="font-medium">{tour.guide}</div>
                        <div className="text-muted-foreground">
                          {tour.participants} participants
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Bookings */}
          <Card className="transition-all duration-200 hover:shadow-lg">
            <CardHeader className="border-b bg-muted/50">
              <CardTitle className="text-xl">Recent Bookings</CardTitle>
              <CardDescription>
                Latest tour and equipment bookings
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="group flex items-center justify-between rounded-lg border p-4 transition-all duration-200 hover:border-brand/50 hover:bg-muted/50"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold group-hover:text-brand">
                          {booking.customer}
                        </h3>
                        <Badge
                          variant={
                            booking.status === "confirmed"
                              ? "default"
                              : "secondary"
                          }
                          className="font-medium"
                        >
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {booking.tour}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-brand">
                        {booking.amount}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {booking.date}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="transition-all duration-200 hover:shadow-lg">
          <CardHeader className="border-b bg-muted/50">
            <CardTitle className="text-xl">Quick Actions</CardTitle>
            <CardDescription>Common tasks and operations</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Button
                variant="outline"
                className="h-24 flex-col gap-2 transition-all duration-200 hover:border-brand hover:bg-brand/5 hover:text-brand"
              >
                <TicketIcon className="h-6 w-6" />
                <span>New Booking</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex-col gap-2 transition-all duration-200 hover:border-brand hover:bg-brand/5 hover:text-brand"
              >
                <CalendarIcon className="h-6 w-6" />
                <span>Schedule Tour</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex-col gap-2 transition-all duration-200 hover:border-brand hover:bg-brand/5 hover:text-brand"
              >
                <UserGroupIcon className="h-6 w-6" />
                <span>Manage Guides</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex-col gap-2 transition-all duration-200 hover:border-brand hover:bg-brand/5 hover:text-brand"
              >
                <HomeIcon className="h-6 w-6" />
                <span>Equipment</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
};

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trendDirection: "up" | "down";
}

const StatsCard = ({
  title,
  value,
  icon: Icon,
  trendDirection,
}: StatsCardProps) => {
  return (
    <Card className="transition-all duration-200 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="rounded-full bg-brand/10 p-2">
          <Icon className="h-4 w-4 text-brand" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <div className="flex items-center pt-1">
          {trendDirection === "up" ? (
            <ArrowUpIcon className="h-4 w-4 text-green-600" />
          ) : (
            <ArrowDownIcon className="h-4 w-4 text-red-600" />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPage;
