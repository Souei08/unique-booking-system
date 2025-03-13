import type { Booking } from "../shared/types";

interface BookingsTableProps {
  bookings: Booking[];
  className?: string;
}

export const BookingsTable = ({ bookings, className }: BookingsTableProps) => {
  return (
    <div className={`mt-8 ${className}`}>
      <div className="inline-block min-w-full border-b border-gray-200 align-middle">
        <table className="min-w-full">
          <thead>
            <tr className="border-t border-gray-200">
              <th className="border-b border-gray-200 bg-gray-50 px-6 py-3 text-left text-sm font-semibold text-gray-900">
                <span className="lg:pl-2">Service & Customer</span>
              </th>
              <th className="border-b border-gray-200 bg-gray-50 px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Time
              </th>
              <th className="border-b border-gray-200 bg-gray-50 px-6 py-3 text-right text-sm font-semibold text-gray-900">
                Status
              </th>
              <th className="border-b border-gray-200 bg-gray-50 px-6 py-3 text-right text-sm font-semibold text-gray-900">
                Price
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-900">
                  <div className="flex items-center">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: booking.bgColorClass }}
                    />
                    <div className="ml-4">
                      <div className="font-medium">{booking.service}</div>
                      <div className="text-gray-500">
                        {booking.customer.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-500">
                  <div>{booking.date}</div>
                  <div>
                    {booking.startTime} - {booking.endTime}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-3 text-right text-sm text-gray-500">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      booking.status === "Confirmed"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {booking.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-3 text-right text-sm text-gray-500">
                  {booking.price}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
