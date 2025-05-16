"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  GlobeAmericasIcon,
} from "@heroicons/react/24/outline";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: string[]; // Allowed roles
}

// Define navigation items with role-based access
const navigationItems: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: HomeIcon,
    roles: ["admin", "staff", "customer"],
  },
  {
    name: "Bookings",
    href: "/dashboard/bookings",
    icon: CalendarIcon,
    roles: ["admin", "staff", "customer"],
  },
  {
    name: "Tours",
    href: "/dashboard/tours",
    icon: GlobeAmericasIcon,
    roles: ["admin", "staff"],
  },
  {
    name: "Users",
    href: "/dashboard/users",
    icon: UserGroupIcon,
    roles: ["admin"],
  },
  // {
  //   name: "Rentals",
  //   href: "/dashboard/rentals",
  //   icon: BuildingOfficeIcon,
  //   roles: ["admin", "staff"],
  // },
  // {
  //   name: "Users",
  //   href: "/dashboard/users",
  //   icon: UserGroupIcon,
  //   roles: ["admin"],
  // },
  // {
  //   name: "Reports & Analytics",
  //   href: "#",
  //   icon: ChartBarIcon,
  //   roles: ["admin"],
  // },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export const Navigation = ({ user }: { user: any }) => {
  const userRole = user?.role;

  if (!userRole) return null; // Hide sidebar if no user

  // Filter navigation based on user role
  const filteredNavigation = navigationItems.filter((item) =>
    item.roles.includes(userRole)
  );

  const currentPath = usePathname();

  return (
    <nav className="px-2 mt-5">
      <div className="space-y-1">
        {filteredNavigation.map((item) => {
          const isCurrent = currentPath === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              aria-current={isCurrent ? "page" : undefined}
              className={classNames(
                isCurrent
                  ? "bg-brand text-white font-semibold"
                  : "text-weak hover:bg-brand hover:text-white",
                "group flex items-center rounded-md px-2 py-2 text-body font-medium"
              )}
            >
              <item.icon
                aria-hidden="true"
                className={classNames(
                  isCurrent ? "text-white" : "text-weak group-hover:text-white",
                  "mr-3 size-6 shrink-0"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
