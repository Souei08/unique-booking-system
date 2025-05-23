import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BookingTable } from "../types/booking-types";
import { getOneBooking } from "../api/getOneBooking";
import { updateBookingStatus } from "../api/UpdateBookingStatus";
import { rescheduleBooking } from "../api/RescheduleBooking";
import RescheduleBookingModal from "./RescheduleBookingModal";
import {
  CalendarDays,
  Clock,
  Users,
  CreditCard,
  Package,
  Printer,
  RefreshCw,
  UserCog,
  XCircle,
} from "lucide-react";

// Format date to be more readable
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "Not set";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Format time to be more readable
const formatTime = (timeString: string | undefined) => {
  if (!timeString) return "Not set";
  return timeString.replace(/(\d{2}):(\d{2})/, (_, hours, minutes) => {
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  });
};

// Format price with commas
const formatPrice = (price: number | undefined) => {
  if (!price) return "$0.00";
  return `$${price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
};

interface UpdateBookingProps {
  bookingId: string;
  manageToken: string;
  onClose: () => void;
  onUpdate: (updatedBooking: Partial<BookingTable>) => Promise<void>;
}

const UpdateBooking: React.FC<UpdateBookingProps> = ({
  bookingId,
  manageToken,
  onClose,
  onUpdate,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [booking, setBooking] = useState<BookingTable | null>(null);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);

  const fetchBooking = async () => {
    setIsFetching(true);
    try {
      const bookingDetails = await getOneBooking(bookingId);
      if (bookingDetails) {
        setBooking(bookingDetails);
      } else {
        toast.error("Booking not found");
        onClose();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch booking details");
    } finally {
      setIsFetching(false);
    }
  };

  const handleCheckIn = async () => {
    if (!booking) return;

    setIsLoading(true);
    try {
      await updateBookingStatus(bookingId, "checked_in");
      await onUpdate({ booking_status: "checked_in" });
      setBooking((prev) =>
        prev ? { ...prev, booking_status: "checked_in" } : null
      );
      toast.success("Booking checked in successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to check in booking");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReschedule = async (newDate: string, newTime: string) => {
    if (!booking) return;

    setIsLoading(true);
    try {
      // Call the reschedule booking API
      const result = await rescheduleBooking({
        booking_id: bookingId,
        new_booking_date: newDate,
        new_selected_time: newTime,
      });

      if (result.success) {
        // Update local state
        await onUpdate({
          booking_date: newDate,
          selected_time: newTime,
        });
        setBooking((prev) =>
          prev
            ? {
                ...prev,
                booking_date: newDate,
                selected_time: newTime,
              }
            : null
        );
        toast.success("Booking rescheduled successfully");
      } else {
        throw new Error("Failed to reschedule booking");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to reschedule booking");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, []);

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-white rounded-t-xl border-b px-4 sm:px-8 py-4 sm:py-6">
        <div className="flex flex-wrap justify-between items-start gap-4 sm:gap-6">
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              {booking?.full_name}
            </h1>
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                <span>{booking?.phone_number || "N/A"}</span>
                <span className="hidden sm:inline">•</span>
                <span className="block sm:inline">{booking?.email}</span>
              </div>
              <p className="text-sm text-gray-500">Booking ID: {bookingId}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide ${
                booking?.booking_status === "pending"
                  ? "bg-amber-100 text-amber-700"
                  : booking?.booking_status === "confirmed"
                  ? "bg-emerald-100 text-emerald-700"
                  : booking?.booking_status === "checked_in"
                  ? "bg-blue-100 text-blue-700"
                  : booking?.booking_status === "cancelled"
                  ? "bg-red-100 text-red-700"
                  : booking?.booking_status === "rescheduled"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {booking?.booking_status}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 bg-gray-50">
        {/* Tour and Payment Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
          {/* Tour Information */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Tour Details
              </h2>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1 sm:mb-2">
                    Tour Package
                  </p>
                  <p className="text-base font-medium text-gray-900">
                    {booking?.tour_title}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1 sm:mb-2">
                    Number of Guests
                  </p>
                  <div className="flex items-center gap-2 text-base font-medium text-gray-900">
                    <Users className="w-5 h-5 text-gray-400" />
                    {booking?.slots}{" "}
                    {booking?.slots && booking.slots > 1 ? "People" : "Person"}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1 sm:mb-2">
                    Booking Date
                  </p>
                  <div className="flex items-center gap-2 text-base font-medium text-gray-900">
                    <CalendarDays className="w-5 h-5 text-gray-400" />
                    {formatDate(booking?.booking_date)}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1 sm:mb-2">
                    Selected Time
                  </p>
                  <div className="flex items-center gap-2 text-base font-medium text-gray-900">
                    <Clock className="w-5 h-5 text-gray-400" />
                    {formatTime(booking?.selected_time)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Payment Details
              </h2>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1 sm:mb-2">
                    Payment Status
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide ${
                        booking?.payment_status === "paid"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {booking?.payment_status || "paid"}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1 sm:mb-2">
                    Payment Method
                  </p>
                  <div className="flex items-center gap-2 text-base font-medium text-gray-900">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    {booking?.payment_method || "Credit Card"}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1 sm:mb-2">
                    Payment Amount
                  </p>
                  <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                    {formatPrice(booking?.total_price)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1 sm:mb-2">
                    Transaction ID
                  </p>
                  <p className="text-base font-medium text-gray-900 break-all">
                    {booking?.transaction_id || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Products */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Additional Products
            </h2>
          </div>
          <div className="p-4 sm:p-6">
            {booking?.additional_products &&
            booking.additional_products.length > 0 ? (
              <div className="space-y-4">
                {booking.additional_products.map((product) => (
                  <div
                    key={product.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-200 last:border-0 gap-2 sm:gap-4"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {product.quantity} × {formatPrice(product.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatPrice(product.total)}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-gray-200 gap-2">
                  <p className="font-medium text-gray-900">
                    Total Additional Products
                  </p>
                  <p className="font-semibold text-gray-900">
                    {formatPrice(
                      booking.additional_products.reduce(
                        (sum, product) => sum + product.total,
                        0
                      )
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">
                  No additional products purchased
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Actions</h2>
          <div className="space-y-4">
            {/* Primary Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="w-full sm:flex-1 min-w-[180px] h-11 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleCheckIn}
                disabled={isLoading || booking?.booking_status === "Checked In"}
              >
                {isLoading ? "Checking In..." : "Check In"}
              </Button>
              <Button
                variant="outline"
                className="w-full sm:flex-1 min-w-[180px] h-11 border-gray-300 hover:bg-gray-50"
                onClick={() => setIsRescheduleModalOpen(true)}
                disabled={isLoading || booking?.booking_status === "cancelled"}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reschedule
              </Button>
              <Button
                variant="outline"
                className="w-full sm:flex-1 min-w-[180px] h-11 border-gray-300 hover:bg-gray-50"
                disabled
              >
                <UserCog className="w-4 h-4 mr-2" />
                Update Customer Info
              </Button>
            </div>

            {/* Secondary Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="w-full sm:flex-1 min-w-[180px] h-11 text-red-600 border-red-200 hover:bg-red-50"
                disabled
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancel booking
              </Button>
              <Button
                variant="outline"
                className="w-full sm:flex-1 min-w-[180px] h-11 border-gray-300 hover:bg-gray-50"
                disabled
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refund
              </Button>
              <Button
                variant="outline"
                className="w-full sm:flex-1 min-w-[180px] h-11 border-gray-300 hover:bg-gray-50"
                disabled
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Reschedule Modal */}
      <RescheduleBookingModal
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        onReschedule={handleReschedule}
        currentDate={booking?.booking_date}
        currentTime={booking?.selected_time}
        tourId={booking?.tour_id || ""}
      />
    </div>
  );
};

export default UpdateBooking;
