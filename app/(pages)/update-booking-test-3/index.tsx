"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  Users,
  CreditCard,
  Edit,
  Plus,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Package,
  User,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  CalendarDays,
  FileText,
  Settings,
  RefreshCw,
  Tag,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

// API imports
import { getOneBooking } from "@/app/_features/booking/api/get-booking/getOneBooking";
import { getAllProducts } from "@/app/_features/products/api/getAllProducts";
import { getAllTours } from "@/app/_features/tours/api/getAllTours";
import { updateCustomerInfo } from "@/app/_features/booking/api/updateCustomerInfo";
import { rescheduleBooking } from "@/app/_features/booking/api/update-booking/RescheduleBooking";
import { updateBookingProducts } from "@/app/_features/booking/api/update-booking/UpdateBookingProducts";
import { updateRegularSlots } from "@/app/_features/booking/api/update-booking/UpdateRegularSlots";
import {
  getAdditionalBookings,
  BookingAdditional,
  getAdditionalBookingsWithPayments,
  AdditionalWithPayment,
} from "@/app/_features/booking/api/get-booking/getAdditionalBookings";

import { cancelBooking } from "@/app/_features/booking/api/update-booking/cancelBooking";

// Types
import { BookingTable } from "@/app/_features/booking/types/booking-types";
import { Product } from "@/app/_features/products/types/product-types";
import { Tour } from "@/app/_features/tours/tour-types";
import { formatTime } from "@/app/_lib/utils/formatTime";

const UpdateBookingPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // State for real data
  const [booking, setBooking] = useState<BookingTable | null>(null);
  const [tour, setTour] = useState<Tour | null>(null);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get("token");

  // Form states
  const [customerInfo, setCustomerInfo] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
  });

  const [bookingDetails, setBookingDetails] = useState({
    date: "",
    time: "",
    slots: 0,
  });

  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [productQuantities, setProductQuantities] = useState<
    Record<string, number>
  >({});

  // Additional bookings state
  const [additionalBookings, setAdditionalBookings] = useState<
    AdditionalWithPayment[]
  >([]);
  const [isLoadingAdditional, setIsLoadingAdditional] = useState(false);

  // Fetch booking data on component mount
  useEffect(() => {
    const fetchBookingData = async () => {
      if (!token) {
        setError("No booking token provided");
        setIsFetching(false);
        return;
      }

      try {
        setIsFetching(true);
        setError(null);

        // Fetch booking data
        const bookingData = await getOneBooking(null, token);
        if (!bookingData) {
          setError("Booking not found");
          return;
        }

        setBooking(bookingData);

        // Parse customer name
        const nameParts = bookingData.full_name?.split(" ") || [];
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        // Set form states
        setCustomerInfo({
          first_name: firstName,
          last_name: lastName,
          email: bookingData.email || "",
          phone_number: bookingData.phone_number || "",
        });

        setBookingDetails({
          date: bookingData.booking_date || "",
          time: bookingData.selected_time || "",
          slots: bookingData.slots || 0,
        });

        // Set selected products
        if (
          bookingData.booked_products &&
          bookingData.booked_products.length > 0
        ) {
          setSelectedProducts(bookingData.booked_products.map((p) => p.id));
          const quantities = bookingData.booked_products.reduce(
            (acc, product) => ({
              ...acc,
              [product.id]: product.quantity,
            }),
            {}
          );
          setProductQuantities(quantities);
        }

        // Fetch tour data
        if (bookingData.tour_id) {
          try {
            const tours = await getAllTours();
            const tourData = tours.find((t) => t.id === bookingData.tour_id);
            if (tourData) {
              setTour(tourData);
            }
          } catch (tourError) {
            console.error("Error fetching tour:", tourError);
          }
        }

        // Fetch available products
        try {
          const products = await getAllProducts();
          setAvailableProducts(products);
        } catch (productError) {
          console.error("Error fetching products:", productError);
        }
      } catch (err) {
        console.error("Error fetching booking data:", err);
        setError("Failed to load booking data");
      } finally {
        setIsFetching(false);
      }
    };

    fetchBookingData();
  }, [token]);

  // Fetch additional bookings when Additional tab is clicked
  const handleAdditionalTabClick = async () => {
    if (!booking || additionalBookings.length > 0) return; // Only fetch if not already loaded

    try {
      setIsLoadingAdditional(true);
      const additionalData = await getAdditionalBookingsWithPayments(
        booking.booking_id
      );

      // Filter out duplicates based on additional_id
      const uniqueAdditionalBookings = additionalData.filter(
        (booking, index, self) =>
          index ===
          self.findIndex((b) => b.additional_id === booking.additional_id)
      );

      console.log("Original additional bookings:", additionalData);
      console.log(
        "Filtered unique additional bookings:",
        uniqueAdditionalBookings
      );

      // Additional debugging to check for duplicate keys
      const keys = uniqueAdditionalBookings.map(
        (booking, index) =>
          `additional-${booking.additional_id}-${booking.additional_created_at}-${index}`
      );
      console.log("Generated keys:", keys);
      const duplicateKeys = keys.filter(
        (key, index) => keys.indexOf(key) !== index
      );
      if (duplicateKeys.length > 0) {
        console.warn("Duplicate keys found:", duplicateKeys);
      }

      setAdditionalBookings(uniqueAdditionalBookings);
    } catch (additionalError) {
      console.error("Error fetching additional bookings:", additionalError);
      toast.error("Failed to load additional bookings");
    } finally {
      setIsLoadingAdditional(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!booking) return;

    setIsLoading(true);
    try {
      // Update customer information
      await updateCustomerInfo({
        booking_id: booking.booking_id,
        first_name: customerInfo.first_name,
        last_name: customerInfo.last_name,
        email: customerInfo.email,
        phone_number: customerInfo.phone_number,
      });

      // Update booking date/time if changed
      if (
        bookingDetails.date !== booking.booking_date ||
        bookingDetails.time !== booking.selected_time
      ) {
        await rescheduleBooking({
          booking_id: booking.booking_id,
          new_booking_date: bookingDetails.date,
          new_selected_time: bookingDetails.time,
        });
      }

      // Update slots if changed
      if (bookingDetails.slots !== booking.slots) {
        await updateRegularSlots(booking.booking_id, bookingDetails.slots);
      }

      // Update products if changed
      const currentProductIds = booking.booked_products?.map((p) => p.id) || [];
      if (
        JSON.stringify(selectedProducts.sort()) !==
        JSON.stringify(currentProductIds.sort())
      ) {
        const productsData = selectedProducts.map((productId) => {
          const product = availableProducts.find((p) => p.id === productId);
          const quantity = productQuantities[productId] || 1;
          return {
            name: product?.name || "",
            product_id: productId,
            quantity: quantity,
            unit_price: product?.price || 0,
          };
        });
        await updateBookingProducts(booking.booking_id, productsData);
      }

      toast.success("Booking updated successfully!");

      // Refresh booking data
      if (token) {
        const updatedBooking = await getOneBooking(null, token);
        if (updatedBooking) {
          setBooking(updatedBooking);
        }
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error("Failed to update booking");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;

    if (
      !confirm(
        "Are you sure you want to cancel this booking? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsLoading(true);
    // try {
    //   await cancelBooking(booking.booking_id);
    //   toast.success("Booking cancelled successfully");
    //   router.push("/dashboard/bookings");
    // } catch (error) {
    //   console.error("Error cancelling booking:", error);
    //   toast.error("Failed to cancel booking");
    // } finally {
    //   setIsLoading(false);
    // }
  };

  const handleAddAdditionalBooking = () => {
    if (token) {
      window.location.href = `/manage-additional-booking?manage_token=${token}`;
    }
  };

  const handleRefreshAdditionalBookings = async () => {
    if (!booking) return;

    try {
      setIsLoadingAdditional(true);
      const additionalData = await getAdditionalBookingsWithPayments(
        booking.booking_id
      );

      // Filter out duplicates based on additional_id
      const uniqueAdditionalBookings = additionalData.filter(
        (booking, index, self) =>
          index ===
          self.findIndex((b) => b.additional_id === booking.additional_id)
      );

      setAdditionalBookings(uniqueAdditionalBookings);
      toast.success("Additional bookings refreshed");
    } catch (error) {
      console.error("Error refreshing additional bookings:", error);
      toast.error("Failed to refresh additional bookings");
    } finally {
      setIsLoadingAdditional(false);
    }
  };

  const calculateTotal = () => {
    if (!booking) return 0;

    let total = booking.tour_rate * bookingDetails.slots;

    selectedProducts.forEach((productId) => {
      const product = availableProducts.find((p) => p.id === productId);
      if (product) {
        const quantity = productQuantities[productId] || 1;
        total += product.price * quantity;
      }
    });

    return total - (booking.discount_amount || 0);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
      case "pending_payment":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-fill flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-brand" />
          <p className="text-weak">Loading booking data...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-fill flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-600" />
          <h2 className="text-xl font-semibold text-text mb-2">
            Booking Not Found
          </h2>
          <p className="text-weak mb-4">
            {error || "The booking you're looking for doesn't exist."}
          </p>
          <Button onClick={() => router.push("/dashboard/bookings")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Bookings
          </Button>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-fill">
      {/* Header */}
      <div className="bg-background border-b border-stroke-weak">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Header */}
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div>
                  <h1 className="text-2xl font-bold text-text">
                    Booking Details
                  </h1>
                  <p className="text-sm text-weak mt-1">
                    Reference:{" "}
                    <span className="font-mono font-medium text-text">
                      {booking.reference_number}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-weak">Status:</span>
                  <Badge
                    className={`${getStatusColor(booking.booking_status)} font-medium`}
                  >
                    {booking.booking_status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs
              value={activeTab}
              onValueChange={(value) => {
                setActiveTab(value);
                if (value === "additional") {
                  handleAdditionalTabClick();
                }
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Slot Details</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="additional">
                  Additional Bookings
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Insert Customer Details Card here */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-text" />
                      <span className="text-text">Customer Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row md:items-center md:space-x-8 space-y-2 md:space-y-0 py-2">
                      {/* Customer Name */}
                      <div className="flex-1 flex items-center space-x-3 min-w-0">
                        <div className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-brand" />
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-semibold text-text truncate">
                            {booking.full_name}
                          </p>
                          <p className="text-xs text-weak">Customer Name</p>
                        </div>
                      </div>
                      {/* Email */}
                      <div className="flex-1 flex items-center space-x-3 min-w-0">
                        <div className="w-8 h-8 bg-stroke-weak rounded-full flex items-center justify-center">
                          <Mail className="w-4 h-4 text-text" />
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-medium text-text truncate">
                            {booking.email}
                          </p>
                          <p className="text-xs text-weak">Email</p>
                        </div>
                      </div>
                      {/* Phone */}
                      <div className="flex-1 flex items-center space-x-3 min-w-0">
                        <div className="w-8 h-8 bg-stroke-weak rounded-full flex items-center justify-center">
                          <Phone className="w-4 h-4 text-text" />
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-medium text-text truncate">
                            {booking.phone_number}
                          </p>
                          <p className="text-xs text-weak">Phone</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Original Booking Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CalendarDays className="w-5 h-5 text-text" />
                      <span className="text-text">Primary Booking</span>
                      {/* <Badge variant="default" className="font-bold">
                        Main
                      </Badge> */}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Tour Information */}
                    {tour && (
                      <div className="border border-stroke-weak rounded-lg p-4 bg-neutral">
                        <div className="flex items-start space-x-4">
                          {/* Tour Image */}
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-stroke-weak flex-shrink-0">
                            {tour.images &&
                              (() => {
                                try {
                                  const tourImages = JSON.parse(tour.images);
                                  const featuredImage = tourImages.find(
                                    (img: any) =>
                                      img.isFeature || img.isFeatured
                                  );
                                  return featuredImage ? (
                                    <img
                                      src={featuredImage.url}
                                      alt={tour.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : null;
                                } catch (error) {
                                  console.error(
                                    "Error parsing tour images:",
                                    error
                                  );
                                  return null;
                                }
                              })()}
                            {!tour.images && (
                              <div className="w-full h-full bg-stroke-weak flex items-center justify-center">
                                <CalendarDays className="w-8 h-8 text-weak" />
                              </div>
                            )}
                          </div>

                          {/* Tour Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-text mb-1">
                              {tour.title}
                            </h3>
                            {tour.description && (
                              <p className="text-sm text-weak line-clamp-2 mb-2">
                                {tour.description}
                              </p>
                            )}
                            <div className="flex items-center space-x-4 text-xs text-weak">
                              {tour.duration && (
                                <span className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{tour.duration} hours</span>
                                </span>
                              )}
                              {tour.meeting_point_address && (
                                <span className="flex items-center space-x-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{tour.meeting_point_address}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3 p-3 bg-neutral border border-stroke-weak rounded-lg">
                        <Calendar className="w-5 h-5 text-text" />
                        <div>
                          <p className="text-sm font-semibold text-text">
                            {formatDate(booking?.booking_date)}
                          </p>
                          <p className="text-xs text-weak">Selected Date</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-neutral border border-stroke-weak rounded-lg">
                        <Clock className="w-5 h-5 text-text" />
                        <div>
                          <p className="text-sm font-semibold text-text">
                            {formatTime(booking?.selected_time || "")}
                          </p>
                          <p className="text-xs text-weak">Selected Time</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-neutral border border-stroke-weak rounded-lg">
                        <Users className="w-5 h-5 text-text" />
                        <div>
                          <p className="text-sm font-semibold text-text">
                            {booking.slots} people
                          </p>
                          <p className="text-xs text-weak">Guests</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-neutral border border-stroke-weak rounded-lg">
                        <DollarSign className="w-5 h-5 text-text" />
                        <div>
                          <p className="text-sm font-semibold text-text">
                            ${booking.amount_paid}
                          </p>
                          <p className="text-xs text-weak">Amount</p>
                        </div>
                      </div>
                    </div>

                    {booking.booked_products &&
                      booking.booked_products.length > 0 && (
                        <div className="mt-5">
                          <h4 className="font-medium text-text mb-2">
                            <span>Primary Products</span>
                          </h4>
                          <div className="space-y-3">
                            {booking.booked_products.map((product, index) => (
                              <div
                                key={`original-product-overview-${product.id || index}`}
                                className="flex items-center justify-between p-3 bg-neutral border border-stroke-weak rounded-lg"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-stroke-weak rounded-lg flex items-center justify-center overflow-hidden">
                                    {product.image_url ? (
                                      <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <Package className="w-5 h-5 text-text" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-text">
                                      {product.name}
                                    </p>
                                    <p className="text-xs text-weak">
                                      Qty: {product.quantity}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-sm font-semibold text-text">
                                  ${product.unit_price}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </CardContent>
                </Card>

                {/* Additional Bookings Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Plus className="w-5 h-5 text-text" />
                      <span className="text-text">Additional Bookings</span>
                      <Badge className="bg-brand text-white" variant="default">
                        {additionalBookings.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {additionalBookings.length > 0 ? (
                      <div className="space-y-4">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {(() => {
                            const totalAddedSlots = additionalBookings.reduce(
                              (sum, booking) =>
                                sum + (booking.added_slots || 0),
                              0
                            );
                            const totalAddedProducts =
                              additionalBookings.reduce(
                                (sum, booking) =>
                                  sum + (booking.added_products?.length || 0),
                                0
                              );
                            const totalAdditionalAmount =
                              additionalBookings.reduce(
                                (sum, booking) =>
                                  sum + (booking.amount_paid || 0),
                                0
                              );

                            return (
                              <>
                                <div className="flex items-center space-x-3 p-3 bg-neutral border border-stroke-weak rounded-lg">
                                  <Users className="w-5 h-5 text-text" />
                                  <div>
                                    <p className="text-sm font-semibold text-text">
                                      +{totalAddedSlots} people
                                    </p>
                                    <p className="text-xs text-weak">
                                      Total Added Guests
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-neutral border border-stroke-weak rounded-lg">
                                  <Package className="w-5 h-5 text-text" />
                                  <div>
                                    <p className="text-sm font-semibold text-text">
                                      {totalAddedProducts} products
                                    </p>
                                    <p className="text-xs text-weak">
                                      Total Added Products
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-neutral border border-stroke-weak rounded-lg">
                                  <DollarSign className="w-5 h-5 text-text" />
                                  <div>
                                    <p className="text-sm font-semibold text-text">
                                      ${totalAdditionalAmount.toFixed(2)}
                                    </p>
                                    <p className="text-xs text-weak">
                                      Total Additional Amount
                                    </p>
                                  </div>
                                </div>
                              </>
                            );
                          })()}
                        </div>

                        {/* Quick List of Additional Bookings */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-text mb-2">
                            Recent Additional Bookings
                          </h4>
                          {additionalBookings
                            .slice(0, 3)
                            .map((additional, index) => (
                              <div
                                key={`additional-summary-${index}`}
                                className="flex items-center justify-between p-3 bg-neutral border border-stroke-weak rounded-lg"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-stroke-weak rounded-lg flex items-center justify-center">
                                    <Plus className="w-5 h-5 text-text" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-text">
                                      Additional #{index + 1}
                                    </p>
                                    <p className="text-xs text-weak">
                                      {new Date(
                                        additional.additional_created_at
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-text">
                                    $
                                    {additional.amount_paid?.toFixed(2) ||
                                      "0.00"}
                                  </p>
                                  <p className="text-xs text-weak">
                                    {additional.status || "Pending"}
                                  </p>
                                </div>
                              </div>
                            ))}
                          {additionalBookings.length > 3 && (
                            <div className="text-center pt-2">
                              <p className="text-sm text-weak">
                                +{additionalBookings.length - 3} more additional
                                bookings
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => setActiveTab("additional")}
                              >
                                View All Additional Bookings
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Package className="w-12 h-12 mx-auto mb-3 text-weak" />
                        <p className="text-weak font-medium">
                          No additional bookings
                        </p>
                        <p className="text-sm text-weak mt-1">
                          You haven't made any additional bookings yet.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => setActiveTab("additional")}
                        >
                          Add Additional Booking
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Edit className="w-5 h-5" />
                      <span>Edit Booking Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Booking Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={bookingDetails.date}
                          onChange={(e) =>
                            setBookingDetails((prev) => ({
                              ...prev,
                              date: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time">Time</Label>
                        <Select
                          value={bookingDetails.time}
                          onValueChange={(value) =>
                            setBookingDetails((prev) => ({
                              ...prev,
                              time: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="09:00">09:00 AM</SelectItem>
                            <SelectItem value="10:00">10:00 AM</SelectItem>
                            <SelectItem value="11:00">11:00 AM</SelectItem>
                            <SelectItem value="14:00">02:00 PM</SelectItem>
                            <SelectItem value="15:00">03:00 PM</SelectItem>
                            <SelectItem value="16:00">04:00 PM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="slots">Number of People</Label>
                        <Input
                          id="slots"
                          type="number"
                          min="1"
                          max="20"
                          value={bookingDetails.slots}
                          onChange={(e) =>
                            setBookingDetails((prev) => ({
                              ...prev,
                              slots: parseInt(e.target.value) || 0,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>Edit Customer Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
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
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={customerInfo.last_name}
                          onChange={(e) =>
                            setCustomerInfo((prev) => ({
                              ...prev,
                              last_name: e.target.value,
                            }))
                          }
                        />
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
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
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
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Products Tab */}
              <TabsContent value="products" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Package className="w-5 h-5" />
                      <span>Manage Products</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {availableProducts.map((product) => (
                        <div
                          key={product.id}
                          className="border rounded-lg p-4 space-y-3"
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              id={product.id}
                              checked={selectedProducts.includes(product.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedProducts((prev) => [
                                    ...prev,
                                    product.id,
                                  ]);
                                  setProductQuantities((prev) => ({
                                    ...prev,
                                    [product.id]: 1,
                                  }));
                                } else {
                                  setSelectedProducts((prev) =>
                                    prev.filter((id) => id !== product.id)
                                  );
                                  setProductQuantities((prev) => {
                                    const newQuantities = { ...prev };
                                    delete newQuantities[product.id];
                                    return newQuantities;
                                  });
                                }
                              }}
                              className="rounded"
                            />
                            <Label
                              htmlFor={product.id}
                              className="font-medium cursor-pointer"
                            >
                              {product.name}
                            </Label>
                          </div>
                          <p className="text-sm text-gray-600">
                            {product.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-green-600">
                              ${product.price}
                            </span>
                            {selectedProducts.includes(product.id) && (
                              <div className="flex items-center space-x-2">
                                <Label
                                  htmlFor={`qty-${product.id}`}
                                  className="text-sm"
                                >
                                  Qty:
                                </Label>
                                <Input
                                  id={`qty-${product.id}`}
                                  type="number"
                                  min="1"
                                  max="10"
                                  value={productQuantities[product.id] || 1}
                                  onChange={(e) =>
                                    setProductQuantities((prev) => ({
                                      ...prev,
                                      [product.id]:
                                        parseInt(e.target.value) || 1,
                                    }))
                                  }
                                  className="w-16"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Additional Booking Tab */}
              <TabsContent value="additional" className="space-y-6">
                {/* Existing Additional Bookings */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <Plus className="w-5 h-5 text-text" />
                        <span className="text-text">Additional Bookings</span>
                        {additionalBookings.length > 0 && (
                          <Badge
                            className="bg-brand text-white"
                            variant="default"
                          >
                            {additionalBookings.length}
                          </Badge>
                        )}
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefreshAdditionalBookings}
                        disabled={isLoadingAdditional}
                      >
                        <RefreshCw
                          className={`w-4 h-4 mr-2 ${isLoadingAdditional ? "animate-spin" : ""}`}
                        />
                        Refresh
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingAdditional ? (
                      <div className="text-center py-8">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-weak" />
                        <p className="text-weak">
                          Loading additional bookings...
                        </p>
                      </div>
                    ) : additionalBookings.length > 0 ? (
                      <div className="space-y-6">
                        {additionalBookings.map((additional, index) => (
                          <Card
                            key={`additional-booking-${index}`}
                            className="border border-stroke-weak"
                          >
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-12 h-12 bg-stroke-weak rounded-lg flex items-center justify-center">
                                    <Plus className="w-6 h-6 text-text" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-text">
                                      Additional Booking #{index + 1}
                                    </h4>
                                    <p className="text-sm text-weak">
                                      Created:{" "}
                                      {new Date(
                                        additional.additional_created_at
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge className="bg-stroke-weak text-text">
                                    Additional
                                  </Badge>
                                  {additional.status && (
                                    <Badge
                                      className={getStatusColor(
                                        additional.status
                                      )}
                                    >
                                      {additional.status}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {additional.added_slots > 0 && (
                                  <div className="flex items-center space-x-3 p-3 bg-neutral border border-stroke-weak rounded-lg">
                                    <Users className="w-5 h-5 text-text" />
                                    <div>
                                      <p className="text-sm font-semibold text-text">
                                        +{additional.added_slots} people
                                      </p>
                                      <p className="text-xs text-weak">
                                        Added slots
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {additional.added_products &&
                                  additional.added_products.length > 0 && (
                                    <div className="flex items-center space-x-3 p-3 bg-neutral border border-stroke-weak rounded-lg">
                                      <Package className="w-5 h-5 text-text" />
                                      <div>
                                        <p className="text-sm font-semibold text-text">
                                          {additional.added_products.length}{" "}
                                          products
                                        </p>
                                        <p className="text-xs text-weak">
                                          Added products
                                        </p>
                                      </div>
                                    </div>
                                  )}
                              </div>

                              {/* Payment Information */}
                              {additional.payment_id && (
                                <div className="space-y-4">
                                  <h5 className="font-medium text-text flex items-center space-x-2">
                                    <CreditCard className="w-4 h-4" />
                                    <span>Payment Information</span>
                                  </h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {additional.amount_paid && (
                                      <div className="flex items-center space-x-3 p-3 bg-neutral border border-stroke-weak rounded-lg">
                                        <DollarSign className="w-5 h-5 text-text" />
                                        <div>
                                          <p className="text-sm font-semibold text-text">
                                            ${additional.amount_paid.toFixed(2)}
                                          </p>
                                          <p className="text-xs text-weak">
                                            Amount Paid
                                          </p>
                                        </div>
                                      </div>
                                    )}

                                    {additional.payment_method && (
                                      <div className="flex items-center space-x-3 p-3 bg-neutral border border-stroke-weak rounded-lg">
                                        <CreditCard className="w-5 h-5 text-text" />
                                        <div>
                                          <p className="text-sm font-semibold text-text capitalize">
                                            {additional.payment_method}
                                          </p>
                                          <p className="text-xs text-weak">
                                            Payment Method
                                          </p>
                                        </div>
                                      </div>
                                    )}

                                    {additional.paid_at && (
                                      <div className="flex items-center space-x-3 p-3 bg-neutral border border-stroke-weak rounded-lg">
                                        <Calendar className="w-5 h-5 text-text" />
                                        <div>
                                          <p className="text-sm font-semibold text-text">
                                            {new Date(
                                              additional.paid_at
                                            ).toLocaleDateString()}
                                          </p>
                                          <p className="text-xs text-weak">
                                            Paid Date
                                          </p>
                                        </div>
                                      </div>
                                    )}

                                    {additional.payment_reference && (
                                      <div className="flex items-center space-x-3 p-3 bg-neutral border border-stroke-weak rounded-lg">
                                        <FileText className="w-5 h-5 text-text" />
                                        <div>
                                          <p className="text-sm font-semibold text-text font-mono">
                                            {additional.payment_reference.slice(
                                              -8
                                            )}
                                          </p>
                                          <p className="text-xs text-weak">
                                            Reference
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Refund Information */}
                                  {additional.refunded_amount &&
                                    additional.refunded_amount > 0 && (
                                      <div className="p-3 bg-red-50 rounded-lg">
                                        <h6 className="font-medium text-red-900 mb-2">
                                          Refund Information
                                        </h6>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div className="flex items-center space-x-3 p-3 bg-red-100 rounded-lg">
                                            <DollarSign className="w-5 h-5 text-red-600" />
                                            <div>
                                              <p className="text-sm font-semibold text-red-900">
                                                -$
                                                {additional.refunded_amount.toFixed(
                                                  2
                                                )}
                                              </p>
                                              <p className="text-xs text-red-600">
                                                Refunded Amount
                                              </p>
                                            </div>
                                          </div>
                                          {additional.refunded_at && (
                                            <div className="flex items-center space-x-3 p-3 bg-red-100 rounded-lg">
                                              <Calendar className="w-5 h-5 text-red-600" />
                                              <div>
                                                <p className="text-sm font-semibold text-red-900">
                                                  {new Date(
                                                    additional.refunded_at
                                                  ).toLocaleDateString()}
                                                </p>
                                                <p className="text-xs text-red-600">
                                                  Refunded Date
                                                </p>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                  {/* Discount Information */}
                                  {additional.discount_amount &&
                                    additional.discount_amount > 0 && (
                                      <div className="p-3 bg-green-50 rounded-lg">
                                        <div className="flex items-center space-x-3 p-3 bg-green-100 rounded-lg">
                                          <Tag className="w-5 h-5 text-green-600" />
                                          <div>
                                            <p className="text-sm font-semibold text-green-900">
                                              -$
                                              {additional.discount_amount.toFixed(
                                                2
                                              )}{" "}
                                              discount applied
                                            </p>
                                            <p className="text-xs text-green-600">
                                              Promotional Discount
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                </div>
                              )}

                              {additional.note && (
                                <div className="p-3 bg-yellow-50 rounded-lg">
                                  <p className="text-sm text-text">
                                    <strong>Note:</strong> {additional.note}
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Package className="w-12 h-12 mx-auto mb-4 text-weak" />
                        <p className="text-weak">
                          No additional bookings found
                        </p>
                        <p className="text-sm text-weak mt-1">
                          You haven't made any additional bookings yet.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Add New Additional Booking */}
                {/* <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Plus className="w-5 h-5 text-strong" />
                      <span className="text-strong">
                        Add New Additional Booking
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Add more people, products, or services to your existing
                        booking. This will create a separate additional booking
                        linked to your original reservation.
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="border-2 border-dashed border-stroke-strong hover:border-brand transition-colors">
                        <CardContent className="p-6 text-center space-y-4">
                          <div className="w-16 h-16 bg-stroke-weak rounded-full flex items-center justify-center mx-auto">
                            <Users className="w-8 h-8 text-weak" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-text">
                              Add More People
                            </h3>
                            <p className="text-sm text-weak">
                              Increase the number of guests for your tour
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-2 border-dashed border-stroke-strong hover:border-brand transition-colors">
                        <CardContent className="p-6 text-center space-y-4">
                          <div className="w-16 h-16 bg-stroke-weak rounded-full flex items-center justify-center mx-auto">
                            <Package className="w-8 h-8 text-weak" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-text">
                              Add Products
                            </h3>
                            <p className="text-sm text-weak">
                              Book additional equipment or services
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="text-center">
                      <Button
                        onClick={handleAddAdditionalBooking}
                        className="bg-brand hover:bg-strong text-white px-8 py-3"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Start Additional Booking
                      </Button>
                    </div>
                  </CardContent>
                </Card> */}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleSaveChanges}
                  disabled={isLoading}
                  className="w-full bg-brand hover:bg-strong"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <FileText className="w-4 h-4 mr-2" />
                      View Receipt
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Booking Receipt</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">
                          Reference: {booking.reference_number}
                        </p>
                        <p className="text-lg font-semibold">
                          {tour?.title || booking.tour_title}
                        </p>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Tour Cost:</span>
                          <span>
                            ${(booking.tour_rate * booking.slots).toFixed(2)}
                          </span>
                        </div>
                        {booking.booked_products?.map((product, index) => (
                          <div
                            key={`booked-product-${product.id || index}`}
                            className="flex justify-between text-sm"
                          >
                            <span>
                              {product.name} (x{product.quantity}):
                            </span>
                            <span>
                              $
                              {(product.unit_price * product.quantity).toFixed(
                                2
                              )}
                            </span>
                          </div>
                        ))}
                        {booking.discount_amount &&
                          booking.discount_amount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Discount:</span>
                              <span>
                                -${booking.discount_amount.toFixed(2)}
                              </span>
                            </div>
                          )}
                        <Separator />
                        <div className="flex justify-between font-semibold">
                          <span>Total:</span>
                          <span>${booking.amount_paid.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleCancelBooking}
                  disabled={isLoading}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Cancel Booking
                </Button>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold">
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Primary Booking */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-stroke-weak">
                    <div className="flex items-center space-x-3">
                      <CalendarDays className="w-5 h-5 text-brand" />
                      <span className="text-base font-semibold">
                        Primary Booking
                      </span>
                    </div>
                    <Badge className={getStatusColor(booking.booking_status)}>
                      {booking.booking_status}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {/* Tour Cost (slots) */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-weak">
                        Tour Cost ({bookingDetails.slots} people)
                      </span>
                      <span className="text-base font-medium">
                        ${(booking.tour_rate * bookingDetails.slots).toFixed(2)}
                      </span>
                    </div>

                    {/* Products */}
                    {selectedProducts.map((productId) => {
                      const product = availableProducts.find(
                        (p) => p.id === productId
                      );
                      const quantity = productQuantities[productId] || 1;
                      return product ? (
                        <div
                          key={`booked-product-${product.id || productId}`}
                          className="flex justify-between items-center"
                        >
                          <span className="text-sm text-weak">
                            {product.name} (x{quantity})
                          </span>
                          <span className="text-base font-medium">
                            ${(product.price * quantity).toFixed(2)}
                          </span>
                        </div>
                      ) : null;
                    })}

                    {/* Promo Code Discount */}
                    {booking.discount_amount && booking.discount_amount > 0 && (
                      <div className="flex justify-between items-center text-green-600">
                        <span className="text-sm">Promo Code Discount</span>
                        <span className="text-base font-medium">
                          -${booking.discount_amount.toFixed(2)}
                        </span>
                      </div>
                    )}

                    <Separator />

                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">
                        Primary Total
                      </span>
                      <span className="text-lg font-bold">
                        ${calculateTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Additional Bookings */}
                {additionalBookings.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-stroke-weak">
                        <div className="flex items-center space-x-3">
                          <Plus className="w-5 h-5 text-brand" />
                          <span className="text-base font-semibold">
                            Additional Bookings
                          </span>
                        </div>
                        <Badge className="bg-stroke-weak text-text text-xs">
                          {additionalBookings.length}
                        </Badge>
                      </div>

                      <div className="space-y-4">
                        {additionalBookings.map((additional, index) => (
                          <div
                            key={`additional-summary-${index}`}
                            className="p-4 bg-neutral/50 border border-stroke-weak rounded-lg space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-base font-medium">
                                Additional #{index + 1}
                              </span>
                              <Badge
                                className={getStatusColor(
                                  additional.status || "pending"
                                )}
                              >
                                {additional.status || "Pending"}
                              </Badge>
                            </div>

                            <div className="space-y-2">
                              {/* Added Slots */}
                              {additional.added_slots > 0 && (
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-weak">
                                    Added Slots ({additional.added_slots}{" "}
                                    people)
                                  </span>
                                  <span className="text-sm font-medium">
                                    $
                                    {(
                                      booking.tour_rate * additional.added_slots
                                    ).toFixed(2)}
                                  </span>
                                </div>
                              )}

                              {/* Added Products */}
                              {additional.added_products &&
                                additional.added_products.length > 0 &&
                                additional.added_products.map(
                                  (product: any, productIndex: number) => (
                                    <div
                                      key={`additional-product-${index}-${productIndex}`}
                                      className="flex justify-between items-center"
                                    >
                                      <span className="text-sm text-weak">
                                        {product.name} (x{product.quantity})
                                      </span>
                                      <span className="text-sm font-medium">
                                        $
                                        {(
                                          product.unit_price * product.quantity
                                        ).toFixed(2)}
                                      </span>
                                    </div>
                                  )
                                )}

                              {/* Refund Information */}
                              {additional.refunded_amount &&
                                additional.refunded_amount > 0 && (
                                  <div className="flex justify-between items-center text-red-600">
                                    <span className="text-sm">Refunded</span>
                                    <span className="text-sm font-medium">
                                      -${additional.refunded_amount.toFixed(2)}
                                    </span>
                                  </div>
                                )}
                            </div>

                            <Separator />

                            <div className="flex justify-between items-center">
                              <span className="text-base font-medium">
                                Additional #{index + 1} Total
                              </span>
                              <span className="text-base font-semibold">
                                ${additional.amount_paid?.toFixed(2) || "0.00"}
                              </span>
                            </div>
                          </div>
                        ))}

                        <Separator />

                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold">
                            Additional Total
                          </span>
                          <span className="text-lg font-bold">
                            $
                            {(() => {
                              const additionalTotal = additionalBookings.reduce(
                                (sum, booking) =>
                                  sum +
                                  (booking.amount_paid || 0) -
                                  (booking.refunded_amount || 0),
                                0
                              );
                              return additionalTotal.toFixed(2);
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Grand Total */}
                <Separator />
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold">Grand Total</span>
                    <span className="text-xl font-bold">
                      $
                      {(() => {
                        const originalTotal = calculateTotal();
                        const additionalTotal = additionalBookings.reduce(
                          (sum, booking) =>
                            sum +
                            (booking.amount_paid || 0) -
                            (booking.refunded_amount || 0),
                          0
                        );
                        return (originalTotal + additionalTotal).toFixed(2);
                      })()}
                    </span>
                  </div>

                  <div className="text-xs text-weak text-center pt-2">
                    Primary: ${calculateTotal().toFixed(2)} + Additional: $
                    {(() => {
                      const additionalTotal = additionalBookings.reduce(
                        (sum, booking) =>
                          sum +
                          (booking.amount_paid || 0) -
                          (booking.refunded_amount || 0),
                        0
                      );
                      return additionalTotal.toFixed(2);
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-weak">Booking ID:</span>
                  <span className="font-medium">{booking.booking_id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-weak">Created:</span>
                  <span className="font-medium">
                    {new Date(booking.booking_created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-weak">Payment Method:</span>
                  <span className="font-medium capitalize">
                    {booking.payment_method || "Not specified"}
                  </span>
                </div>
                {booking.stripe_payment_id && (
                  <div className="flex justify-between text-sm">
                    <span className="text-weak">Transaction ID:</span>
                    <span className="font-medium font-mono text-xs">
                      {booking.stripe_payment_id}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateBookingPage;
