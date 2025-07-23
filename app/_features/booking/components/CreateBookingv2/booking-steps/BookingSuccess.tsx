import React, { useEffect, useState } from "react";
import { CheckCircle2, Copy, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tour } from "@/app/_features/tours/tour-types";
import { DateValue, getLocalTimeZone } from "@internationalized/date";
import { toast } from "sonner";
import { getOneBooking } from "@/app/_features/booking/api/get-booking/getOneBooking";
import { BookingTable } from "@/app/_features/booking/types/booking-types";
import { formatTime } from "@/app/_lib/utils/formatTime";
import { format } from "date-fns";

interface BookingSuccessProps {
  selectedTour: Tour;
  selectedDate: DateValue | null;
  selectedTime: string;
  bookingId: string;
  onClose: () => void;
  isAdmin?: boolean;
}

const BookingSuccess = ({
  selectedTour,
  selectedDate,
  selectedTime,
  bookingId,
  onClose,
  isAdmin = false,
}: BookingSuccessProps) => {
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingDetails, setBookingDetails] = useState<BookingTable | null>(
    null
  );

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const booking = await getOneBooking(bookingId, null);

        if (!booking) {
          console.error("No booking found with ID:", bookingId);
          return;
        }

        setBookingDetails(booking);
        if (booking.payment_link) {
          setPaymentLink(booking.payment_link);
        }
      } catch (error) {
        console.error("Error fetching booking details:", error);
        toast.error("Failed to fetch booking details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const getSuccessMessage = () => {
    if (isAdmin) {
      return "Booking created successfully. Confirmation sent to customer.";
    }
    return "Your booking has been recorded successfully. Please check your email for confirmation details.";
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Booking Confirmed
        </h1>
        <p className="text-gray-600">{getSuccessMessage()}</p>
      </div>

      {/* Booking Details */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Booking Details
        </h2>

        <div className="space-y-4">
          {/* Tour Info */}
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Tour</p>
              <p className="font-medium">{selectedTour.title}</p>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">
                {format(
                  selectedDate?.toDate(getLocalTimeZone()) || new Date(),
                  "EEEE, MMMM d, yyyy"
                )}
              </p>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Time</p>
              <p className="font-medium">{formatTime(selectedTime)}</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 text-gray-500">@</div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium break-all">
                {bookingDetails?.email || "Loading..."}
              </p>
            </div>
          </div>

          {/* Booking ID */}
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Booking ID: {bookingId}</p>
          </div>
        </div>
      </div>

      {/* Payment Link */}
      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2 w-1/3"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      ) : paymentLink ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Payment Link
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={paymentLink}
              readOnly
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm"
            />
            <Button
              onClick={() => {
                navigator.clipboard.writeText(paymentLink);
                toast.success("Payment link copied");
              }}
              variant="outline"
              size="sm"
            >
              <Copy className="w-4 h-4 mr-1" />
              Copy
            </Button>
          </div>
        </div>
      ) : null}

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-3">Next Steps</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">
              1
            </span>
            <p>Check your email for booking confirmation</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">
              2
            </span>
            <p>Complete payment if payment link is provided</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">
              3
            </span>
            <p>Review tour details and prepare for your experience</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
