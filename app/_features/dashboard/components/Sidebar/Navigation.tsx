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

import { Tooltip } from "@/components/ui/tooltip";

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
        href: "/dashboard", // Main dashboard overview
        icon: HomeIcon,
        roles: ["admin", "reservation_agent", "reseller"],
      },
    ],
  },
  {
    name: "Bookings & Tours",
    items: [
      {
        name: "All Bookings",
        href: "/dashboard/bookings",
        icon: BookOpenIcon,
        roles: ["admin", "reservation_agent", "reseller"],
      },
      {
        name: "Calendar",
        href: "/dashboard/calendar",
        icon: CalendarIcon,
        roles: ["admin", "reservation_agent", "reseller"],
      },
      {
        name: "Tours",
        href: "/dashboard/tours",
        icon: GlobeAmericasIcon,
        roles: ["admin"],
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
        roles: ["admin"],
      },
      {
        name: "Users",
        href: "/dashboard/users",
        icon: UserGroupIcon,
        roles: ["admin"],
      },
      {
        name: "Promo Codes",
        href: "/dashboard/promo-codes",
        icon: TicketIcon,
        roles: ["admin"],
      },
    ],
  },
  {
    name: "Analytics",
    items: [
      {
        name: "Analytics",
        href: "/dashboard/analytics",
        icon: ChartBarIcon,
        roles: ["admin"],
      },
      // {
      //   name: "Settings",
      //   href: "/dashboard/settings",
      //   icon: Cog6ToothIcon,
      //   roles: ["admin", "reservation_agent"],
      // },
    ],
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

interface NavigationProps {
  user: any;
  isCollapsed?: boolean;
}

export const Navigation = ({ user, isCollapsed = false }: NavigationProps) => {
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

  const NavigationLink = ({
    item,
    isCurrent,
  }: {
    item: NavigationItem;
    isCurrent: boolean;
  }) => {
    const linkContent = (
      <Link
        href={item.href}
        aria-current={isCurrent ? "page" : undefined}
        className={classNames(
          isCurrent
            ? "bg-brand/20 text-strong font-semibold"
            : "text-weak hover:text-strong hover:bg-brand/5",
          isCollapsed
            ? "group flex items-center justify-center rounded-md p-2 text-sm font-medium"
            : "group flex items-center rounded-md px-2 py-2 text-sm font-medium"
        )}
      >
        <item.icon
          aria-hidden="true"
          className={classNames(
            isCurrent ? "text-strong" : "text-weak group-hover:text-strong",
            isCollapsed ? "size-6" : "mr-3 size-6 shrink-0"
          )}
        />
        {!isCollapsed && item.name}
      </Link>
    );

    if (isCollapsed) {
      return (
        <Tooltip content={item.name} side="right">
          {linkContent}
        </Tooltip>
      );
    }

    return linkContent;
  };

  return (
    <div className="flex flex-col h-full">
      <nav className={`${isCollapsed ? "px-1" : "px-2"} mt-5 flex-1`}>
        <div className="space-y-6">
          {filteredNavigationGroups.map((group) => (
            <div key={group.name}>
              {!isCollapsed && (
                <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {group.name}
                </h3>
              )}
              <div className="mt-2 space-y-1">
                {group.items.map((item) => {
                  const isCurrent = currentPath === item.href;
                  return (
                    <NavigationLink
                      key={item.name}
                      item={item}
                      isCurrent={isCurrent}
                    />
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
