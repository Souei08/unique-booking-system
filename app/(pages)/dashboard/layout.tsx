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

// Booking categories/services
export const services = [
  {
    name: "Spa Services",
    href: "#",
    bgColorClass: "bg-indigo-500",
    icon: HomeIcon,
    current: false,
  },
  {
    name: "Massage",
    href: "#",
    bgColorClass: "bg-green-500",
    icon: CalendarIcon,
    current: false,
  },
  {
    name: "Hair Salon",
    href: "#",
    bgColorClass: "bg-yellow-500",
    icon: UserGroupIcon,
    current: false,
  },
  {
    name: "Nail Care",
    href: "#",
    bgColorClass: "bg-pink-500",
    icon: CurrencyDollarIcon,
    current: false,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-full">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col lg:pl-64">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />
        {children}
      </div>
    </div>
  );
}
