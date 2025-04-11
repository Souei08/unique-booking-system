import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { signout } from "@/app/_api/actions/auth/actions"; // Import the signout function
import Image from "next/image";
export const UserProfile = ({ user }: { user: any }) => {
  return (
    <Menu
      as="div"
      className="relative inline-block px-3 text-left mt-auto mb-2"
    >
      <div>
        <MenuButton className="group w-full rounded-md bg-fill px-3.5 py-2 text-left text-sm font-medium  focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-gray-100 focus:outline-hidden">
          <span className="flex w-full items-center justify-between">
            <span className="flex min-w-0 items-center justify-between space-x-3">
              <Image
                alt={user.email}
                src={user.user_metadata.avatar_url}
                className="size-10 shrink-0 rounded-full bg-gray-300"
                width={40}
                height={40}
              />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-small font-medium text-strong">
                  {user.user_metadata.name}
                </span>
                <span className="truncate text-small text-weak capitalize">
                  {user.role}
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
          items={["View profile", "Settings", "Notifications"]}
        />
        <UserMenuSection items={["Logout"]} onLogout={signout} />
      </MenuItems>
    </Menu>
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
          className="block px-4 py-2 text-small text-weak data-focus:bg-gray-100 data-focus:text-strong data-focus:outline-hidden"
        >
          {item}
        </a>
      </MenuItem>
    ))}
  </div>
);
