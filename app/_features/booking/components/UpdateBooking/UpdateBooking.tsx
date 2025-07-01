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
          {((customSlotTypes && customSlotTypes.length > 0) ||
            (customSlotFields && customSlotFields.length > 0)) && (
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

          {/* Additional Bookings Card */}
          <div className="bg-white rounded-xl shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1),0_4px_8px_-4px_rgba(0,0,0,0.1)] border border-gray-300">
            {/* Header Section */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-strong flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Additional Bookings
                  </h2>
                  <p className="text-sm text-weak mt-1">
                    {additionalBookings.length > 0
                      ? `${additionalBookings.length} additional booking${additionalBookings.length > 1 ? "s" : ""}`
                      : "No additional bookings yet"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshAdditionalBookings}
                    disabled={isLoadingAdditional}
                    className="h-8 px-3"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${isLoadingAdditional ? "animate-spin" : ""}`}
                    />
                  </Button>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6">
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
                                    className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                                  >
                                    {/* Product Image */}
                                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
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
                                        <Package className="w-5 h-5 text-gray-400" />
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
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Booking
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Payment & Actions */}
        <div className="space-y-8">
          {/* Payment Information Card */}
          <div className="bg-white rounded-xl shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1),0_4px_8px_-4px_rgba(0,0,0,0.1)] border border-gray-300">
            {/* Header Section */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-strong flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Details
              </h2>
              <p className="text-sm text-weak mt-1">
                Payment status and transaction information
              </p>
            </div>

            {/* Content Section */}
            <div className="p-6 space-y-4">
              {/* Payment Status and Amount */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <StatusBadge
                    status={
                      (booking?.payment_status?.toLowerCase() as any) ||
                      "pending"
                    }
                    type="payment"
                  />
                  <div>
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <p className="text-xs text-gray-500">
                      {booking?.payment_method || "Credit Card"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-strong">
                    ${booking?.amount_paid.toFixed(2)}
                  </p>
                  {booking?.discount_amount && booking.discount_amount > 0 && (
                    <p className="text-xs text-gray-500 line-through">
                      ${booking?.total_price_before_discount?.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>

              {/* Transaction ID */}
              {booking?.stripe_payment_id && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Transaction ID
                    </span>
                  </div>
                  <p className="text-xs font-mono text-gray-700 break-all">
                    {booking.stripe_payment_id}
                  </p>
                </div>
              )}

              {/* Payment Link */}
              {booking?.payment_status.toLowerCase() !== "paid" && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Link className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Payment Link
                      </span>
                    </div>
                    {!booking?.payment_link && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handlePaymentLinkUpdateWrapper(
                            false,
                            null,
                            null,
                            null
                          )
                        }
                        disabled={isLoading}
                        className="h-8"
                      >
                        {isLoading ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Link className="w-4 h-4 mr-2" />
                        )}
                        Create
                      </Button>
                    )}
                  </div>

                  {booking?.payment_link ? (
                    <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                      <p className="text-sm text-gray-900 truncate flex-1">
                        {booking.payment_link}
                      </p>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            navigator.clipboard.writeText(booking.payment_link);
                            toast.success("Payment link copied");
                          }}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            window.open(booking.payment_link, "_blank")
                          }
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">
                      No payment link available. Create one to share with the
                      customer.
                    </p>
                  )}
                </div>
              )}

              {/* Pricing Summary */}
              <div className="space-y-2">
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-gray-600">
                    {!customSlotTypes || customSlotTypes.length === 0
                      ? `Base Rate × ${booking?.slots} people`
                      : "Tour Slots"}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    $
                    {(() => {
                      if (!customSlotTypes || customSlotTypes.length === 0) {
                        return (
                          (booking?.tour_rate || 0) * (booking?.slots || 0)
                        ).toFixed(2);
                      }
                      return slotDetails
                        .reduce((sum, slot) => {
                          const slotType = customSlotTypes.find(
                            (type) => type.name === slot.type
                          );
                          return sum + (slotType?.price || 0);
                        }, 0)
                        .toFixed(2);
                    })()}
                  </span>
                </div>
                {editedProducts.length > 0 && (
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm text-gray-600">Products</span>
                    <span className="text-sm font-medium text-gray-900">
                      $
                      {editedProducts
                        .reduce(
                          (sum, product) =>
                            sum + product.unit_price * product.quantity,
                          0
                        )
                        .toFixed(2)}
                    </span>
                  </div>
                )}
                {booking?.discount_amount && booking.discount_amount > 0 && (
                  <div className="flex items-center justify-between py-1 text-green-600">
                    <span className="text-sm">
                      Discount{" "}
                      {booking?.promo_code && `(${booking.promo_code})`}
                    </span>
                    <span className="text-sm font-medium">
                      -${booking.discount_amount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-strong">
                      Total
                    </span>
                    <span className="text-lg font-bold text-strong">
                      ${booking?.amount_paid.toFixed(2)}
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
