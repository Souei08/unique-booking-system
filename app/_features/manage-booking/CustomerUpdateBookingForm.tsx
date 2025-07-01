import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  BookingTable,
  AdditionalProduct,
  CustomerInformation,
} from "../booking/types/booking-types";
import { getOneBooking } from "../booking/api/get-booking/getOneBooking";
import {
  getAdditionalBookings,
  AdditionalWithPayment,
} from "../booking/api/get-booking/getAdditionalBookings";
import { rescheduleBooking } from "../booking/api/update-booking/RescheduleBooking";
import { updateBookingPayment } from "../booking/api/updateBookingPayment";
import {
  CustomSlotType,
  CustomSlotField,
} from "../booking/components/CreateBookingv2/booking-steps/SlotDetails";
import RescheduleBookingModal from "../booking/components/UpdateBooking/RescheduleBookingModal";
import {
  CalendarDays,
  Clock,
  Users,
  CreditCard,
  Package,
  RefreshCw,
  UserCog,
  XCircle,
  Mail,
  Phone,
  Tag,
  Link,
  Copy,
  ExternalLink,
  Edit2,
  X,
  MapPin,
  List,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Info,
  UserRound,
  Plus,
} from "lucide-react";

import { formatTime } from "@/app/_lib/utils/formatTime";

import { getAssignedToursByTourId } from "@/app/_features/products/api/getAssignedToursByTourId";
import { Product } from "@/app/_features/products/types/product-types";
import { cancelBooking } from "../booking/api/update-booking/cancelBooking";
import RefundAmountModal from "../booking/components/UpdateBooking/RefundAmountModal";
import { StatusBadge } from "@/components/ui/status-badge";
import SlotDetailsModal from "../booking/components/UpdateBooking/SlotDetailsModal";
import ProductsModal from "../booking/components/UpdateBooking/ProductsModal";
import PersonalInfoModal from "../booking/components/UpdateBooking/PersonalInfoModal";
import UpdateSlotsModal from "../booking/components/UpdateBooking/UpdateSlotsModal";
import Image from "next/image";
import { handlePaymentLinkUpdate } from "../booking/utils/paymentLinkUtils";

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

interface CustomerUpdateBookingFormProps {
  bookingId: string;
  manageToken: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const CustomerUpdateBookingForm: React.FC<CustomerUpdateBookingFormProps> = ({
  bookingId,
  manageToken,
  onClose,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [booking, setBooking] = useState<BookingTable | null>(null);
  const [additionalBookings, setAdditionalBookings] = useState<
    AdditionalWithPayment[]
  >([]);
  const [isLoadingAdditional, setIsLoadingAdditional] = useState(false);
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
    if (isFetching) return;

    setIsFetching(true);
    try {
      const bookingDetails = await getOneBooking(bookingId, manageToken);

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
      setAdditionalBookings(additionalData);
    } catch (error) {
      console.error("Error fetching additional bookings:", error);
      toast.error("Failed to load additional bookings");
    } finally {
      setIsLoadingAdditional(false);
    }
  };

  const handleReschedule = async (newDate: string, newTime: string) => {
    if (!booking) return;

    setIsLoading(true);
    try {
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
      onSuccess?.();
    } catch (error) {
      console.error("Reschedule error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to reschedule booking"
      );
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
        onSuccess?.();
      } else {
        throw new Error("Failed to cancel booking");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to cancel booking"
      );
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
    if (booking) {
      fetchAdditionalBookings();
    }
  }, [booking]);

