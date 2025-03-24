"use client";

import type { NavigationItem } from "../../../(pages)/dashboard/_components/shared/types";

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

const navigation: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard/admin",
    icon: HomeIcon,
  },
  {
    name: "Bookings",
    href: "/dashboard/admin/bookings",
    icon: CalendarIcon,
  },
  {
    name: "Tours",
    href: "/dashboard/admin/tours",
    icon: GlobeAmericasIcon,
  },
  {
    name: "Rentals",
    href: "/dashboard/admin/rentals",
    icon: BuildingOfficeIcon,
  },
  {
    name: "Users",
    href: "/dashboard/admin/users",
    icon: UserGroupIcon,
  },
  {
    name: "Reports & Analytics",
    href: "#",
    icon: ChartBarIcon,
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export const Navigation = () => {
  const currentPath = usePathname();

  return (
    <nav className="px-2 mt-5">
      <div className="space-y-1">
        {navigation.map((item) => {
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
