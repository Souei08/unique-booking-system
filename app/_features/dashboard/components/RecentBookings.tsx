import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Booking {
  id: number;
  customer: string;
  tour: string;
  date: string;
  amount: string;
  status: "confirmed" | "pending";
}

interface RecentBookingsProps {
  bookings: Booking[];
}

export const RecentBookings = ({ bookings }: RecentBookingsProps) => {
  return (
    <Card className="transition-all duration-200 hover:shadow-lg">
      <CardHeader className="border-b bg-muted/50">
        <CardTitle className="text-xl">Recent Bookings</CardTitle>
        <CardDescription>Latest tour and equipment bookings</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="group flex items-center justify-between rounded-lg border p-4 transition-all duration-200 hover:border-brand/50 hover:bg-muted/50"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold group-hover:text-brand">
                    {booking.customer}
                  </h3>
                  <Badge
                    variant={
                      booking.status === "confirmed" ? "default" : "secondary"
                    }
                    className="font-medium"
                  >
                    {booking.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {booking.tour}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-brand">{booking.amount}</div>
                <div className="text-sm text-muted-foreground">
                  {booking.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