  useEffect(() => {
    fetchAvailableProducts();
  }, [isProductsModalOpen, booking?.tour_id]);

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px] px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
          <p className="mt-4 text-weak text-body">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center min-h-[400px] px-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-weak text-body">No booking found</p>
        </div>
      </div>
    );
  }

  const handleAddAdditionalBooking = () => {
    if (manageToken) {
      window.location.href = `/manage-additional-booking?manage_token=${manageToken}`;
    }
  };

  // Helper function to map additional booking status to payment status
  const mapAdditionalStatusToPaymentStatus = (
    status: string | null
  ):
    | "pending"
    | "paid"
    | "failed"
    | "refunding"
    | "refunded"
    | "partial_refund"
    | "cancelled" => {
    if (!status) return "pending";

    const lowerStatus = status.toLowerCase();

    switch (lowerStatus) {
      case "paid":
      case "completed":
        return "paid";
      case "failed":
      case "error":
        return "failed";
      case "refunding":
        return "refunding";
      case "refunded":
        return "refunded";
      case "partial_refund":
      case "partially_refunded":
        return "partial_refund";
      case "cancelled":
      case "canceled":
        return "cancelled";
      default:
        return "pending";
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
      {/* Header */}
      <div className="bg-gradient bg-brand rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-white/20 p-2 sm:p-3 rounded-xl">
              <UserRound className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-h2 font-bold truncate">
                {booking.tour_title}
              </h1>
              <p className="text-stroke-weak flex items-center gap-2 mt-1 text-small">
                <Tag className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">ID: {booking.reference_number}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
        {/* Left Column - Customer Info & Actions */}
        <div className="space-y-4 sm:space-y-6">
          {/* Quick Info Cards */}
          {!(
            booking.payment_status === "paid" &&
            booking.booking_status === "confirmed"
          ) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-background rounded-xl p-3 sm:p-4 shadow-lg border border-gray-200">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-brand" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-tiny sm:text-small text-weak">
                      Booked Date
                    </p>
                    <p className="font-semibold text-strong text-small sm:text-body truncate">
                      {formatDate(booking.booking_date)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-background rounded-xl p-3 sm:p-4 shadow-lg border border-gray-200">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-brand" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-tiny sm:text-small text-weak">
                      Booked Time
                    </p>
                    <p className="font-semibold text-strong text-small sm:text-body">
                      {formatTime(booking.selected_time || "")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-background rounded-xl p-3 sm:p-4 shadow-lg border border-gray-200">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-brand" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-tiny sm:text-small text-weak">
                    Booking Status
                  </p>
                  <StatusBadge
                    status={
                      (booking.booking_status?.toLowerCase() as any) ||
                      "pending"
                    }
                    type="booking"
                  />
                </div>
              </div>
            </div>
            <div className="bg-background rounded-xl p-3 sm:p-4 shadow-lg border border-gray-200">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-brand" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-tiny sm:text-small text-weak">
                    Payment Status
                  </p>
                  <StatusBadge
                    status={
                      (booking.payment_status?.toLowerCase() as any) ||
                      "pending"
                    }
                    type="payment"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-background rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl lg:text-h2 font-bold text-strong mb-3 sm:mb-4 flex items-center gap-2">
              Customer Information
            </h2>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-gray-100 p-1.5 sm:p-2 rounded-lg">
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-brand" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-tiny sm:text-small text-weak">Email</p>
                  <p className="font-medium text-strong text-small sm:text-body truncate">
                    {booking.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-gray-100 p-1.5 sm:p-2 rounded-lg">
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-brand" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-tiny sm:text-small text-weak">Phone</p>
                  <p className="font-medium text-strong text-small sm:text-body">
                    {booking.phone_number || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-gray-100 p-1.5 sm:p-2 rounded-lg">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 text-brand" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-tiny sm:text-small text-weak">
                    Booked Slots
                  </p>
                  <p className="font-medium text-strong text-small sm:text-body">
                    {booking.slots} {booking.slots === 1 ? "Person" : "People"}
                  </p>
                </div>
              </div>
              {booking?.promo_code && (
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-green-100 p-1.5 sm:p-2 rounded-lg">
                    <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-tiny sm:text-small text-weak">
                      Promo Code
                    </p>
                    <p className="font-medium text-green-600 text-small sm:text-body">
                      {booking.promo_code}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions Section */}
          <div className="bg-background rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl lg:text-h2 font-bold text-strong mb-4 sm:mb-6 flex items-center gap-2">
              Manage Booking
            </h2>

            <div className="space-y-3 sm:space-y-4">
              {/* Primary Actions */}
              <div className="grid grid-cols-1 gap-3">
                <Button
                  variant="outline"
                  className="h-auto min-h-[60px] sm:min-h-[70px] border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-strong transition-all duration-200 flex items-start gap-3 px-4 py-3"
                  onClick={() => setIsPersonalInfoModalOpen(true)}
                  disabled={isLoading}
                >
                  <div className="bg-blue-50 p-2 rounded-lg flex-shrink-0">
                    <UserCog className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <p className="font-semibold text-body truncate">
                      Update Contact Information
                    </p>
                    <p className="text-small text-weak mt-1 leading-relaxed">
                      Change customer name, email, and phone number
                    </p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto min-h-[60px] sm:min-h-[70px] border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-strong transition-all duration-200 flex items-start gap-3 px-4 py-3"
                  onClick={() => setIsRescheduleModalOpen(true)}
                  disabled={
                    isLoading ||
                    booking.payment_status === "refunding" ||
                    booking.payment_status === "refunded" ||
                    booking.payment_status === "partially_refunded"
                  }
                >
                  <div className="bg-orange-50 p-2 rounded-lg flex-shrink-0">
                    <RefreshCw className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <p className="font-semibold text-body truncate">
                      Change Date & Time
                    </p>
                    <p className="text-small text-weak mt-1 leading-relaxed">
                      Reschedule to a different date or time slot
                    </p>
                  </div>
                </Button>

                {!(
                  // booking.payment_status === "paid" &&
                  (booking.booking_status === "confirmed")
                ) && (
                  <>
                    {(!customSlotTypes || customSlotTypes.length === 0) &&
                      (!customSlotFields || customSlotFields.length === 0) && (
                        <Button
                          variant="outline"
                          className="h-auto min-h-[60px] sm:min-h-[70px] border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-strong transition-all duration-200 flex items-start gap-3 px-4 py-3"
                          onClick={() => setIsUpdateSlotsModalOpen(true)}
                          disabled={
                            isLoading || booking.payment_status !== "pending"
                          }
                        >
                          <div className="bg-green-50 p-2 rounded-lg flex-shrink-0">
                            <Users className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="text-left min-w-0 flex-1">
                            <p className="font-semibold text-body truncate">
                              Adjust Number of People
                            </p>
                            <p className="text-small text-weak mt-1 leading-relaxed">
                              Add or remove people from this booking
                            </p>
                          </div>
                        </Button>
                      )}

                    {((customSlotTypes && customSlotTypes.length > 0) ||
                      (customSlotFields && customSlotFields.length > 0)) && (
                      <Button
                        variant="outline"
                        className="h-auto min-h-[60px] sm:min-h-[70px] border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-strong transition-all duration-200 flex items-start gap-3 px-4 py-3"
                        onClick={() => setIsSlotDetailsModalOpen(true)}
                        disabled={
                          isLoading || booking.payment_status !== "pending"
                        }
                      >
                        <div className="bg-purple-50 p-2 rounded-lg flex-shrink-0">
                          <Edit2 className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="text-left min-w-0 flex-1">
                          <p className="font-semibold text-body truncate">
                            Edit Guest Details
                          </p>
                          <p className="text-small text-weak mt-1 leading-relaxed">
                            Update names and information for each person
                          </p>
                        </div>
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      className="h-auto min-h-[60px] sm:min-h-[70px] border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-strong transition-all duration-200 flex items-start gap-3 px-4 py-3"
                      onClick={() => {
                        setEditedProducts(editedProducts);
                        setIsProductsModalOpen(true);
                      }}
                      disabled={
                        isLoading || booking.payment_status !== "pending"
                      }
                    >
                      <div className="bg-indigo-50 p-2 rounded-lg flex-shrink-0">
                        <Package className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="text-left min-w-0 flex-1">
                        <p className="font-semibold text-body truncate">
                          Manage Add-ons & Extras
                        </p>
                        <p className="text-small text-weak mt-1 leading-relaxed">
                          Add, remove, or modify additional products
                        </p>
                      </div>
                    </Button>
                  </>
                )}

                {!(
                  booking.payment_status === "pending" &&
                  booking.booking_status === "pending"
                ) && (
                  <Button
                    variant="outline"
                    className="h-auto min-h-[60px] sm:min-h-[70px] border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 text-blue-700 transition-all duration-200 flex items-start gap-3 px-4 py-3"
                    onClick={handleAddAdditionalBooking}
                    disabled={isLoading}
                  >
                    <div className="bg-blue-50 p-2 rounded-lg flex-shrink-0">
                      <Plus className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <p className="font-semibold text-body truncate">
                        Add More Services
                      </p>
                      <p className="text-small text-blue-600 mt-1 leading-relaxed">
                        Add additional people or products to this booking
                      </p>
                    </div>
                  </Button>
                )}
              </div>

              {/* Cancellation Action */}
              {/* {booking.payment_status === "paid" && (
                <div className="pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    className="w-full h-auto min-h-[60px] sm:min-h-[70px] text-red-600 border-red-200 hover:border-red-300 hover:bg-red-50/50 transition-all duration-200 flex items-start gap-3 px-4 py-3"
                    onClick={handleCancelBooking}
                    disabled={
                      isLoading || booking.booking_status === "cancelled"
                    }
                  >
                    <div className="bg-red-50 p-2 rounded-lg flex-shrink-0">
                      {isLoading ? (
                        <RefreshCw className="w-5 h-5 animate-spin text-red-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <p className="font-semibold text-body">
                        {isLoading ? "Processing..." : "Cancel & Refund"}
                      </p>
                      <p className="text-small text-red-500 mt-1 leading-relaxed">
                        Cancel this booking and process refund
                      </p>
                    </div>
                  </Button>
                </div>
              )} */}
            </div>
          </div>
        </div>

        {/* Right Column - Primary Booking & Additional Bookings */}
        <div className="space-y-4 sm:space-y-6">
          {/* Primary Booking */}
          <div className="bg-background rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-strong mb-4 sm:mb-6 flex items-center gap-2">
              <div className="bg-brand/10 p-1.5 rounded-lg">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-brand" />
              </div>
              Primary Booking
            </h2>

            <div className="space-y-3 sm:space-y-4">
              {/* Selected Tour Section */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 sm:p-4 border border-gray-200">
                <h3 className="font-semibold text-strong text-small sm:text-body mb-3 flex items-center gap-2">
                  <div className="bg-brand/10 p-1 rounded-lg">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-brand" />
                  </div>
                  Tour Details
                </h3>

                {/* Tour Base Price */}
                {!customSlotTypes || customSlotTypes.length === 0 ? (
                  <div className="flex items-center justify-between py-2 sm:py-3 px-3 sm:px-4 bg-background rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="bg-gray-100 p-1.5 sm:p-2 rounded-lg">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden">
                          <Image
                            src={
                              booking.tour_featured_image ||
                              "/images/default-tour.png"
                            }
                            alt={booking.tour_title}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-strong text-small sm:text-body">
                          {booking.tour_title}
                        </p>
                        <p className="text-tiny sm:text-small text-weak">
                          {booking.slots} slot{booking.slots > 1 ? "s" : ""} • $
                          {booking.tour_rate}/person
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-strong text-small sm:text-body">
                      $
                      {(
                        (booking.tour_rate || 0) * (booking.slots || 0)
                      ).toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <>
                    {/* Tour Title for Custom Slots */}
                    <div className="flex items-center justify-between py-2 sm:py-3 px-3 sm:px-4 bg-background rounded-lg shadow-sm border border-gray-100 mb-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="bg-gray-100 p-1.5 sm:p-2 rounded-lg">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden">
                            <Image
                              src={
                                booking.tour_featured_image ||
                                "/images/default-tour.png"
                              }
                              alt={booking.tour_title}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-strong text-small sm:text-body">
                            {booking.tour_title}
                          </p>
                          <p className="text-tiny sm:text-small text-weak">
                            {booking.slots} slot{booking.slots > 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    </div>

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

                      return (
                        Object.entries(groupedSlots) as [
                          string,
                          { count: number; price: number },
                        ][]
                      ).map(([typeName, details]) => (
                        <div
                          key={typeName}
                          className="flex items-center justify-between py-2 sm:py-3 px-3 sm:px-4 bg-background rounded-lg shadow-sm border border-gray-100"
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="bg-brand/10 p-1.5 rounded-lg">
                              <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-brand" />
                            </div>
                            <div>
                              <p className="font-semibold text-strong text-small sm:text-body">
                                {typeName}
                              </p>
                              <p className="text-tiny sm:text-small text-weak">
                                {details.count} slot
                                {details.count > 1 ? "s" : ""} • $
                                {details.price}/person
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-strong text-small sm:text-body">
                            ${(details.price * details.count).toFixed(2)}
                          </span>
                        </div>
                      ));
                    })()}
                  </>
                )}
              </div>

              {/* Additional Products */}
              {editedProducts.length > 0 && (
                <div className="pt-3 sm:pt-4 border-t border-gray-200">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 sm:p-4 border border-indigo-200">
                    <h3 className="font-semibold text-strong text-small sm:text-body mb-3 flex items-center gap-2">
                      <div className="bg-indigo-100 p-1 rounded-lg">
                        <Package className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600" />
                      </div>
                      Additional Products
                    </h3>
                    {editedProducts.map((product, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 sm:py-3 px-3 sm:px-4 bg-background rounded-lg shadow-sm border border-gray-100 mb-2"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="bg-background rounded-lg overflow-hidden">
                            <Image
                              src={
                                product.image_url ||
                                "/images/default-product.png"
                              }
                              alt={product.name}
                              width={60}
                              height={70}
                              className="rounded-lg"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-strong text-small sm:text-body truncate">
                              {product.name}
                            </p>
                            <p className="text-tiny sm:text-small text-weak">
                              {product.quantity} item
                              {product.quantity > 1 ? "s" : ""} in cart
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-strong text-small sm:text-body">
                          ${(product.unit_price * product.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="h-px bg-gray-200 my-4 sm:my-6"></div>

              {/* Subtotal (shown when discount is applied) */}
              {booking.discount_amount !== 0 && (
                <div className="flex items-center justify-between py-2 sm:py-3 px-3 sm:px-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                  <span className="text-small sm:text-body font-semibold text-gray-700">
                    Subtotal
                  </span>
                  <span className="text-small sm:text-body font-semibold text-gray-900">
                    $
                    {booking?.total_price_before_discount?.toFixed(2) ||
                      (() => {
                        // Calculate subtotal from custom slots
                        const slotsTotal =
                          customSlotTypes && customSlotTypes.length > 0
                            ? slotDetails.reduce((sum, slot) => {
                                const slotType = customSlotTypes.find(
                                  (t) => t.name === slot.type
                                );
                                return sum + (slotType?.price || 0);
                              }, 0)
                            : (booking.tour_rate || 0) * (booking.slots || 0);

                        // Calculate subtotal from products
                        const productsTotal = editedProducts.reduce(
                          (sum, product) =>
                            sum + product.unit_price * product.quantity,
                          0
                        );

                        return (slotsTotal + productsTotal).toFixed(2);
                      })()}
                  </span>
                </div>
              )}

              {/* Discount Section */}
              {booking.discount_amount !== 0 && (
                <>
                  <div className="flex items-center justify-between py-2 sm:py-3 px-3 sm:px-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="bg-green-100 p-1.5 rounded-lg">
                        <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                      </div>
                      <div>
                        <span className="text-small sm:text-body text-green-700 font-semibold">
                          Discount
                        </span>
                        {booking?.promo_code && (
                          <span className="text-tiny sm:text-small text-green-600 bg-green-100 px-2 py-1 rounded-full ml-2">
                            {booking.promo_code}
                          </span>
                        )}
                        {/* {booking?.total_price_before_discount &&
                          booking.total_price_before_discount > 0 && (
                            <span className="text-tiny sm:text-small text-green-600 block mt-1">
                              (
                              {(
                                ((booking.discount_amount || 0) /
                                  booking.total_price_before_discount) *
                                100
                              ).toFixed(0)}
                              % off)
                            </span>
                          )} */}
                      </div>
                    </div>
                    <span className="text-small sm:text-body font-bold text-green-700">
                      -${(booking.discount_amount || 0).toFixed(2)}
                    </span>
                  </div>
                </>
              )}

              {/* Total Amount */}
              <div className="flex items-center justify-between py-3 sm:py-4 px-3 sm:px-4 bg-gradient-to-r from-brand/5 to-brand/10 rounded-lg border-2 border-brand/20">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-brand p-1.5 sm:p-2 rounded-lg">
                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-strong text-small sm:text-body">
                      Total Amount
                    </p>
                    <p className="text-tiny sm:text-small text-weak">
                      Final payment
                    </p>
                  </div>
                </div>
                <span className="text-small sm:text-body font-bold text-brand">
                  ${booking?.amount_paid.toFixed(2)}
                  {/* {(() => {
                    // Calculate total from custom slots
                    const slotsTotal =
                      customSlotTypes && customSlotTypes.length > 0
                        ? slotDetails.reduce((sum, slot) => {
                            const slotType = customSlotTypes.find(
                              (t) => t.name === slot.type
                            );
                            return sum + (slotType?.price || 0);
                          }, 0)
                        : (booking.tour_rate || 0) * (booking.slots || 0);

                    // Calculate total from products
                    const productsTotal = editedProducts.reduce(
                      (sum, product) =>
                        sum + product.unit_price * product.quantity,
                      0
                    );

                    return (slotsTotal + productsTotal).toFixed(2);
                  })()} */}
                </span>
              </div>

              {/* Payment Status Info */}
              {booking.payment_status.toLowerCase() !== "paid" && (
                <div className="pt-3 sm:pt-4">
                  {booking.payment_link ? (
                    <button
                      className="w-full h-12 sm:h-14 bg-brand hover:bg-brand/90 text-white font-semibold border-0 shadow-md hover:shadow-lg transition-all duration-200 text-body sm:text-lg rounded-md flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() =>
                        window.open(booking.payment_link, "_blank")
                      }
                      disabled={isLoading}
                    >
                      <ExternalLink className="w-5 h-5 sm:w-6 sm:h-6" />
                      Proceed to Payment
                    </button>
                  ) : (
                    <button
                      className="w-full h-12 sm:h-14 bg-brand hover:bg-brand/90 text-white font-semibold border-0 shadow-md hover:shadow-lg transition-all duration-200 text-body sm:text-lg rounded-md flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() =>
                        handlePaymentLinkUpdateWrapper(false, null, null, null)
                      }
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                      ) : (
                        <Link className="w-5 h-5 sm:w-6 sm:h-6" />
                      )}
                      Create Payment Link
                    </button>
                  )}
                </div>
              )}

              {/* Additional Bookings Section */}
              {additionalBookings.length > 0 && (
                <>
                  <div className="h-px bg-gray-200 my-4 sm:my-6"></div>

                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3 sm:p-4 border border-blue-200">
                    <h3 className="font-semibold text-blue-800 text-small sm:text-body mb-3 flex items-center gap-2">
                      <div className="bg-blue-100 p-1 rounded-lg">
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                      </div>
                      Additional Bookings
                    </h3>
                    <div className="space-y-3">
                      {additionalBookings.map((additional, index) => (
                        <div
                          key={additional.additional_id}
                          className="bg-white rounded-lg p-3 border border-blue-200 shadow-sm"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="bg-blue-100 p-1.5 rounded-lg">
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-blue-800 text-small">
                                  Additional #{index + 1}
                                </p>
                                <p className="text-tiny text-blue-600">
                                  Added on{" "}
                                  {new Date(
                                    additional.additional_created_at
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <StatusBadge
                              status={mapAdditionalStatusToPaymentStatus(
                                additional.status
                              )}
                              type="payment"
                            />
                          </div>

                          <div className="space-y-1">
                            {additional.added_slots > 0 && (
                              <div className="flex items-center justify-between text-tiny">
                                <span className="text-blue-600 font-medium">
                                  Additional Slots:
                                </span>
                                <span className="font-semibold text-blue-800">
                                  {additional.added_slots}
                                  {additional.added_slots === 1
                                    ? " person"
                                    : " people"}
                                </span>
                              </div>
                            )}

                            {additional.amount_paid && (
                              <div className="flex items-center justify-between text-tiny">
                                <span className="text-blue-600 font-medium">
                                  Amount Paid:
                                </span>
                                <span className="font-bold text-blue-800 text-small">
                                  ${additional.amount_paid.toFixed(2)}
                                </span>
                              </div>
                            )}

                            {additional.payment_reference && (
                              <div className="flex items-center justify-between text-tiny">
                                <span className="text-blue-600 font-medium">
                                  Payment Ref:
                                </span>
                                <span className="font-mono text-blue-800 text-xs">
                                  {additional.payment_reference}
                                </span>
                              </div>
                            )}

                            {/* Additional Products */}
                            {additional.added_products &&
                              additional.added_products.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-blue-200">
                                  <div className="flex items-center gap-1 mb-1">
                                    <Package className="w-3 h-3 text-blue-600" />
                                    <span className="text-tiny font-medium text-blue-700">
                                      Added Products:
                                    </span>
                                  </div>
                                  <div className="space-y-1">
                                    {additional.added_products.map(
                                      (product: any, productIndex: number) => {
                                        // Handle different possible data structures
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

                                        return (
                                          <div
                                            key={`additional-product-${index}-${productIndex}`}
                                            className="flex items-center justify-between text-tiny bg-blue-50 rounded px-2 py-1"
                                          >
                                            <span className="text-blue-800">
                                              {productName} (x{quantity})
                                            </span>
                                            <span className="font-semibold text-blue-800">
                                              $
                                              {(unitPrice * quantity).toFixed(
                                                2
                                              )}
                                            </span>
                                          </div>
                                        );
                                      }
                                    )}
                                  </div>
                                </div>
                              )}

                            {additional.note && (
                              <div className="mt-2 p-2 bg-blue-100 rounded border border-blue-300">
                                <p className="text-tiny text-blue-700">
                                  <strong>Note:</strong> {additional.note}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <RescheduleBookingModal
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        onReschedule={handleReschedule}
        currentDate={booking?.booking_date}
        currentTime={booking?.selected_time}
        tourId={booking?.tour_id || ""}
      />

      <SlotDetailsModal
        isOpen={isSlotDetailsModalOpen}
        onClose={() => setIsSlotDetailsModalOpen(false)}
        onSuccess={() => {
          fetchBooking();
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

      <ProductsModal
        isOpen={isProductsModalOpen}
        onClose={() => setIsProductsModalOpen(false)}
        onSuccess={() => {
          fetchBooking();
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

      <PersonalInfoModal
        isOpen={isPersonalInfoModalOpen}
        onClose={() => setIsPersonalInfoModalOpen(false)}
        onSuccess={() => {
          fetchBooking();
          onSuccess?.();
        }}
        bookingId={bookingId}
        initialCustomerInfo={customerInformation}
        paymentLink={booking?.payment_link}
        handlePaymentLinkUpdate={handlePaymentLinkUpdateWrapper}
      />

      <RefundAmountModal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        onConfirm={async (refundAmount) => {
          await processCancellation(refundAmount);
          fetchBooking();
        }}
        totalAmount={booking?.amount_paid || 0}
        isLoading={isLoading}
      />

      <UpdateSlotsModal
        isOpen={isUpdateSlotsModalOpen}
        onClose={() => setIsUpdateSlotsModalOpen(false)}
        onSuccess={() => {
          fetchBooking();
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

export default CustomerUpdateBookingForm;
