import { ChevronRightIcon } from "@heroicons/react/20/solid";
import type { Booking } from "../shared/types";

interface BookingsListProps {
  bookings: Booking[];
  className?: string;
}

export const BookingsList = ({ bookings, className }: BookingsListProps) => {
  return (
    <div className={`mt-10 ${className}`}>
      <div className="px-4 sm:px-6">
        <h2 className="text-sm font-medium text-gray-900">Today's Bookings</h2>
      </div>
      <ul className="mt-3 divide-y divide-gray-100 border-t border-gray-200">
        {bookings.map((booking) => (
          <li key={booking.id}>
            <a
              href="#"
              className="group flex items-center justify-between px-4 py-4 hover:bg-gray-50 sm:px-6"
            >
              <span className="flex items-center space-x-3 truncate">
                <span
                  className={`${booking.bgColorClass} h-2.5 w-2.5 shrink-0 rounded-full`}
                />
                <span className="truncate text-sm font-medium">
                  {booking.title} • {booking.time}
                </span>
              </span>
              <ChevronRightIcon className="h-5 w-5 text-gray-400" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
