import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { BookingTable } from "@/app/_features/booking/types/booking-types";
import { BookingCard } from "./BookingCard";
import { Calendar, CalendarDays } from "lucide-react";

interface UpcomingToursProps {
  bookings: BookingTable[];
}

export const UpcomingTours = ({ bookings }: UpcomingToursProps) => {
  return (
    <Card className="transition-all duration-200 hover:shadow-lg bg-background border-stroke-weak">
      <CardHeader className="border-b border-stroke-weak bg-neutral">
        <CardTitle className="text-h2 text-strong">Upcoming Tours</CardTitle>
        <CardDescription className="text-weak">
          Next scheduled tours and activities
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} variant="tour" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CalendarDays className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No upcoming tours
            </h3>
            <p className="text-gray-500 max-w-sm">
              There are no tours scheduled for today or the near future. New
              bookings will appear here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
