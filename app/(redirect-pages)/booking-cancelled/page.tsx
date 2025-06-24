import { notFound } from "next/navigation";
import { getOneBooking } from "@/app/_features/booking/api/get-booking/getOneBooking";
import { formatTime } from "@/app/_lib/utils/formatTime";
import { format } from "date-fns";
import Link from "next/link";
import { XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookingTable } from "@/app/_features/booking/types/booking-types";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

interface PageProps {
  params: Promise<{ [key: string]: string }>;
  searchParams: SearchParams;
}

export default async function BookingCancelledPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const bookingId = searchParams?.booking_id;

  if (!bookingId || Array.isArray(bookingId)) {
    return notFound();
  }

  try {
    const booking = await getOneBooking(bookingId, null);
    if (!booking) {
      return notFound();
    }

    return (
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <XCircle className="h-16 w-16 text-red-500 mx-auto" />
            <h1 className="text-3xl font-bold text-strong">
              Booking Cancelled
            </h1>
            <p className="text-lg text-muted-foreground">
              Your booking has been cancelled. If this was a mistake, please
              contact us or try booking again.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Info title="Tour" value={booking.tour_title} />
                <Info title="Booking ID" value={booking.booking_id} />
                <Info
                  title="Date"
                  value={format(new Date(booking.booking_date), "MMMM d, yyyy")}
                />
                <Info title="Time" value={formatTime(booking.selected_time)} />
                <Info
                  title="Number of People"
                  value={`${booking.slots} people`}
                />
                <Info title="Total Amount" value={`$${booking.amount_paid}`} />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Info title="Name" value={booking.full_name} />
                  <Info title="Email" value={booking.email} />
                  <Info title="Phone" value={booking.phone_number} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center space-x-4">
            <Button asChild variant="outline">
              <Link href="/">Return to Home</Link>
            </Button>
            <Button asChild>
              <Link href="/tours">Book Another Tour</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching booking:", error);
    return notFound();
  }
}

function Info({ title, value }: { title: string; value: string }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <p className="mt-1 text-lg font-semibold text-strong">{value}</p>
    </div>
  );
}
