"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  GlobeAmericasIcon,
  ShoppingBagIcon,
  BookOpenIcon,
  ChartBarIcon,
  TicketIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: string[]; // Allowed roles
}

interface NavigationGroup {
  name: string;
  items: NavigationItem[];
}

// Define navigation groups with role-based access
const navigationGroups: NavigationGroup[] = [
  {
    name: "Overview",
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: HomeIcon,
        roles: ["admin", "staff", "customer", "reservation_agent"],
      },
    ],
  },
  {
    name: "Bookings & Tours",
    items: [
      {
        name: "Bookings",
        href: "/dashboard/bookings",
        icon: BookOpenIcon,
        roles: ["admin", "staff", "customer", "reservation_agent"],
      },
      {
        name: "Calendar",
        href: "/dashboard/calendar",
        icon: CalendarIcon,
        roles: ["admin", "staff", "customer", "reservation_agent"],
      },

      {
        name: "Tours",
        href: "/dashboard/tours",
        icon: GlobeAmericasIcon,
        roles: ["admin", "staff", "reservation_agent"],
      },
    ],
  },
  {
    name: "Management",
    items: [
      {
        name: "Products",
        href: "/dashboard/products",
        icon: ShoppingBagIcon,
        roles: ["admin", "staff", "reservation_agent"],
      },
      {
        name: "Users",
        href: "/dashboard/users",
        icon: UserGroupIcon,
        roles: ["admin", "reservation_agent"],
      },
      {
        name: "Promo Codes",
        href: "/dashboard/promo-codes",
        icon: TicketIcon,
        roles: ["admin", "staff", "reservation_agent"],
      },
    ],
  },
  {
    name: "Analytics & Settings",
    items: [
      {
        name: "Analytics",
        href: "/dashboard/analytics",
        icon: ChartBarIcon,
        roles: ["admin"],
      },
      {
        name: "Settings",
        href: "/dashboard/settings",
        icon: Cog6ToothIcon,
        roles: ["admin", "staff", "customer", "reservation_agent"],
      },
    ],
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export const Navigation = ({ user }: { user: any }) => {
  const userRole = user?.role;

  if (!userRole) return null; // Hide sidebar if no user

  // Filter navigation groups based on user role
  const filteredNavigationGroups = navigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles.includes(userRole)),
    }))
    .filter((group) => group.items.length > 0);

  const currentPath = usePathname();

  return (
    <div className="flex flex-col h-full">
      <nav className="px-2 mt-5 flex-1">
        <div className="space-y-6">
          {filteredNavigationGroups.map((group) => (
            <div key={group.name}>
              <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {group.name}
              </h3>
              <div className="mt-2 space-y-1">
                {group.items.map((item) => {
                  const isCurrent = currentPath === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      aria-current={isCurrent ? "page" : undefined}
                      className={classNames(
                        isCurrent
                          ? "bg-brand/20  text-strong font-semibold"
                          : "text-weak  hover:text-strong hover:bg-brand/5",
                        "group flex items-center rounded-md px-2 py-2 text-sm font-medium"
                      )}
                    >
                      <item.icon
                        aria-hidden="true"
                        className={classNames(
                          isCurrent
                            ? "text-strong"
                            : "text-weak group-hover:text-strong",
                          "mr-3 size-6 shrink-0"
                        )}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
};
