import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BookingTable } from "../types/booking-types";
import { getOneBooking } from "../api/getOneBooking";
import { updateBookingStatus } from "../api/UpdateBookingStatus";
import { rescheduleBooking } from "../api/RescheduleBooking";
import { updateCustomerInfo } from "../api/updateCustomerInfo";
import { updateBookingPayment } from "../api/updateBookingPayment";
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
  ChevronRight,
  Mail,
  Phone,
  Tag,
  Link,
  Copy,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatTime } from "@/app/_utils/formatTime";

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

// Format price with commas
const formatPrice = (price: number | undefined) => {
  if (!price) return "$0.00";
  return `$${price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
};

interface UpdateBookingProps {
  bookingId: string;
  manageToken: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const UpdateBooking: React.FC<UpdateBookingProps> = ({
  bookingId,
  manageToken,
  onClose,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [booking, setBooking] = useState<BookingTable | null>(null);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isUpdateCustomerModalOpen, setIsUpdateCustomerModalOpen] =
    useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
  });

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
        setBooking((prev) =>
          prev
            ? {
                ...prev,
                booking_date: newDate,
                selected_time: newTime,
                status: "rescheduled",
              }
            : null
        );
        toast.success("Booking rescheduled successfully");
        fetchBooking();
        onSuccess?.();
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

  const handleUpdateCustomerInfo = async () => {
    if (!booking) return;

    setIsLoading(true);
    try {
      const result = await updateCustomerInfo({
        booking_id: bookingId,
        ...customerInfo,
      });

      if (result.success) {
        // Update local state
        setBooking((prev) =>
          prev
            ? {
                ...prev,
                first_name: customerInfo.first_name,
                last_name: customerInfo.last_name,
                email: customerInfo.email,
                phone_number: customerInfo.phone_number,
              }
            : null
        );
        toast.success("Customer information updated successfully");
        setIsUpdateCustomerModalOpen(false);
        fetchBooking();
        onSuccess?.();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update customer information");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePaymentLink = async () => {
    if (!booking) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/create-payment-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          booking_id: bookingId,
          email: booking.email,
          name: booking.full_name,
          phone: booking.phone_number,
          slots: booking.slots,
          booking_price: booking.tour_rate * booking.slots,
          tourProducts:
            booking.additional_products?.map((product) => ({
              name: product.name,
              quantity: product.quantity,
              unit_price: product.price * 100, // Convert to cents
            })) || [],
          bookingTitle: booking.tour_title,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create payment link");
      }

      // Update the booking with the payment link using the API
      const updateResult = await updateBookingPayment({
        booking_id: bookingId,
        payment_link: data.checkoutUrl,
        status: "pending",
      });

      if (!updateResult.success) {
        throw new Error("Failed to update booking with payment link");
      }

      // Update local state
      setBooking((prev) =>
        prev
          ? {
              ...prev,
              payment_link: data.checkoutUrl,
              payment_status: "pending",
            }
          : null
      );
      toast.success("Payment link created successfully");
      fetchBooking();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create payment link");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, []);

  useEffect(() => {
    if (booking) {
      const nameParts = booking.full_name.split(" ");
      setCustomerInfo({
        first_name: nameParts[0] || "",
        last_name: nameParts.slice(1).join(" ") || "",
        email: booking.email || "",
        phone_number: booking.phone_number || "",
      });
    }
  }, [booking]);

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
    <div className="w-full mx-auto">
      {/* Header Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {booking?.full_name}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
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
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{booking?.phone_number || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{booking?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <span>ID: {booking?.reference_number}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="h-10 px-4 border-gray-300 hover:bg-gray-50"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Tour Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tour Information Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Tour Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Tour Package
                    </p>
                    <p className="text-base font-medium text-gray-900">
                      {booking?.tour_title}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Number of Guests
                    </p>
                    <div className="flex items-center gap-2 text-base font-medium text-gray-900">
                      <Users className="w-5 h-5 text-gray-400" />
                      {booking?.slots}{" "}
                      {booking?.slots && booking.slots > 1
                        ? "People"
                        : "Person"}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Booking Date
                    </p>
                    <div className="flex items-center gap-2 text-base font-medium text-gray-900">
                      <CalendarDays className="w-5 h-5 text-gray-400" />
                      {formatDate(booking?.booking_date)}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Selected Time
                    </p>
                    <div className="flex items-center gap-2 text-base font-medium text-gray-900">
                      <Clock className="w-5 h-5 text-gray-400" />
                      {formatTime(booking?.selected_time || "")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Products Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Additional Products
              </h2>
              {booking?.additional_products &&
              booking.additional_products.length > 0 ? (
                <div className="space-y-4">
                  {booking.additional_products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {product.quantity} × {formatPrice(product.price)}
                        </p>
                      </div>
                      <p className="font-medium text-gray-900">
                        {formatPrice(product.total)}
                      </p>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
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
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">
                    No additional products purchased
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Payment & Actions */}
        <div className="space-y-6">
          {/* Payment Information Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Details
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Payment Status
                  </p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                      booking?.payment_status === "paid"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {booking?.payment_status || "paid"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Payment Method
                  </p>
                  <div className="flex items-center gap-2 text-base font-medium text-gray-900 capitalize">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    {booking?.payment_method || "Credit Card"}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Payment Amount
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {booking?.total_price}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Transaction ID
                  </p>
                  <p className="text-base font-medium text-gray-900 break-all">
                    {booking?.stripe_payment_id === null
                      ? "N/A"
                      : booking?.stripe_payment_id}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Payment Link
                  </p>
                  {booking?.payment_link ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 truncate">
                            {booking.payment_link}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-gray-100"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                booking.payment_link
                              );
                              toast.success("Payment link copied to clipboard");
                            }}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-gray-100"
                            onClick={() =>
                              window.open(booking.payment_link, "_blank")
                            }
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Share this link with the customer to complete their
                        payment
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="flex-1">
                          <p className="text-sm text-amber-800">
                            No payment link available
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 border-amber-200 hover:bg-amber-100 hover:text-amber-900"
                          onClick={handleCreatePaymentLink}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Link className="w-4 h-4 mr-2" />
                          )}
                          Create Payment Link
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Generate a payment link to share with the customer
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Actions
              </h2>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full h-11 border-gray-300 hover:bg-gray-50"
                  onClick={() => setIsRescheduleModalOpen(true)}
                  disabled={
                    isLoading || booking?.booking_status === "cancelled"
                  }
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reschedule
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-11 border-gray-300 hover:bg-gray-50"
                  onClick={() => setIsUpdateCustomerModalOpen(true)}
                  disabled={isLoading}
                >
                  <UserCog className="w-4 h-4 mr-2" />
                  Update Customer Info
                </Button>
                <div className="pt-3 border-t border-gray-200">
                  <Button
                    variant="outline"
                    className="w-full h-11 text-red-600 border-red-200 hover:bg-red-50"
                    disabled
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel booking
                  </Button>
                </div>
                <Button
                  variant="outline"
                  className="w-full h-11 border-gray-300 hover:bg-gray-50"
                  disabled
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
              </div>
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

      {/* Update Customer Info Modal */}
      <Dialog
        open={isUpdateCustomerModalOpen}
        onOpenChange={setIsUpdateCustomerModalOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Customer Information</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={customerInfo.first_name}
                  onChange={(e) =>
                    setCustomerInfo((prev) => ({
                      ...prev,
                      first_name: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={customerInfo.last_name}
                  onChange={(e) =>
                    setCustomerInfo((prev) => ({
                      ...prev,
                      last_name: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={customerInfo.email}
                onChange={(e) =>
                  setCustomerInfo((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                value={customerInfo.phone_number}
                onChange={(e) =>
                  setCustomerInfo((prev) => ({
                    ...prev,
                    phone_number: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUpdateCustomerModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateCustomerInfo} disabled={isLoading}>
              {isLoading ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UpdateBooking;
