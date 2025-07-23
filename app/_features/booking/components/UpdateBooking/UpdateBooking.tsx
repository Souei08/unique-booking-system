import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  BookingTable,
  AdditionalProduct,
  CustomerInformation,
} from "../../types/booking-types";
import { getOneBooking } from "../../api/get-booking/getOneBooking";
import { rescheduleBooking } from "../../api/update-booking/RescheduleBooking";

import {
  getAdditionalBookings,
  AdditionalWithPayment,
} from "../../api/get-booking/getAdditionalBookings";

import {
  CustomSlotType,
  CustomSlotField,
} from "../CreateBookingv2/booking-steps/SlotDetails";
import SlotDetails from "../CreateBookingv2/booking-steps/SlotDetails";
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
  Edit2,
  Save,
  X,
  MapPin,
  List,
  Plus,
  Calendar,
} from "lucide-react";

import { formatTime } from "@/app/_lib/utils/formatTime";

import AdditionalProducts from "../CreateBookingv2/booking-steps/AdditionalProducts";
import { getAssignedToursByTourId } from "@/app/_features/products/api/getAssignedToursByTourId";
import { Product } from "@/app/_features/products/types/product-types";
import { cancelBooking } from "../../api/update-booking/cancelBooking";
import RefundAmountModal from "./RefundAmountModal";
import { StatusBadge } from "@/components/ui/status-badge";
import SlotDetailsModal from "./SlotDetailsModal";
import ProductsModal from "./ProductsModal";
import PersonalInfoModal from "./PersonalInfoModal";
import UpdateSlotsModal from "./UpdateSlotsModal";
import { handlePaymentLinkUpdate } from "../../utils/paymentLinkUtils";

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
  const [isSlotDetailsModalOpen, setIsSlotDetailsModalOpen] = useState(false);
  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);
  const [isPersonalInfoModalOpen, setIsPersonalInfoModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [isUpdateSlotsModalOpen, setIsUpdateSlotsModalOpen] = useState(false);
  const [slotDetails, setSlotDetails] = useState<any[]>([]);
  const [customSlotTypes, setCustomSlotTypes] = useState<
    CustomSlotType[] | null
  >(null);
  const [customSlotFields, setCustomSlotFields] = useState<CustomSlotField[]>(
    []
  );
  const [editedProducts, setEditedProducts] = useState<AdditionalProduct[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [customerInformation, setCustomerInformation] =
    useState<CustomerInformation>({
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
    });
  const [additionalBookings, setAdditionalBookings] = useState<
    AdditionalWithPayment[]
  >([]);
  const [isLoadingAdditional, setIsLoadingAdditional] = useState(false);

  // Wrapper function to maintain compatibility with modal components
  const handlePaymentLinkUpdateWrapper = async (
    isUpdate: boolean = false,
    currentSlots: any[] | null,
    currentProducts: AdditionalProduct[] | null,
    currentCustomerInfo: CustomerInformation | null
  ): Promise<boolean | undefined> => {
    if (!booking) return false;

    return handlePaymentLinkUpdate({
      booking,
      bookingId,
      paymentRefId: booking.payment_ref_id || null,
      isUpdate,
      currentSlots,
      currentProducts,
      currentCustomerInfo,
      customSlotTypes,
      customSlotFields,
      fetchBooking,
    });
  };

  const fetchBooking = async () => {
    if (isFetching) return; // Prevent multiple simultaneous fetches

    setIsFetching(true);
    try {
      const bookingDetails = await getOneBooking(bookingId, null);

      if (!bookingDetails) {
        throw new Error("No booking details found");
      }

      setBooking(bookingDetails);

      // Parse custom_slot_types if it's a string
      try {
        const parsedCustomSlotTypes =
          typeof bookingDetails?.custom_slot_types === "string"
            ? JSON.parse(bookingDetails.custom_slot_types)
            : bookingDetails?.custom_slot_types || [];

        // Validate the structure of custom_slot_types
        if (!Array.isArray(parsedCustomSlotTypes)) {
          throw new Error("Invalid custom_slot_types format");
        }

        setCustomSlotTypes(parsedCustomSlotTypes);
      } catch (error) {
        console.error("Error parsing custom_slot_types:", error);
        setCustomSlotTypes([]);
        toast.error("Failed to parse custom slot types");
      }

      // Parse custom_slot_fields if it's a string
      try {
        const parsedCustomSlotFields =
          typeof bookingDetails?.custom_slot_fields === "string"
            ? JSON.parse(bookingDetails.custom_slot_fields)
            : bookingDetails?.custom_slot_fields || [];

        // Validate the structure of custom_slot_fields
        if (!Array.isArray(parsedCustomSlotFields)) {
          throw new Error("Invalid custom_slot_fields format");
        }

        setCustomSlotFields(parsedCustomSlotFields);
      } catch (error) {
        console.error("Error parsing custom_slot_fields:", error);
        setCustomSlotFields([]);
        toast.error("Failed to parse custom slot fields");
      }

      // Set slot details with validation
      const slotDetails = bookingDetails?.slot_details || [];
      if (!Array.isArray(slotDetails)) {
        console.error("Invalid slot_details format");
        setSlotDetails([]);
      } else {
        setSlotDetails(slotDetails);
      }

      // Map booked_products with validation
      try {
        const bookedProducts = bookingDetails?.booked_products || [];
        if (!Array.isArray(bookedProducts)) {
          throw new Error("Invalid booked_products format");
        }

        if (bookedProducts.length === 0 || bookedProducts === null) {
          setEditedProducts([]);
          return;
        }

        const mappedProducts = bookedProducts.map((product) => {
          if (!product || typeof product !== "object") {
            throw new Error("Invalid product format");
          }

          return {
            booking_product_id: product.product_booking_id || "",
            id: product.product_id || "",
            name: product.name || "",
            description: "",
            quantity:
              typeof product.quantity === "number" ? product.quantity : 1,
            unit_price:
              typeof product.unit_price === "number" ? product.unit_price : 0,
            image_url: product.image_url || "",
          };
        });

        setEditedProducts(mappedProducts);
      } catch (error) {
        console.error("Error processing booked products:", error);
        setEditedProducts([]);
        toast.error("Failed to process booked products");
      }

      // Set initial customer information with validation
      try {
        const fullName = bookingDetails?.full_name || "";
        const [firstName, ...lastNameParts] = fullName.split(" ");

        setCustomerInformation({
          first_name: firstName || "",
          last_name: lastNameParts.join(" ") || "",
          email: bookingDetails?.email || "",
          phone_number: bookingDetails?.phone_number || "",
        });
      } catch (error) {
        console.error("Error processing customer information:", error);
        setCustomerInformation({
          first_name: "",
          last_name: "",
          email: "",
          phone_number: "",
        });
        toast.error("Failed to process customer information");
      }
    } catch (error) {
      console.error("Error fetching booking:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to fetch booking details"
      );

      // Reset all states to default values
      setBooking(null);
      setCustomSlotTypes([]);
      setCustomSlotFields([]);
      setSlotDetails([]);
      setEditedProducts([]);
      setCustomerInformation({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
      });
    } finally {
      setIsFetching(false);
    }

    // Fetch additional bookings after main booking is loaded
    if (bookingId) {
      fetchAdditionalBookings();
    }
  };

  const fetchAvailableProducts = async () => {
    if (!booking?.tour_id) return;

    try {
      setIsLoadingProducts(true);
      const products = await getAssignedToursByTourId(booking.tour_id);

      const typedProducts: Product[] = (products as any[]).map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description || null,
        price: product.price,
        image_url: product.image_url || null,
        created_at: new Date().toISOString(),
      }));

      setAvailableProducts(typedProducts);
    } catch (error) {
      console.error("Error fetching available products:", error);
      toast.error("Failed to fetch available products");
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const fetchAdditionalBookings = async () => {
    if (!bookingId) return;

    try {
      setIsLoadingAdditional(true);
      const additionalData = await getAdditionalBookings(bookingId);

      // Filter out duplicates based on additional_id
      const uniqueAdditionalBookings = additionalData.filter(
        (booking, index, self) =>
          index ===
          self.findIndex((b) => b.additional_id === booking.additional_id)
      );

      setAdditionalBookings(uniqueAdditionalBookings);
    } catch (error) {
      console.error("Error fetching additional bookings:", error);
      toast.error("Failed to fetch additional bookings");
    } finally {
      setIsLoadingAdditional(false);
    }
  };

  const handleAddAdditionalBooking = () => {
    if (manageToken) {
      window.location.href = `/manage-additional-booking?manage_token=${manageToken}`;
    }
  };

  const handleRefreshAdditionalBookings = async () => {
    await fetchAdditionalBookings();
    toast.success("Additional bookings refreshed");
  };

  const handleReschedule = async (newDate: string, newTime: string) => {
    if (!booking) return;

    setIsLoading(true);
    try {
      // Reschedule the booking
      const result = await rescheduleBooking({
        booking_id: bookingId,
        new_booking_date: newDate,
        new_selected_time: newTime,
      });

      if (!result.success) {
        throw new Error("Failed to reschedule booking");
      }

      toast.success("Booking rescheduled successfully");
      setIsRescheduleModalOpen(false);
      await fetchBooking();
      await fetchAdditionalBookings();
      onSuccess?.();
    } catch (error) {
      console.error("Reschedule error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to reschedule booking"
      );
      // Only fetch booking data if the operation failed
      await fetchBooking();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;

    if (booking.payment_status === "paid" && booking.stripe_payment_id) {
      setIsRefundModalOpen(true);
    } else {
      await processCancellation();
    }
  };

  const processCancellation = async (refundAmount?: number) => {
    if (!booking) return;

    setIsLoading(true);
    try {
      const result = await cancelBooking(
        bookingId,
        booking.stripe_payment_id,
        refundAmount
      );

      if (result.success) {
        toast.success(result.message);
        await fetchBooking();
        await fetchAdditionalBookings();
        onSuccess?.();
      } else {
        throw new Error("Failed to cancel booking");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to cancel booking"
      );
      // Only fetch booking data if the operation failed
      await fetchBooking();
    } finally {
      setIsLoading(false);
      setIsRefundModalOpen(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, []);

  useEffect(() => {
    fetchAvailableProducts();
  }, [isProductsModalOpen, booking?.tour_id]);

  useEffect(() => {
    if (bookingId) {
      fetchAdditionalBookings();
    }
  }, [bookingId]);

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
      <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h1 className="text-lg sm:text-xl font-bold text-strong">
                {booking?.full_name}
              </h1>

              <StatusBadge
                status={
                  (booking?.booking_status?.toLowerCase() as any) || "pending"
                }
                type="booking"
              />
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
              {booking?.promo_code && (
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-green-600" />
                  <span className="text-green-600 font-medium">
                    Promo: {booking.promo_code}
                  </span>
                </div>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0 hover:bg-gray-100"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Tour Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Slot Details Card */}
          {((customSlotTypes && customSlotTypes.length > 0) ||
            (customSlotFields && customSlotFields.length > 0)) && (
            <div className="rounded-xl border bg-white shadow-sm p-4 sm:p-6">
              <h2 className="text-lg font-bold text-strong mb-4">
                Slot Details
              </h2>
              <SlotDetails
                numberOfPeople={booking?.slots || 0}
                customSlotTypes={customSlotTypes}
                customSlotFields={customSlotFields}
                tourRate={booking?.tour_rate || 0}
                setSlotDetails={setSlotDetails}
                slotDetails={slotDetails}
                readOnly={true}
                showCard={false}
                showHeader={false}
              />
            </div>
          )}

          {/* Additional Products Card */}
          <div className="rounded-xl border bg-white shadow-sm p-4 sm:p-6">
            <h2 className="text-lg font-bold text-strong mb-4">
              Ordered Products
            </h2>
            <AdditionalProducts
              isLoadingProducts={isLoadingProducts}
              availableProducts={availableProducts}
              selectedProducts={editedProducts.map((product) => product.id)}
              setSelectedProducts={() => {}}
              productQuantities={editedProducts.reduce(
                (acc, product) => ({
                  ...acc,
                  [product.id]: product.quantity,
                }),
                {}
              )}
              setProductQuantities={() => {}}
              isReadOnly={true}
              showHeader={false}
              showCard={false}
            />
          </div>

          {/* Additional Bookings Card */}
          <div className="rounded-xl border bg-white shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-strong">
                Additional Bookings
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshAdditionalBookings}
                disabled={isLoadingAdditional}
                className="h-7 px-2"
              >
                <RefreshCw
                  className={`w-3 h-3 ${isLoadingAdditional ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
            {isLoadingAdditional ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading...</p>
                </div>
              </div>
            ) : additionalBookings.length > 0 ? (
              <div className="space-y-4">
                {additionalBookings.map((additional, index) => (
                  <div
                    key={additional.additional_id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Plus className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Additional #{index + 1}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {new Date(
                              additional.additional_created_at
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">
                          ${additional.amount_paid?.toFixed(2) || "0.00"}
                        </p>
                        <StatusBadge
                          status={
                            (additional.status?.toLowerCase() as any) ||
                            "pending"
                          }
                          type="payment"
                        />
                      </div>
                    </div>

                    {/* Quick Info */}
                    <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{additional.added_slots} slots</span>
                      </div>
                      {additional.added_products &&
                        additional.added_products.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            <span>
                              {additional.added_products.length} products
                            </span>
                          </div>
                        )}
                    </div>

                    {/* Products with Images */}
                    {additional.added_products &&
                      additional.added_products.length > 0 && (
                        <div className="space-y-2">
                          {additional.added_products.map(
                            (product: any, productIndex: number) => {
                              const productName =
                                product.name ||
                                product.product_name ||
                                product.title ||
                                "Unknown Product";
                              const quantity =
                                product.quantity || product.qty || 1;
                              const unitPrice =
                                product.unit_price ||
                                product.price ||
                                product.unitPrice ||
                                0;
                              const imageUrl =
                                product.image_url || product.image || null;

                              return (
                                <div
                                  key={`product-${productIndex}`}
                                  className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                                >
                                  {/* Product Image */}
                                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                                    {imageUrl ? (
                                      <img
                                        src={imageUrl}
                                        alt={productName}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          const target =
                                            e.target as HTMLImageElement;
                                          target.style.display = "none";
                                          target.nextElementSibling?.classList.remove(
                                            "hidden"
                                          );
                                        }}
                                      />
                                    ) : null}
                                    <div
                                      className={`w-full h-full flex items-center justify-center ${imageUrl ? "hidden" : ""}`}
                                    >
                                      <Package className="w-4 h-4 text-gray-400" />
                                    </div>
                                  </div>

                                  {/* Product Details */}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {productName}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      ${unitPrice.toFixed(2)} × {quantity}
                                    </p>
                                  </div>

                                  {/* Total Price */}
                                  <div className="text-right">
                                    <p className="text-sm font-bold text-gray-900">
                                      ${(unitPrice * quantity).toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      )}

                    {/* Note (if exists) */}
                    {additional.note && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-600 italic">
                          "{additional.note}"
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Plus className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  No Additional Bookings
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Add more people or products to this booking
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddAdditionalBooking}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50 h-8 px-3 text-sm"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Booking
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          {/* Order Summary Card */}
          <div className="rounded-xl border bg-white shadow-sm p-4 sm:p-6">
            <h2 className="text-lg font-bold text-strong mb-4">
              Order Summary
            </h2>
            <div className="space-y-4">
              {/* Selected Tour Summary */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                    <img
                      src={booking?.tour_featured_image}
                      alt={booking?.tour_title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-[#1a1a1a] truncate">
                      {booking?.tour_title}
                    </h3>
                    <p className="text-xs text-[#666666]">
                      {booking?.tour_description ? "Tour" : "N/A"}
                    </p>
                  </div>
                </div>

                {/* Date and Time Section */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="h-4 w-4 text-[#0066cc]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <div>
                      <p className="text-xs font-medium text-[#666666]">
                        Selected Date
                      </p>
                      <p className="text-sm font-semibold text-[#1a1a1a]">
                        {formatDate(booking?.booking_date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg
                      className="h-4 w-4 text-[#0066cc]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-xs font-medium text-[#666666]">
                        Selected Time
                      </p>
                      <p className="text-sm font-semibold text-[#1a1a1a]">
                        {formatTime(booking?.selected_time || "")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Breakdown */}
              <div className="border-t border-gray-200 pt-6">
                {/* Tour Price Section */}
                <div className="bg-gray-50 rounded-lg mb-4">
                  <h4 className="text-sm font-semibold text-[#666666]">
                    Tour Booking
                  </h4>

                  {customSlotTypes && customSlotTypes.length > 0 ? (
                    <div className="space-y-2">
                      {(() => {
                        const groupedSlots = slotDetails.reduce(
                          (acc, slot) => {
                            const slotType = customSlotTypes.find(
                              (type) => type.name === slot.type
                            );
                            const typeName = slotType?.name || "Default";
                            const price = slotType?.price || 0;

                            if (!acc[typeName]) {
                              acc[typeName] = {
                                count: 0,
                                price: price,
                              };
                            }
                            acc[typeName].count++;
                            return acc;
                          },
                          {} as Record<string, { count: number; price: number }>
                        );

                        return Object.entries(groupedSlots).map(
                          ([typeName, slotData], index) => {
                            const { count, price } = slotData as {
                              count: number;
                              price: number;
                            };
                            return (
                              <div
                                key={index}
                                className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-[#0066cc]"></div>
                                  <div>
                                    <span className="text-sm font-medium text-[#1a1a1a] capitalize">
                                      {typeName}
                                    </span>
                                    <p className="text-xs text-[#666666]">
                                      ${price} × {count}
                                    </p>
                                  </div>
                                </div>
                                <span className="text-sm font-semibold text-[#1a1a1a]">
                                  ${(price * count).toFixed(2)}
                                </span>
                              </div>
                            );
                          }
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-[#0066cc]"></div>
                        <div>
                          <span className="text-sm font-medium text-[#1a1a1a]">
                            Regular Price
                          </span>
                          <p className="text-xs text-[#666666]">
                            ${booking?.tour_rate} × {booking?.slots}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-[#1a1a1a]">
                        $
                        {(
                          (booking?.tour_rate || 0) * (booking?.slots || 0)
                        ).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Additional Products */}
                {editedProducts.length > 0 && (
                  <div className="bg-gray-50 rounded-lg mb-4">
                    <h4 className="text-sm font-semibold text-[#666666]">
                      Additional Services
                    </h4>
                    <div className="space-y-2">
                      {editedProducts.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <div>
                              <span className="text-sm font-medium text-[#1a1a1a]">
                                {product.name}
                              </span>
                              <p className="text-xs text-[#666666]">
                                ${product.unit_price} × {product.quantity}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-[#1a1a1a]">
                            $
                            {(product.unit_price * product.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Summary */}
                <div className="space-y-3">
                  {/* Subtotal */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-[#666666]">Subtotal</span>
                    <span className="text-sm font-semibold text-[#1a1a1a]">
                      $
                      {(() => {
                        let tourPrice = 0;
                        if (customSlotTypes && customSlotTypes.length > 0) {
                          tourPrice = slotDetails.reduce((sum, slot) => {
                            const slotType = customSlotTypes.find(
                              (type) => type.name === slot.type
                            );
                            return sum + (slotType?.price || 0);
                          }, 0);
                        } else {
                          tourPrice =
                            (booking?.tour_rate || 0) * (booking?.slots || 0);
                        }
                        const productPrice = editedProducts.reduce(
                          (sum, product) =>
                            sum + product.unit_price * product.quantity,
                          0
                        );
                        return (tourPrice + productPrice).toFixed(2);
                      })()}
                    </span>
                  </div>

                  {/* Promo Code Discount */}
                  {booking?.promo_code &&
                    booking?.discount_amount &&
                    booking.discount_amount > 0 && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[#666666]">
                            Discount
                          </span>
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
                            {booking.promo_code}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-emerald-600">
                          -${booking.discount_amount.toFixed(2)}
                        </span>
                      </div>
                    )}

                  {/* Total Amount */}
                  <div className="flex justify-between items-center pt-3">
                    <div>
                      <span className="text-base font-bold text-[#1a1a1a]">
                        Total Amount
                      </span>
                      <p className="text-xs text-[#666666] mt-1">
                        Including all taxes and fees
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-[#0066cc]">
                        ${booking?.amount_paid.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Card */}
          <div className="rounded-xl border bg-white shadow-sm p-4 sm:p-6">
            <h2 className="text-lg font-bold text-strong mb-4">Actions</h2>
            <div className="space-y-4">
              {/* Booking Management Actions */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full h-10 border-gray-200 hover:border-blue-200 hover:bg-blue-50/50 text-gray-700 transition-all duration-200 flex items-center justify-start gap-2 px-3 text-sm"
                  onClick={() => setIsPersonalInfoModalOpen(true)}
                  disabled={isLoading}
                >
                  <UserCog className="w-4 h-4 text-blue-600" />
                  <span>Edit Customer Information</span>
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-10 border-gray-200 hover:border-purple-200 hover:bg-purple-50/50 text-gray-700 transition-all duration-200 flex items-center justify-start gap-2 px-3 text-sm"
                  onClick={() => setIsRescheduleModalOpen(true)}
                  disabled={
                    isLoading ||
                    booking?.payment_status === "refunding" ||
                    booking?.payment_status === "refunded" ||
                    booking?.payment_status === "partially_refunded"
                  }
                >
                  <RefreshCw className="w-4 h-4 text-purple-600" />
                  <span>Reschedule Booking</span>
                </Button>

                {(customSlotTypes && customSlotTypes.length > 0) ||
                (customSlotFields && customSlotFields.length > 0) ? (
                  <Button
                    variant="outline"
                    className="w-full h-10 border-gray-200 hover:border-green-200 hover:bg-green-50/50 text-gray-700 transition-all duration-200 flex items-center justify-start gap-2 px-3 text-sm"
                    onClick={() => {
                      setIsSlotDetailsModalOpen(true);
                    }}
                    disabled={
                      isLoading || booking?.payment_status !== "pending"
                    }
                  >
                    <Edit2 className="w-4 h-4 text-green-600" />
                    <span>Edit Slot Details</span>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full h-10 border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/50 text-gray-700 transition-all duration-200 flex items-center justify-start gap-2 px-3 text-sm"
                    onClick={() => setIsUpdateSlotsModalOpen(true)}
                    disabled={
                      isLoading || booking?.payment_status !== "pending"
                    }
                  >
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span>Update Number of Slots</span>
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="w-full h-10 border-gray-200 hover:border-amber-200 hover:bg-amber-50/50 text-gray-700 transition-all duration-200 flex items-center justify-start gap-2 px-3 text-sm"
                  onClick={() => {
                    setEditedProducts(editedProducts);
                    setIsProductsModalOpen(true);
                  }}
                  disabled={isLoading || booking?.payment_status !== "pending"}
                >
                  <Package className="w-4 h-4 text-amber-600" />
                  <span>Edit Booked Products</span>
                </Button>
              </div>

              {/* Cancellation Action */}
              {booking?.payment_status === "paid" && (
                <div className="pt-3 border-t border-gray-200">
                  <Button
                    variant="outline"
                    className="w-full h-10 text-red-600 border-red-200 hover:border-red-300 hover:bg-red-50/50 transition-all duration-200 flex items-center justify-start gap-2 px-3 text-sm"
                    onClick={handleCancelBooking}
                    disabled={
                      isLoading || booking?.booking_status === "cancelled"
                    }
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    <span>
                      {isLoading ? "Cancelling..." : "Cancel / Refund Booking"}
                    </span>
                  </Button>
                </div>
              )}
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

      {/* Slot Details Modal */}
      <SlotDetailsModal
        isOpen={isSlotDetailsModalOpen}
        onClose={() => setIsSlotDetailsModalOpen(false)}
        onSuccess={() => {
          fetchBooking();
          fetchAdditionalBookings();
          onSuccess?.();
        }}
        bookingId={bookingId}
        initialSlotDetails={slotDetails}
        customSlotTypes={customSlotTypes}
        customSlotFields={customSlotFields}
        tourRate={booking?.tour_rate || 0}
        paymentStatus={booking?.payment_status || ""}
        paymentLink={booking?.payment_link}
        stripePaymentId={booking?.stripe_payment_id}
        handlePaymentLinkUpdate={handlePaymentLinkUpdateWrapper}
      />

      {/* Products Modal */}
      <ProductsModal
        isOpen={isProductsModalOpen}
        onClose={() => setIsProductsModalOpen(false)}
        onSuccess={() => {
          fetchBooking();
          fetchAdditionalBookings();
          onSuccess?.();
        }}
        bookingId={bookingId}
        initialProducts={editedProducts}
        availableProducts={availableProducts}
        isLoadingProducts={isLoadingProducts}
        paymentStatus={booking?.payment_status || ""}
        paymentLink={booking?.payment_link}
        stripePaymentId={booking?.stripe_payment_id}
        handlePaymentLinkUpdate={handlePaymentLinkUpdateWrapper}
      />

      {/* Personal Information Modal */}
      <PersonalInfoModal
        isOpen={isPersonalInfoModalOpen}
        onClose={() => setIsPersonalInfoModalOpen(false)}
        onSuccess={() => {
          fetchBooking();
          fetchAdditionalBookings();
          onSuccess?.();
        }}
        bookingId={bookingId}
        initialCustomerInfo={customerInformation}
        paymentLink={booking?.payment_link}
        handlePaymentLinkUpdate={handlePaymentLinkUpdateWrapper}
      />

      {/* Refund Amount Modal */}
      <RefundAmountModal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        onConfirm={async (refundAmount) => {
          await processCancellation(refundAmount);
          fetchBooking();
          fetchAdditionalBookings();
        }}
        totalAmount={booking?.amount_paid || 0}
        isLoading={isLoading}
      />

      {/* Update Slots Modal */}
      <UpdateSlotsModal
        isOpen={isUpdateSlotsModalOpen}
        onClose={() => setIsUpdateSlotsModalOpen(false)}
        onSuccess={() => {
          fetchBooking();
          fetchAdditionalBookings();
          onSuccess?.();
        }}
        bookingId={bookingId}
        currentSlots={booking?.slots || 0}
        slotDetails={slotDetails}
        paymentStatus={booking?.payment_status || ""}
        paymentLink={booking?.payment_link}
        handlePaymentLinkUpdate={handlePaymentLinkUpdateWrapper}
        booking={booking}
        editedProducts={editedProducts}
      />
    </div>
  );
};

export default UpdateBooking;
