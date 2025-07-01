import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import {
  ChevronUpDownIcon,
  UserIcon,
  Cog6ToothIcon,
  BellIcon,
} from "@heroicons/react/20/solid";
import { signout } from "@/app/_api/actions/auth/actions";
import Image from "next/image";
import Link from "next/link";

interface UserProfileProps {
  user: any;
  isCollapsed?: boolean;
}

export const UserProfile = ({
  user,
  isCollapsed = false,
}: UserProfileProps) => {
  console.log(user);

  if (isCollapsed) {
    return (
      <Menu as="div" className="relative">
        <MenuButton className="flex justify-center w-full">
          <Image
            alt={user.email}
            src={"/auth/photo-1522075469751-3a6694fb2f61 (1).avif"}
            className="size-10 shrink-0 rounded-full bg-gray-300 cursor-pointer hover:opacity-80 transition-opacity"
            width={40}
            height={40}
            title={`${user.user_metadata.name || user.full_name || user.email?.split("@")[0] || "User"} (${user.role})`}
          />
        </MenuButton>
        <MenuItems
          anchor="right end"
          transition
          className="w-80 z-10 mx-3 mt-1 divide-y divide-gray-200 rounded-md bg-white ring-1 shadow-lg ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
        >
          <UserMenuSection
            items={[
              {
                name: "View Profile",
                icon: UserIcon,
                href: "/dashboard/profile",
              },
              {
                name: "Settings",
                icon: Cog6ToothIcon,
                href: "/dashboard/settings",
              },
              {
                name: "Notifications",
                icon: BellIcon,
                href: "/dashboard/notifications",
              },
            ]}
          />
          <UserMenuSection
            items={[{ name: "Logout", icon: null, href: null }]}
            onLogout={signout}
          />
        </MenuItems>
      </Menu>
    );
  }

  return (
    <Menu as="div" className="relative ">
      <div>
        <MenuButton className="group w-full rounded-md  text-left text-sm font-medium focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-gray-100 focus:outline-hidden">
          <span className="flex w-full items-center justify-between">
            <span className="flex min-w-0 items-center justify-between space-x-3">
              <Image
                alt={user.email}
                src={"/auth/photo-1522075469751-3a6694fb2f61 (1).avif"}
                className="size-10 shrink-0 rounded-full bg-gray-300"
                width={40}
                height={40}
              />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-small font-medium text-strong">
                  {user.user_metadata.name ||
                    user.full_name ||
                    user.email?.split("@")[0] ||
                    "User"}
                </span>
                <span className="truncate text-xs text-weak capitalize">
                  {user.role === "reservation_agent"
                    ? "Reservation Agent"
                    : user.role === "reseller"
                      ? "Reseller"
                      : user.role}
                </span>
              </span>
            </span>
            <ChevronUpDownIcon
              aria-hidden="true"
              className="size-5 shrink-0 text-gray-400 group-hover:text-gray-500"
            />
          </span>
        </MenuButton>
      </div>
      <MenuItems
        anchor="right end"
        transition
        className="w-80 z-10 mx-3 mt-1 divide-y divide-gray-200 rounded-md bg-white ring-1 shadow-lg ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
      >
        <UserMenuSection
          items={[
            {
              name: "View Profile",
              icon: UserIcon,
              href: "/dashboard/profile",
            },
            {
              name: "Settings",
              icon: Cog6ToothIcon,
              href: "/dashboard/settings",
            },
            {
              name: "Notifications",
              icon: BellIcon,
              href: "/dashboard/notifications",
            },
          ]}
        />
        <UserMenuSection
          items={[{ name: "Logout", icon: null, href: null }]}
          onLogout={signout}
        />
      </MenuItems>
    </Menu>
  );
};

interface MenuItem {
  name: string;
  icon: React.ElementType | null;
  href: string | null;
}

const UserMenuSection = ({
  items,
  onLogout,
}: {
  items: MenuItem[];
  onLogout?: () => void;
}) => (
  <div className="py-1">
    {items.map((item) => (
      <MenuItem key={item.name}>
        {item.href ? (
          <Link
            href={item.href}
            className="flex items-center px-4 py-2 text-small text-weak hover:bg-gray-100 hover:text-strong focus:outline-hidden"
          >
            {item.icon && (
              <item.icon className="mr-3 size-4" aria-hidden="true" />
            )}
            {item.name}
          </Link>
        ) : (
          <button
            onClick={onLogout}
            className="flex w-full items-center px-4 py-2 text-small text-weak hover:bg-gray-100 hover:text-strong focus:outline-hidden"
          >
            {item.name}
          </button>
        )}
      </MenuItem>
    ))}
  </div>
);
