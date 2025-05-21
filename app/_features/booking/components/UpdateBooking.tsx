import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BookingTable } from "../types/booking-types";
import { getOneBooking } from "../api/getOneBooking";
import { updateBookingStatus } from "../api/UpdateBookingStatus";
import { rescheduleBooking } from "../api/RescheduleBooking";
import RescheduleBookingModal from "./RescheduleBookingModal";

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
    <div>
      {/* Header */}
      <div className="flex flex-col border-b px-6 py-5">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="space-y-1.5">
            <h1 className="text-h1 font-semibold text-strong">
              {booking?.full_name}
            </h1>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2 text-small text-weak">
                <span>{booking?.phone_number || "N/A"}</span>
                <span>•</span>
                <span>{booking?.email}</span>
              </div>
              <p className="text-small text-weak">Booking ID: {bookingId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-tiny font-bold uppercase ${
                booking?.booking_status === "pending"
                  ? "bg-amber-500 text-white"
                  : booking?.booking_status === "confirmed"
                  ? "bg-emerald-500 text-white"
                  : booking?.booking_status === "checked_in"
                  ? "bg-brand text-white"
                  : booking?.booking_status === "cancelled"
                  ? "bg-red-500 text-white"
                  : booking?.booking_status === "rescheduled"
                  ? "bg-purple-500 text-white"
                  : "bg-weak text-white"
              }`}
            >
              {booking?.booking_status}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Tour Information */}
        <div className="bg-background rounded-lg border border-stroke-weak">
          <div className="px-6 py-4 border-b border-stroke-weak">
            <h2 className="text-h2 font-medium text-strong">Tour Details</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <p className="text-small font-medium text-weak mb-1">
                    Tour Package
                  </p>
                  <p className="text-body font-medium text-strong">
                    {booking?.tour_title}
                  </p>
                </div>
                <div>
                  <p className="text-small font-medium text-weak mb-1">
                    Number of Guests
                  </p>
                  <p className="text-body font-medium text-strong">
                    {booking?.slots}{" "}
                    {booking?.slots && booking.slots > 1 ? "People" : "Person"}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-small font-medium text-weak mb-1">
                    Booking Date
                  </p>
                  <p className="text-body font-medium text-strong">
                    {formatDate(booking?.booking_date)}
                  </p>
                </div>
                <div>
                  <p className="text-small font-medium text-weak mb-1">
                    Selected Time
                  </p>
                  <p className="text-body font-medium text-strong">
                    {formatTime(booking?.selected_time)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-background rounded-lg border border-stroke-weak">
          <div className="px-6 py-4 border-b border-stroke-weak">
            <h2 className="text-h2 font-medium text-strong">Payment Details</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <p className="text-small font-medium text-weak mb-1">
                    Payment Status
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-tiny font-bold uppercase ${
                        booking?.payment_status === "paid"
                          ? "bg-emerald-500 text-white"
                          : "bg-amber-500 text-white"
                      }`}
                    >
                      {booking?.payment_status || "paid"}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-small font-medium text-weak mb-1">
                    Payment Method
                  </p>
                  <p className="text-body font-medium text-strong">
                    {booking?.payment_method || "Credit Card"}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-small font-medium text-weak mb-1">
                    Payment Amount
                  </p>
                  <p className="text-h2 font-semibold text-strong">
                    {formatPrice(booking?.total_price)}
                  </p>
                </div>
                <div>
                  <p className="text-small font-medium text-weak mb-1">
                    Transaction ID
                  </p>
                  <p className="text-body font-medium text-strong">
                    {booking?.transaction_id || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Products */}
        <div className="bg-background rounded-lg border border-stroke-weak">
          <div className="px-6 py-4 border-b border-stroke-weak">
            <h2 className="text-h2 font-medium text-strong">
              Additional Products
            </h2>
          </div>
          <div className="p-6">
            {booking?.additional_products &&
            booking.additional_products.length > 0 ? (
              <div className="space-y-3">
                {booking.additional_products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between py-2.5 border-b border-stroke-weak last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-strong">{product.name}</p>
                      <p className="text-small text-weak">
                        {product.quantity} × {formatPrice(product.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-strong">
                        {formatPrice(product.total)}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-3 border-t border-stroke-weak">
                  <p className="font-medium text-strong">
                    Total Additional Products
                  </p>
                  <p className="font-semibold text-strong">
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
              <div className="text-center py-4">
                <p className="text-weak">No additional products purchased</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <h2 className="text-h2 font-medium text-strong">Actions</h2>
          <div className="space-y-3">
            {/* Primary Actions */}
            <div className="flex flex-wrap gap-3">
              <Button
                className="flex-1 min-w-[160px] h-11 bg-brand hover:bg-strong text-white"
                onClick={handleCheckIn}
                disabled={isLoading || booking?.booking_status === "Checked In"}
              >
                {isLoading ? "Checking In..." : "Check In"}
              </Button>
              <Button
                variant="outline"
                className="flex-1 min-w-[160px] h-11 border-stroke-weak hover:bg-fill"
                onClick={() => setIsRescheduleModalOpen(true)}
                disabled={isLoading || booking?.booking_status === "cancelled"}
              >
                Reschedule
              </Button>
              <Button
                variant="outline"
                className="flex-1 min-w-[160px] h-11 border-stroke-weak hover:bg-fill"
                disabled
              >
                Update Customer Info
              </Button>
            </div>

            {/* Secondary Actions */}
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="flex-1 min-w-[160px] h-11 text-red-500 border-red-200 hover:bg-red-50"
                disabled
              >
                Cancel booking
              </Button>
              <Button
                variant="outline"
                className="flex-1 min-w-[160px] h-11 border-stroke-weak hover:bg-fill"
                disabled
              >
                Refund
              </Button>
              <Button
                variant="outline"
                className="flex-1 min-w-[160px] h-11 border-stroke-weak hover:bg-fill"
                disabled
              >
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
