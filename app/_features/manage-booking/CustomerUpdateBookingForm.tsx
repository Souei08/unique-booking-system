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
      <div className="flex items-center justify-center min-h-[300px] px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand mx-auto"></div>
          <p className="mt-3 text-weak text-sm">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center min-h-[300px] px-4">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-weak text-sm">No booking found</p>
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

  // Helper function to get guest information from slot_details or fallback to slots
  const getGuestInfo = () => {
    if (slotDetails && Array.isArray(slotDetails) && slotDetails.length > 0) {
      const adultCount = slotDetails.filter(
        (slot) => slot.type === "adult"
      ).length;
      const childCount = slotDetails.filter(
        (slot) => slot.type === "child"
      ).length;
      const totalGuests = slotDetails.length;
      const totalPrice = slotDetails.reduce(
        (sum, slot) => sum + (slot.price || 0),
        0
      );

      return {
        totalGuests,
        adultCount,
        childCount,
        totalPrice,
        hasSlotDetails: true,
        breakdown: slotDetails.reduce(
          (acc, slot) => {
            const type = slot.type || "adult";
            if (!acc[type]) {
              acc[type] = { count: 0, price: slot.price || 0 };
            }
            acc[type].count++;
            return acc;
          },
          {} as Record<string, { count: number; price: number }>
        ),
      };
    } else {
      // Fallback to booking.slots
      return {
        totalGuests: booking?.slots || 0,
        adultCount: booking?.slots || 0,
        childCount: 0,
        totalPrice: (booking?.tour_rate || 0) * (booking?.slots || 0),
        hasSlotDetails: false,
        breakdown: {
          adult: { count: booking?.slots || 0, price: booking?.tour_rate || 0 },
        },
      };
    }
  };

  const guestInfo = getGuestInfo();

  // Helper function to get icon and colors based on payment status
  const getPaymentStatusIcon = (
    paymentStatus: string,
    bookingStatus: string
  ) => {
    const status = paymentStatus?.toLowerCase();
    const bookingStatusLower = bookingStatus?.toLowerCase();

    switch (status) {
      case "paid":
        return {
          icon: CheckCircle,
          bgColor: "bg-green-50",
          iconColor: "text-green-600",
          title: "Booking Confirmed",
          subtitle: "Payment verified and booking confirmed",
        };
      case "pending":
        return {
          icon: Clock,
          bgColor: "bg-amber-50",
          iconColor: "text-amber-600",
          title:
            bookingStatusLower === "confirmed"
              ? "Booking Confirmed"
              : "Payment Pending",
          subtitle: "Complete payment to confirm booking",
        };
      case "failed":
        return {
          icon: XCircle,
          bgColor: "bg-red-50",
          iconColor: "text-red-600",
          title: "Payment Failed",
          subtitle: "Payment was not successful",
        };
      case "cancelled":
        return {
          icon: XCircle,
          bgColor: "bg-gray-50",
          iconColor: "text-gray-600",
          title: "Booking Cancelled",
          subtitle: "This booking has been cancelled",
        };
      case "refunding":
        return {
          icon: RefreshCw,
          bgColor: "bg-blue-50",
          iconColor: "text-blue-600",
          title: "Refund Processing",
          subtitle: "Refund is being processed",
        };
      case "refunded":
        return {
          icon: CheckCircle,
          bgColor: "bg-purple-50",
          iconColor: "text-purple-600",
          title: "Booking Refunded",
          subtitle: "Refund has been completed",
        };
      case "partial_refund":
        return {
          icon: AlertCircle,
          bgColor: "bg-orange-50",
          iconColor: "text-orange-600",
          title: "Partially Refunded",
          subtitle: "Partial refund has been processed",
        };
      default:
        return {
          icon: Info,
          bgColor: "bg-gray-50",
          iconColor: "text-gray-600",
          title: `Booking ${bookingStatus || "Unknown"}`,
          subtitle: "Status information unavailable",
        };
    }
  };

  const paymentStatusConfig = getPaymentStatusIcon(
    booking?.payment_status || "",
    booking?.booking_status || ""
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          Booking Details
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Review and manage your booking information
        </p>
      </div>

      {/* Tour Header Card */}
      <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 bg-indigo-50 rounded-lg flex items-center justify-center">
              <MapPin className="w-3 h-3 text-indigo-600" />
            </div>
            <h2 className="text-base font-bold text-gray-900">Selected Tour</h2>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 shadow-sm border border-gray-100 bg-gray-50">
              <Image
                src={booking.tour_featured_image || "/images/default-tour.png"}
                alt={booking.tour_title}
                width={48}
                height={48}
                quality={100}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 truncate">
                {booking.tour_title}
              </h3>
              <div className="flex flex-wrap items-center gap-4 text-xs mb-3">
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock className="w-3 h-3" />
                  <span>3 hours</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <DollarSign className="w-3 h-3" />
                  <span>${booking.tour_rate || 0} per person</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Tag className="w-3 h-3" />
                  <span>Adventure</span>
                </div>
              </div>

              {/* Key Booking Details */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-3 h-3 text-blue-600" />
                    <span className="text-xs font-medium text-gray-600">
                      Tour Date
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-gray-900">
                    {formatDate(booking.booking_date)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-green-600" />
                    <span className="text-xs font-medium text-gray-600">
                      Tour Time
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-gray-900">
                    {formatTime(booking.selected_time || "")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3 h-3 text-purple-600" />
                    <span className="text-xs font-medium text-gray-600">
                      Reference
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-gray-900 font-mono">
                    {booking.reference_number}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <span className="text-xs font-medium text-gray-600">
                      Booking Status
                    </span>
                  </div>
                  <StatusBadge
                    status={booking.booking_status as any}
                    type="booking"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-3 h-3 text-blue-600" />
                    <span className="text-xs font-medium text-gray-600">
                      Payment Status
                    </span>
                  </div>
                  <StatusBadge
                    status={booking.payment_status as any}
                    type="payment"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Button for Pending Payments */}
      {booking?.payment_status === "pending" && booking?.payment_link && (
        <div className="mb-6">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-amber-900 mb-1">
                    Payment Required
                  </h3>
                  <p className="text-sm text-amber-700">
                    Complete your payment to confirm your booking. Your tour is
                    reserved but not confirmed until payment is received.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => window.open(booking.payment_link, "_blank")}
                  className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Complete Payment</span>
                </Button>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(booking.payment_link);
                    toast.success("Payment link copied to clipboard");
                  }}
                  variant="outline"
                  className="px-4 py-3 border border-amber-300 text-amber-700 font-medium rounded-lg hover:bg-amber-50 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left Column - Booking Information */}
        <div className="space-y-4">
          {/* Booking Details Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center">
                  <CalendarDays className="w-3 h-3 text-blue-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900">
                  Booking Information
                </h3>
              </div>

              <div className="space-y-4">
                {/* Guest Details */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-3 h-3 text-gray-500" />
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Guest Booked
                    </span>
                  </div>
                  <div className="space-y-2">
                    {guestInfo.hasSlotDetails ? (
                      // Show detailed breakdown when slot_details is available
                      Object.entries(guestInfo.breakdown).map(
                        ([type, info]) => {
                          const typedInfo = info as {
                            count: number;
                            price: number;
                          };
                          return (
                            <div key={type} className="bg-white rounded-lg p-2">
                              <div className="flex justify-between items-center">
                                <div className="text-sm font-medium text-gray-900 capitalize">
                                  {type}
                                  {typedInfo.count === 1 ? "" : "s"} ×{" "}
                                  {typedInfo.count}
                                </div>
                                <div className="text-sm font-semibold text-gray-900">
                                  $
                                  {(typedInfo.price * typedInfo.count).toFixed(
                                    2
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )
                    ) : (
                      // Fallback to original display
                      <div className="bg-white rounded-lg p-2">
                        <div className="flex justify-between items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {guestInfo.totalGuests === 1 ? "Guest" : "Guests"} ×{" "}
                            {guestInfo.totalGuests}
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            ${guestInfo.totalPrice.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Products */}
                {editedProducts && editedProducts.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-3 h-3 text-gray-500" />
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Additional Products
                      </span>
                    </div>
                    <div className="space-y-2">
                      {editedProducts.map((product, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center bg-white rounded-lg p-2"
                        >
                          <div className="text-sm font-medium text-gray-900">
                            {product.name} × {product.quantity}
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            $
                            {(product.unit_price * product.quantity).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pricing Breakdown */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="w-3 h-3 text-blue-600" />
                    <span className="text-xs font-medium text-blue-900 uppercase tracking-wide">
                      Pricing Breakdown
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-xs text-gray-700">
                        Tour Subtotal
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        ${guestInfo.totalPrice.toFixed(2)}
                      </span>
                    </div>

                    {editedProducts && editedProducts.length > 0 && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-xs text-gray-700">
                          Products Subtotal
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          $
                          {editedProducts
                            .reduce(
                              (total, product) =>
                                total + product.unit_price * product.quantity,
                              0
                            )
                            .toFixed(2)}
                        </span>
                      </div>
                    )}

                    {booking.promo_code && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-xs text-gray-700">
                          Promo Code ({booking.promo_code})
                        </span>
                        <span className="text-sm text-green-600 font-semibold">
                          -$
                          {(
                            guestInfo.totalPrice +
                            (editedProducts?.reduce(
                              (total, product) =>
                                total + product.unit_price * product.quantity,
                              0
                            ) || 0) -
                            booking.amount_paid
                          ).toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="border-t border-blue-200 pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-900">
                          Total Amount
                        </span>
                        <span className="text-base font-bold text-blue-600">
                          ${booking.amount_paid.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Guest Information & Booking Status */}
        <div className="space-y-4">
          {/* Guest Information Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <UserRound className="w-3 h-3 text-emerald-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900">
                  Guest Information
                </h3>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-xs font-medium text-gray-500">
                      Guest Name
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {booking.full_name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-xs font-medium text-gray-500">
                      Email
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {booking.email}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-xs font-medium text-gray-500">
                      Phone
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {booking.phone_number || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-xs font-medium text-gray-500">
                      Total Guests
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {guestInfo.hasSlotDetails ? (
                        <span>
                          {guestInfo.totalGuests} Total{" "}
                          {guestInfo.adultCount > 0 &&
                            `(${guestInfo.adultCount} Adult${guestInfo.adultCount === 1 ? "" : "s"})`}
                          {guestInfo.childCount > 0 &&
                            ` (${guestInfo.childCount} Child${guestInfo.childCount === 1 ? "" : "ren"})`}
                        </span>
                      ) : (
                        `${guestInfo.totalGuests} ${guestInfo.totalGuests === 1 ? "Adult" : "Adults"}`
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Status Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-6 h-6 ${paymentStatusConfig.bgColor} rounded-lg flex items-center justify-center`}
                >
                  <paymentStatusConfig.icon
                    className={`w-3 h-3 ${paymentStatusConfig.iconColor}`}
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {paymentStatusConfig.title}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">
                    {paymentStatusConfig.subtitle}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-xs font-medium text-gray-500">
                        Date
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatDate(booking.booking_date)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-xs font-medium text-gray-500">
                        Payment Method
                      </span>
                      <span className="text-sm font-semibold text-gray-900 capitalize">
                        {booking.payment_method}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-xs font-medium text-gray-500">
                        Payment Amount
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        ${booking.amount_paid.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Mail className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-blue-900 font-medium mb-1">
                        Confirmation Sent
                      </p>
                      <p className="text-xs text-blue-700">
                        We sent your confirmation email to{" "}
                        <span className="font-semibold">{booking.email}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {booking.payment_status === "paid" && (
                  <button
                    onClick={handleAddAdditionalBooking}
                    className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Additional Booking</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Bookings Section */}
      {additionalBookings.length > 0 && (
        <div className="mt-6">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              Additional Bookings
            </h2>
            <p className="text-sm text-gray-600">
              Additional slots and products added to your original booking
            </p>
          </div>

          <div className="space-y-4">
            {additionalBookings.map((additional, index) => (
              <div
                key={additional.additional_id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-orange-50 rounded-lg flex items-center justify-center">
                        <Plus className="w-3 h-3 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900">
                          Additional Booking #{index + 1}
                        </h3>
                        <p className="text-xs text-gray-500">
                          Added on{" "}
                          {formatDate(additional.additional_created_at)}
                        </p>
                      </div>
                    </div>
                    <div>
                      <StatusBadge
                        status={mapAdditionalStatusToPaymentStatus(
                          additional.status
                        )}
                        type="payment"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column - Additional Details */}
                    <div className="space-y-4">
                      {/* Additional Slots */}
                      {additional.added_slots > 0 && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-3 h-3 text-gray-500" />
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Additional Guests
                            </span>
                          </div>
                          <div className="bg-white rounded-lg p-2">
                            <div className="flex justify-between items-center">
                              <div className="text-sm font-medium text-gray-900">
                                {additional.added_slots === 1
                                  ? "Adult"
                                  : "Adults"}{" "}
                                × {additional.added_slots}
                              </div>
                              <div className="text-sm font-semibold text-gray-900">
                                $
                                {(
                                  (booking?.tour_rate || 0) *
                                  additional.added_slots
                                ).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Additional Products */}
                      {additional.added_products &&
                        Array.isArray(additional.added_products) &&
                        additional.added_products.length > 0 && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Package className="w-3 h-3 text-gray-500" />
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Additional Products
                              </span>
                            </div>
                            <div className="space-y-2">
                              {additional.added_products.map(
                                (product: any, productIndex: number) => (
                                  <div
                                    key={productIndex}
                                    className="flex justify-between items-center bg-white rounded-lg p-2"
                                  >
                                    <div className="text-sm font-medium text-gray-900">
                                      {product.name || "Product"} ×{" "}
                                      {product.quantity || 1}
                                    </div>
                                    <div className="text-sm font-semibold text-gray-900">
                                      $
                                      {(
                                        (product.unit_price || 0) *
                                        (product.quantity || 1)
                                      ).toFixed(2)}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Note */}
                      {additional.note && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <Info className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-blue-900 font-medium mb-1">
                                Note
                              </p>
                              <p className="text-xs text-blue-700">
                                {additional.note}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column - Payment Details */}
                    <div className="space-y-4">
                      {/* Payment Information */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-100">
                        <div className="flex items-center gap-2 mb-3">
                          <CreditCard className="w-3 h-3 text-green-600" />
                          <span className="text-xs font-medium text-green-900 uppercase tracking-wide">
                            Payment Details
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center py-1">
                            <span className="text-xs text-gray-700">
                              Payment Method
                            </span>
                            <span className="text-sm font-semibold text-gray-900 capitalize">
                              {additional.payment_method || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-1">
                            <span className="text-xs text-gray-700">
                              Amount Paid
                            </span>
                            <span className="text-sm font-semibold text-gray-900">
                              ${(additional.amount_paid || 0).toFixed(2)}
                            </span>
                          </div>
                          {additional.discount_amount &&
                            additional.discount_amount > 0 && (
                              <div className="flex justify-between items-center py-1">
                                <span className="text-xs text-gray-700">
                                  Discount Applied
                                </span>
                                <span className="text-sm text-green-600 font-semibold">
                                  -${additional.discount_amount.toFixed(2)}
                                </span>
                              </div>
                            )}
                          {additional.refunded_amount &&
                            additional.refunded_amount > 0 && (
                              <div className="flex justify-between items-center py-1">
                                <span className="text-xs text-gray-700">
                                  Refunded Amount
                                </span>
                                <span className="text-sm text-red-600 font-semibold">
                                  -${additional.refunded_amount.toFixed(2)}
                                </span>
                              </div>
                            )}
                          {additional.payment_reference && (
                            <div className="flex justify-between items-center py-1">
                              <span className="text-xs text-gray-700">
                                Payment Reference
                              </span>
                              <span className="text-xs font-semibold text-gray-900 font-mono">
                                {additional.payment_reference}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status and Dates */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="space-y-2">
                          {additional.paid_at && (
                            <div className="flex justify-between items-center py-1">
                              <span className="text-xs font-medium text-gray-500">
                                Paid On
                              </span>
                              <span className="text-sm font-semibold text-gray-900">
                                {formatDate(additional.paid_at)}
                              </span>
                            </div>
                          )}
                          {additional.refunded_at && (
                            <div className="flex justify-between items-center py-1">
                              <span className="text-xs font-medium text-gray-500">
                                Refunded On
                              </span>
                              <span className="text-sm font-semibold text-gray-900">
                                {formatDate(additional.refunded_at)}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between items-center py-1">
                            <span className="text-xs font-medium text-gray-500">
                              Added On
                            </span>
                            <span className="text-sm font-semibold text-gray-900">
                              {formatDate(additional.additional_created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
