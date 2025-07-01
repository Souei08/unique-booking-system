import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { BookingTable } from "@/app/_features/booking/types/booking-types";
import { BookingCard } from "./BookingCard";
import { Clock, Receipt } from "lucide-react";

interface RecentBookingsProps {
  bookings: BookingTable[];
}

export const RecentBookings = ({ bookings }: RecentBookingsProps) => {
  return (
    <Card className="transition-all duration-200 hover:shadow-lg bg-background border-stroke-weak">
      <CardHeader className="border-b border-stroke-weak bg-neutral">
        <CardTitle className="text-h2 text-strong">Recent Bookings</CardTitle>
        <CardDescription className="text-weak">
          Latest tour and equipment bookings
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                variant="booking"
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Receipt className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No recent bookings
            </h3>
            <p className="text-gray-500 max-w-sm">
              No completed bookings found. Completed tours and rentals will
              appear here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
