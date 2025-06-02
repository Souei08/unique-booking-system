"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTime } from "@/app/_utils/formatTime";
import { format } from "date-fns";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { getOneBooking } from "@/app/_features/booking/api/getOneBooking";
import { BookingTable } from "@/app/_features/booking/types/booking-types";

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("booking_id");
  const [booking, setBooking] = useState<BookingTable | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) {
        setError("No booking ID provided");
        setLoading(false);
        return;
      }

      try {
        const data = await getOneBooking(bookingId);
        if (!data) {
          throw new Error("Booking not found");
        }
        setBooking(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        toast.error("Failed to load booking details");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-lg text-muted-foreground">
            Loading booking details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-4xl">⚠️</div>
          <h1 className="text-2xl font-bold text-strong">Error</h1>
          <p className="text-muted-foreground">
            {error || "Booking not found"}
          </p>
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
          <h1 className="text-3xl font-bold text-strong">Booking Confirmed!</h1>
          <p className="text-lg text-muted-foreground">
            Thank you for your booking. We've sent the details to your email.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Tour
                </h3>
                <p className="mt-1 text-lg font-semibold text-strong">
                  {booking.tour_title}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Booking ID
                </h3>
                <p className="mt-1 text-lg font-semibold text-strong">
                  {booking.booking_id}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Date
                </h3>
                <p className="mt-1 text-lg font-semibold text-strong">
                  {format(new Date(booking.booking_date), "MMMM d, yyyy")}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Time
                </h3>
                <p className="mt-1 text-lg font-semibold text-strong">
                  {formatTime(booking.selected_time)}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Number of People
                </h3>
                <p className="mt-1 text-lg font-semibold text-strong">
                  {booking.slots} people
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Total Amount
                </h3>
                <p className="mt-1 text-lg font-semibold text-strong">
                  ${booking.total_price}
                </p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Name
                  </h4>
                  <p className="mt-1 text-strong">{booking.full_name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Email
                  </h4>
                  <p className="mt-1 text-strong">{booking.email}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Phone
                  </h4>
                  <p className="mt-1 text-strong">{booking.phone_number}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center space-x-4">
          <Button asChild variant="outline">
            <Link href="/">Return to Home</Link>
          </Button>
          <Button asChild>
            <Link href="/bookings">View All Bookings</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
