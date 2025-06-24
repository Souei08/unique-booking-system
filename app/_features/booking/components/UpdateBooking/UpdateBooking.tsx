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
import { updateBookingPayment } from "../../api/updateBookingPayment";
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
      <div className="bg-white rounded-xl shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1),0_4px_8px_-4px_rgba(0,0,0,0.1)] border border-gray-300 p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl sm:text-2xl font-bold text-strong">
                {booking?.full_name}
              </h1>

              <StatusBadge
                status={
                  (booking?.booking_status?.toLowerCase() as any) || "pending"
                }
                type="booking"
              />
            </div>
            <div className="flex flex-wrap gap-6 text-small text-gray-600">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4" />
                <span>{booking?.phone_number || "N/A"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4" />
                <span>{booking?.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Tag className="w-4 h-4" />
                <span>ID: {booking?.reference_number}</span>
              </div>
              {booking?.promo_code && (
                <div className="flex items-center gap-3">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Tour Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Selected Tour Card */}
          <div className="bg-white rounded-xl shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1),0_4px_8px_-4px_rgba(0,0,0,0.1)] border border-gray-300">
            {/* Header Section */}
            <div className="p-8 border-b border-gray-200">
              <h2 className="text-xl sm:text-2xl font-bold text-strong flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Selected Tour
              </h2>
              <p className="text-sm text-weak mt-1">
                View booking slot information and tour details
              </p>
            </div>

            {/* Content Section */}
            <div className="p-8 space-y-6">
              {/* Tour Summary */}
              <div className="flex flex-col items-center md:flex-row gap-6">
                {/* Tour Image */}
                <div className="relative h-[280px] w-full md:w-64 flex-shrink-0 overflow-hidden rounded-xl shadow-md">
                  <img
                    src={booking?.tour_featured_image}
                    alt={booking?.tour_title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <span className="inline-block px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-900">
                      {booking?.slots}{" "}
                      {booking?.slots === 1 ? "Person" : "People"}
                    </span>
                  </div>
                </div>

                {/* Tour Info */}
                <div className="flex-1 min-w-0 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-strong mb-2">
                      {booking?.tour_title}
                    </h3>
                    <p className="text-sm text-weak line-clamp-2">
                      {booking?.tour_description}
                    </p>
                  </div>

                  {/* Tour Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50/80 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200">
                      <div className="flex items-center gap-2 mb-2">
                        <CalendarDays className="w-3 h-3 text-gray-500" />
                        <p className="text-xs text-weak font-semibold">
                          Scheduled Date
                        </p>
                      </div>
                      <p className="text-sm font-bold text-strong">
                        {formatDate(booking?.booking_date)}
                      </p>
                    </div>
                    <div className="bg-gray-50/80 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <p className="text-xs text-weak font-semibold">
                          Scheduled Time
                        </p>
                      </div>
                      <p className="text-sm font-bold text-strong">
                        {formatTime(booking?.selected_time || "")}
                      </p>
                    </div>
                    <div className="bg-gray-50/80 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-3 h-3 text-gray-500" />
                        <p className="text-xs text-weak font-semibold">
                          Booked Slots
                        </p>
                      </div>
                      <p className="text-sm font-bold text-strong">
                        {booking?.slots}{" "}
                        {booking?.slots === 1 ? "Person" : "People"}
                      </p>
                    </div>

                    {customSlotTypes && customSlotTypes.length > 0 ? (
                      <div className="bg-gray-50/80 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Tag className="w-3 h-3 text-gray-500" />
                          <p className="text-xs text-weak font-semibold">
                            Price Range
                          </p>
                        </div>
                        <div className="text-sm font-bold text-strong">
                          {`$${Math.min(
                            ...customSlotTypes.map((slot) => slot.price)
                          )} - $${Math.max(
                            ...customSlotTypes.map((slot) => slot.price)
                          )}`}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50/80 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Tag className="w-3 h-3" />
                          <p className="text-xs text-weak font-semibold">
                            Base Rate
                          </p>
                        </div>
                        <p className="text-sm font-bold text-strong">
                          ${booking?.tour_rate}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Slot Details Card */}
          {customSlotTypes &&
            customSlotTypes.length > 0 &&
            customSlotFields &&
            customSlotFields.length > 0 && (
              <div className="bg-white rounded-xl shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1),0_4px_8px_-4px_rgba(0,0,0,0.1)] border border-gray-300">
                {/* Header Section */}
                <div className="p-8 border-b border-gray-200">
                  <h2 className="text-xl sm:text-2xl font-bold text-strong flex items-center gap-2">
                    <List className="w-5 h-5" />
                    Slot Details
                  </h2>
                  <p className="text-sm text-weak mt-1">
                    View and manage booking slot information
                  </p>
                </div>

                {/* Content Section */}
                <div className="p-8">
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
              </div>
            )}

          {/* Additional Products Card */}
          <div className="bg-white rounded-xl shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1),0_4px_8px_-4px_rgba(0,0,0,0.1)] border border-gray-300">
            {/* Header Section */}
            <div className="p-8 border-b border-gray-200">
              <h2 className="text-xl sm:text-2xl font-bold text-strong flex items-center gap-2">
                <Package className="w-5 h-5" />
                Ordered Products
              </h2>
              <p className="text-sm text-weak mt-1">
                View ordered products and their details
              </p>
            </div>

            {/* Content Section */}
            <div className="p-8">
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
          </div>
        </div>

        {/* Right Column - Payment & Actions */}
        <div className="space-y-8">
          {/* Payment Information Card */}
          <div className="bg-white rounded-xl shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1),0_4px_8px_-4px_rgba(0,0,0,0.1)] border border-gray-300">
            {/* Header Section */}
            <div className="p-8 border-b border-gray-200">
              <h2 className="text-xl sm:text-2xl font-bold text-strong flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Details
              </h2>
              <p className="text-sm text-weak mt-1">
                View payment details and manage payment link
              </p>
            </div>

            {/* Content Section */}
            <div className="p-8 space-y-8">
              {/* Payment Status and Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-gray-50/80 p-4 rounded-lg border border-gray-200">
                  <div className="mb-2">
                    <p className="text-xs text-gray-500 font-semibold flex items-center gap-2">
                      <List className="w-3 h-3" />
                      Payment Status
                    </p>
                  </div>
                  <div className="text-base font-medium">
                    <StatusBadge
                      status={
                        (booking?.payment_status?.toLowerCase() as any) ||
                        "pending"
                      }
                      type="payment"
                    />
                  </div>
                </div>
                <div className="bg-gray-50/80 p-4 rounded-lg border border-gray-200">
                  <div className="mb-2">
                    <p className="text-xs text-gray-500 font-semibold flex items-center gap-2">
                      <CreditCard className="w-3 h-3" />
                      Payment Method
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-strong uppercase">
                      {booking?.payment_method || "Credit Card"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Amount and Transaction ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-gray-50/80 p-4 rounded-lg border border-gray-200">
                  <div className="mb-2">
                    <p className="text-xs text-gray-500 font-semibold flex items-center gap-2">
                      <Tag className="w-3 h-3" />
                      Payment Amount
                    </p>
                  </div>
                  <div className="space-y-1">
                    {booking?.discount_amount && booking.discount_amount > 0 ? (
                      <>
                        <p className="text-sm font-bold text-strong">
                          ${booking?.amount_paid.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 line-through">
                          ${booking?.total_price_before_discount?.toFixed(2)}
                        </p>
                      </>
                    ) : (
                      <p className="text-base font-bold text-strong">
                        ${booking?.amount_paid.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50/80 p-4 rounded-lg border border-gray-200">
                  <div className="mb-2">
                    <p className="text-xs text-gray-500 font-semibold flex items-center gap-2">
                      <ExternalLink className="w-3 h-3" />
                      Stripe Transaction ID
                    </p>
                  </div>
                  <p className="text-xs font-bold text-strong break-all">
                    {booking?.stripe_payment_id === null
                      ? "N/A"
                      : booking?.stripe_payment_id}
                  </p>
                </div>
              </div>

              {booking?.payment_status.toLowerCase() !== "paid" && (
                <>
                  {/* Payment Link Section */}
                  <div className="bg-gray-50/80 p-4 rounded-lg border border-gray-200">
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 font-semibold flex items-center gap-2">
                        <Link className="w-3 h-3" />
                        Payment Link
                      </p>
                    </div>
                    {booking?.payment_link ? (
                      <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
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
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex-1">
                            <p className="text-sm text-yellow-800">
                              No payment link available
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 border-yellow-200 hover:bg-yellow-100 hover:text-yellow-900"
                            onClick={() =>
                              handlePaymentLinkUpdateWrapper(
                                false,
                                null,
                                null,
                                null
                              )
                            }
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
                </>
              )}

              {/* Pricing Breakdown */}
              <div className="bg-gray-50/80 p-4 rounded-lg border border-gray-200">
                <div className="mb-3">
                  <p className="text-xs text-gray-500 font-semibold flex items-center gap-2">
                    <CreditCard className="w-3 h-3" />
                    Pricing Breakdown
                  </p>
                </div>
                <div className="space-y-3">
                  {/* Tour Base Price */}
                  {!customSlotTypes || customSlotTypes.length === 0 ? (
                    <div className="flex items-center justify-between py-3 px-4 bg-white rounded-lg">
                      <span className="text-sm text-gray-600">
                        Base Rate × {booking?.slots} people
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        $
                        {(
                          (booking?.tour_rate || 0) * (booking?.slots || 0)
                        ).toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <>
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
                            className="flex items-center justify-between py-3 px-4 bg-white rounded-lg"
                          >
                            <span className="text-sm text-gray-600">
                              {typeName} × {details.count}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              ${(details.price * details.count).toFixed(2)}
                            </span>
                          </div>
                        ));
                      })()}
                    </>
                  )}

                  {/* Additional Products */}
                  {editedProducts.length > 0 && (
                    <>
                      <div className="pt-3">
                        <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          Additional Products
                        </p>
                        {editedProducts.map((product, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between py-3 px-4 bg-white rounded-lg mb-2"
                          >
                            <span className="text-sm text-gray-600">
                              {product.name} × {product.quantity}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              $
                              {(product.unit_price * product.quantity).toFixed(
                                2
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <div className="h-px bg-gray-200 my-4"></div>

                  {/* Subtotal (shown when discount is applied) */}
                  {booking?.discount_amount && booking.discount_amount > 0 && (
                    <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-sm font-medium text-gray-700">
                        Subtotal
                      </span>
                      <span className="text-sm font-medium text-gray-900">
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
                                : (booking?.tour_rate || 0) *
                                  (booking?.slots || 0);

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
                  {booking?.discount_amount && booking.discount_amount > 0 && (
                    <>
                      <div className="flex items-center justify-between py-3 px-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-green-700 font-medium">
                            Discount
                          </span>
                          {booking?.promo_code && (
                            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                              {booking.promo_code}
                            </span>
                          )}
                          {booking?.total_price_before_discount &&
                            booking.total_price_before_discount > 0 && (
                              <span className="text-xs text-green-600">
                                (
                                {(
                                  (booking.discount_amount /
                                    booking.total_price_before_discount) *
                                  100
                                ).toFixed(0)}
                                % off)
                              </span>
                            )}
                        </div>
                        <span className="text-sm font-bold text-green-700">
                          -${booking.discount_amount.toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}

                  {/* Total Amount */}
                  <div className="flex items-center justify-between py-4 px-4 bg-white rounded-lg">
                    <span className="text-sm font-bold text-strong">
                      Total Amount
                    </span>
                    <span className="text-base font-bold text-strong">
                      ${booking?.amount_paid.toFixed(2)}
                      {/* {(() => {
                        // Use total_price from database if available
                        if (
                          booking?.total_price !== undefined &&
                          booking?.total_price !== null
                        ) {
                          return booking.total_price.toFixed(2);
                        }

                        // Calculate total from custom slots
                        const slotsTotal =
                          customSlotTypes && customSlotTypes.length > 0
                            ? slotDetails.reduce((sum, slot) => {
                                const slotType = customSlotTypes.find(
                                  (t) => t.name === slot.type
                                );
                                return sum + (slotType?.price || 0);
                              }, 0)
                            : (booking?.tour_rate || 0) * (booking?.slots || 0);

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
                </div>
              </div>
            </div>
          </div>

          {/* Actions Card */}
          <div className="bg-white rounded-xl shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1),0_4px_8px_-4px_rgba(0,0,0,0.1)] border border-gray-300">
            {/* Header Section */}
            <div className="p-8 border-b border-gray-200">
              <h2 className="text-xl sm:text-2xl font-bold text-strong flex items-center gap-2">
                <List className="w-5 h-5" />
                Actions
              </h2>
              <p className="text-sm text-weak mt-1">
                Manage booking details and actions
              </p>
            </div>

            {/* Content Section */}
            <div className="p-8 space-y-6">
              {/* Booking Management Actions */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full h-12 border-gray-200 hover:border-blue-200 hover:bg-blue-50/50 text-gray-700 transition-all duration-200 flex items-center justify-start gap-3 px-4"
                  onClick={() => setIsPersonalInfoModalOpen(true)}
                  disabled={isLoading}
                >
                  <UserCog className="w-5 h-5 text-blue-600" />
                  <span>Edit Customer Information</span>
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-12 border-gray-200 hover:border-purple-200 hover:bg-purple-50/50 text-gray-700 transition-all duration-200 flex items-center justify-start gap-3 px-4"
                  onClick={() => setIsRescheduleModalOpen(true)}
                  disabled={
                    isLoading ||
                    booking?.payment_status === "refunding" ||
                    booking?.payment_status === "refunded" ||
                    booking?.payment_status === "partially_refunded"
                  }
                >
                  <RefreshCw className="w-5 h-5 text-purple-600" />
                  <span>Reschedule Booking</span>
                </Button>

                {/* {(!customSlotTypes || customSlotTypes.length === 0) && (
                
                )} */}

                {(customSlotTypes && customSlotTypes.length > 0) ||
                (customSlotFields && customSlotFields.length > 0) ? (
                  <Button
                    variant="outline"
                    className="w-full h-12 border-gray-200 hover:border-green-200 hover:bg-green-50/50 text-gray-700 transition-all duration-200 flex items-center justify-start gap-3 px-4"
                    onClick={() => {
                      setIsSlotDetailsModalOpen(true);
                    }}
                    disabled={
                      isLoading || booking?.payment_status !== "pending"
                    }
                  >
                    <Edit2 className="w-5 h-5 text-green-600" />
                    <span>Edit Slot Details</span>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full h-12 border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/50 text-gray-700 transition-all duration-200 flex items-center justify-start gap-3 px-4"
                    onClick={() => setIsUpdateSlotsModalOpen(true)}
                    disabled={
                      isLoading || booking?.payment_status !== "pending"
                    }
                  >
                    <Users className="w-5 h-5 text-indigo-600" />
                    <span>Update Number of Slots</span>
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="w-full h-12 border-gray-200 hover:border-amber-200 hover:bg-amber-50/50 text-gray-700 transition-all duration-200 flex items-center justify-start gap-3 px-4"
                  onClick={() => {
                    setEditedProducts(editedProducts);
                    setIsProductsModalOpen(true);
                  }}
                  disabled={isLoading || booking?.payment_status !== "pending"}
                >
                  <Package className="w-5 h-5 text-amber-600" />
                  <span>Edit Booked Products</span>
                </Button>
              </div>

              {/* Payment Actions */}
              {/* {booking?.payment_status === "pending" && (
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full h-12 border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/50 text-gray-700 transition-all duration-200 flex items-center justify-start gap-3 px-4"
                    onClick={() => handlePaymentLinkUpdateWrapper(false, null, null, null)}
                    disabled={isLoading}
                  >
                    <Link className="w-5 h-5 text-indigo-600" />
                    <span>Generate Payment Link</span>
                  </Button>
                </div>
              )} */}

              {/* Cancellation Action */}
              {booking?.payment_status === "paid" && (
                <div className="pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    className="w-full h-12 text-red-600 border-red-200 hover:border-red-300 hover:bg-red-50/50 transition-all duration-200 flex items-center justify-start gap-3 px-4"
                    onClick={handleCancelBooking}
                    disabled={
                      isLoading || booking?.booking_status === "cancelled"
                    }
                  >
                    {isLoading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <XCircle className="w-5 h-5" />
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
