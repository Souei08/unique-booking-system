import {
  CalendarIcon,
  UserGroupIcon,
  HomeIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

import SidebarWrapper from "./_components/SidebarWrapper";

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

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full">
      <SidebarWrapper>
        <div className="flex flex-col lg:pl-64">{children}</div>
      </SidebarWrapper>
    </div>
  );
}
