import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { EllipsisVerticalIcon, CalendarIcon } from "@heroicons/react/20/solid";
import type { Booking } from "./BookingsList";

interface RecentBookingsProps {
  bookings: Booking[];
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export const RecentBookings = ({ bookings }: RecentBookingsProps) => {
  return (
    <div className="mt-6">
      <h2 className="text-sm font-medium text-gray-900">Recent Bookings</h2>
      <ul
        role="list"
        className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4"
      >
        {bookings.map((booking) => (
          <li
            key={booking.id}
            className="relative col-span-1 flex rounded-md shadow-sm"
          >
            <div
              className={classNames(
                booking.bgColorClass,
                "flex w-16 shrink-0 items-center justify-center rounded-l-md text-white"
              )}
            >
              <CalendarIcon className="h-6 w-6" />
            </div>
            <div className="flex flex-1 items-center justify-between truncate rounded-r-md border-t border-r border-b border-gray-200 bg-white">
              <div className="flex-1 truncate px-4 py-2 text-sm">
                <a
                  href="#"
                  className="font-medium text-gray-900 hover:text-gray-600"
                >
                  {booking.service}
                </a>
                {/* <p className="text-gray-500">{booking.customer.name}</p> */}
                <p className="text-gray-500">John Doe</p>
                <p className="text-gray-500">
                  {booking.date} • {booking.startTime} - {booking.endTime}
                </p>
              </div>
              <BookingMenu />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const BookingMenu = () => (
  <Menu as="div" className="shrink-0 pr-2">
    <MenuButton className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:outline-hidden">
      <span className="sr-only">Open options</span>
      <EllipsisVerticalIcon className="h-5 w-5" />
    </MenuButton>
    <MenuItems
      transition
      className="absolute right-10 z-10 mt-1 w-48 origin-top-right divide-y divide-gray-200 rounded-md bg-white ring-1 shadow-lg ring-black/5 focus:outline-hidden"
    >
      <div className="py-1">
        <MenuItem>
          <a href="#" className="block px-4 py-2 text-sm text-gray-700">
            View Details
          </a>
        </MenuItem>
      </div>
      <div className="py-1">
        <MenuItem>
          <a href="#" className="block px-4 py-2 text-sm text-gray-700">
            Edit Booking
          </a>
        </MenuItem>
        <MenuItem>
          <a href="#" className="block px-4 py-2 text-sm text-gray-700">
            Cancel Booking
          </a>
        </MenuItem>
      </div>
    </MenuItems>
  </Menu>
);
