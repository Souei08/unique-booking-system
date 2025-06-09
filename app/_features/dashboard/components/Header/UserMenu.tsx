import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

export const UserMenu = () => {
  return (
    <div className="flex items-center">
      <Menu as="div" className="relative ml-3">
        <div>
          <MenuButton className="relative flex max-w-xs items-center rounded-full bg-white text-sm focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:outline-hidden">
            <span className="absolute -inset-1.5" />
            <span className="sr-only">Open user menu</span>
            <img
              alt=""
              src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              className="size-8 rounded-full"
            />
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
          <UserMenuSection items={["Logout"]} />
        </MenuItems>
      </Menu>
    </div>
  );
};

const UserMenuSection = ({ items }: { items: string[] }) => (
  <div className="py-1">
    {items.map((item) => (
      <MenuItem key={item}>
        <a
          href="#"
          className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
        >
          {item}
        </a>
      </MenuItem>
    ))}
  </div>
);
