import type { NavigationItem } from "../shared/types";

import {
  HomeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  BookOpenIcon,
  StarIcon,
  ChartBarIcon,
  UserCircleIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

const navigation: NavigationItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon, current: true },
  {
    name: "Bookings",
    href: "/dashboard/bookings",
    icon: BookOpenIcon,
    current: false,
  },
  {
    name: "Rentals",
    // href: "/dashboard/rentals",
    href: "#",
    icon: BookOpenIcon,
    current: false,
  },
  {
    name: "Users",
    href: "/dashboard/customers",
    icon: UserGroupIcon,
    current: false,
  },
  {
    name: "Payment & Transactions",
    href: "#",
    icon: CurrencyDollarIcon,
    current: false,
  },
  {
    name: "Reviews & Ratings",
    href: "#",
    icon: StarIcon,
    current: false,
  },
  {
    name: "Reports & Analytics",
    href: "#",
    icon: ChartBarIcon,
    current: false,
  },
  {
    name: "Admin & Roles",
    href: "#",
    icon: UserCircleIcon,
    current: false,
  },
  {
    name: "Settings",
    href: "#",
    icon: Cog6ToothIcon,
    current: false,
  },
  // {
  //   name: "History",
  //   href: "/dashboard/history",
  //   icon: ClockIcon,
  //   current: false,
  // },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export const Navigation = () => {
  return (
    <nav className="px-2 mt-5">
      <div className="space-y-1">
        {navigation.map((item) => (
          <a
            key={item.name}
            href={item.href}
            aria-current={item.current ? "page" : undefined}
            className={classNames(
              item.current
                ? "bg-fill text-strong"
                : "text-weak hover:bg-fill hover:text-strong",
              "group flex items-center rounded-md px-2 py-2 text-base/5 font-medium"
            )}
          >
            <item.icon
              aria-hidden="true"
              className={classNames(
                item.current
                  ? "text-strong"
                  : "text-weak group-hover:text-strong",
                "mr-3 size-6 shrink-0"
              )}
            />
            {item.name}
          </a>
        ))}
      </div>
    </nav>
  );
};
