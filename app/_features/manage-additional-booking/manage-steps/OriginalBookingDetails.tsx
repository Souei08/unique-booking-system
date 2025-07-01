import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";

// Icons
import {
  CalendarDays,
  Clock,
  Users,
  CreditCard,
  User,
  Mail,
  Phone,
  Package,
  MapPin,
  Plus,
  ArrowRight,
} from "lucide-react";

// Types
import { Tour } from "@/app/_features/tours/tour-types";
import { BookingTable } from "@/app/_features/booking/types/booking-types";

// Utils
import { formatTime } from "@/app/_lib/utils/formatTime";

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

interface OriginalBookingDetailsProps {
  booking: BookingTable | null;
  tour: Tour | null;
  onNext: () => void;
}

const OriginalBookingDetails: React.FC<OriginalBookingDetailsProps> = ({
  booking,
  tour,
  onNext,
}) => {
  if (!booking || !tour) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No booking details available</p>
      </div>
    );
  }

  // Calculate payment breakdown
  const tourCost = (booking.tour_rate || 0) * (booking.slots || 0);
  const productsCost =
    booking.booked_products?.reduce((total, product) => {
      return total + (product.unit_price || 0) * (product.quantity || 0);
    }, 0) || 0;
  const subtotal = tourCost + productsCost;
  const discountAmount = booking.discount_amount || 0;
  const total = subtotal - discountAmount;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Your Current Booking</h1>
        <p className="text-gray-600">
          Review your existing booking before adding additional services
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Booking Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tour Information */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Tour Information
            </h2>

            {/* Tour Image */}
            {tour.images &&
              (() => {
                try {
                  const tourImages = JSON.parse(tour.images);
                  const featuredImage = tourImages.find(
                    (img: any) => img.isFeature || img.isFeatured
                  );
                  return featuredImage ? (
                    <div className="w-full h-48 rounded-lg overflow-hidden border mb-4">
                      <img
                        src={featuredImage.url}
                        alt={tour.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : null;
                } catch (error) {
                  console.error("Error parsing tour images:", error);
                  return null;
                }
              })()}

            <h3 className="text-xl font-bold mb-2">{tour.title}</h3>
            <p className="text-gray-600 mb-4">{tour.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <CalendarDays className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Date</span>
                </div>
                <p className="font-semibold">
                  {formatDate(booking.booking_date)}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Time</span>
                </div>
                <p className="font-semibold">
                  {formatTime(booking.selected_time)}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">People</span>
                </div>
                <p className="font-semibold">
                  {booking.slots} {booking.slots === 1 ? "person" : "people"}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Rate</span>
                </div>
                <p className="font-semibold">${booking.tour_rate} per person</p>
              </div>
            </div>
          </div>

          {/* Booked Products */}
          {booking.booked_products && booking.booked_products.length > 0 && (
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Booked Products
              </h2>
              <div className="space-y-3">
                {booking.booked_products.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">
                          Quantity: {product.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        $
                        {(
                          (product.unit_price || 0) * (product.quantity || 0)
                        ).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        ${(product.unit_price || 0).toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Information */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Customer Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Name</p>
                  <p className="font-medium">{booking.full_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="font-medium">{booking.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="font-medium">{booking.phone_number}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Package className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Booking ID</p>
                  <p className="font-medium">{booking.reference_number}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Payment Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-lg p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Payment Summary
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>
                  Tour Cost ({booking.slots} × ${booking.tour_rate})
                </span>
                <span className="font-semibold">${tourCost.toFixed(2)}</span>
              </div>

              {productsCost > 0 && (
                <div className="flex justify-between">
                  <span>Additional Products</span>
                  <span className="font-semibold">
                    ${productsCost.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="border-t pt-3 flex justify-between font-semibold">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>
                    Discount {booking.promo_code && `(${booking.promo_code})`}
                  </span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="border-t pt-3 flex justify-between text-lg font-bold">
                <span>Total Paid</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Booking Status</span>
                <StatusBadge
                  status={
                    (booking.booking_status?.toLowerCase() as any) || "pending"
                  }
                  type="booking"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Payment Status</span>
                <StatusBadge
                  status={
                    (booking.payment_status?.toLowerCase() as any) || "pending"
                  }
                  type="payment"
                />
              </div>
            </div>

            {/* Action Button */}
            <Button
              onClick={onNext}
              className="w-full py-3 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Additional Services
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OriginalBookingDetails;
