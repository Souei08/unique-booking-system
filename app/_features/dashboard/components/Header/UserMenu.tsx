import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { signout } from "@/app/_api/actions/auth/actions";
import Image from "next/image";

interface UserMenuProps {
  user: any;
}

export const UserMenu = ({ user }: UserMenuProps) => {
  return (
    <div className="flex items-center">
      <Menu as="div" className="relative ml-3">
        <div>
          <MenuButton className="relative flex max-w-xs items-center rounded-md bg-white text-sm focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:outline-hidden">
            <span className="absolute -inset-1.5" />
            <span className="sr-only">Open user menu</span>
            <div className="flex items-center space-x-3">
              <Image
                alt={user.email}
                src={"/auth/photo-1522075469751-3a6694fb2f61 (1).avif"}
                className="size-9 border border-gray-200 rounded-md"
                width={32}
                height={32}
              />
              <div className="text-left">
                <div className="text-sm font-medium text-strong">
                  {user.user_metadata?.name || "Web Developer"}
                </div>
                <div className="text-xs text-weak capitalize">
                  {user.role === "reservation_agent"
                    ? "Reservation Agent"
                    : user.role === "reseller"
                      ? "Reseller"
                      : user.role}
                </div>
              </div>
              <ChevronUpDownIcon
                aria-hidden="true"
                className="size-5 shrink-0 text-gray-400 group-hover:text-gray-500"
              />
            </div>
          </MenuButton>
        </div>
        <MenuItems
          transition
          className="absolute right-0 z-10 mt-2 w-48 origin-top-right divide-y divide-gray-200 rounded-md bg-white ring-1 shadow-lg ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
        >
          {/* <UserMenuSection
            items={["View profile", "Settings", "Notifications"]}
          />
          <UserMenuSection items={["Get desktop app", "Support"]} /> */}
          <UserMenuSection items={["Logout"]} onLogout={signout} />
        </MenuItems>
      </Menu>
    </div>
  );
};

const UserMenuSection = ({
  items,
  onLogout,
}: {
  items: string[];
  onLogout?: () => void;
}) => (
  <div className="py-1">
    {items.map((item) => (
      <MenuItem key={item}>
        <a
          href="#"
          onClick={item === "Logout" ? onLogout : undefined}
          className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
        >
          {item}
        </a>
      </MenuItem>
    ))}
  </div>
);
