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

      // console.log("Original additional bookings:", additionalData);
      // console.log(
      //   "Filtered unique additional bookings:",
      //   uniqueAdditionalBookings
      // );

      // Additional debugging to check for duplicate keys
      const keys = uniqueAdditionalBookings.map(
        (booking, index) =>
          `additional-${booking.additional_id}-${booking.additional_created_at}-${index}`
      );
      // console.log("Generated keys:", keys);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading booking data...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-600" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Booking Not Found
          </h2>
          <p className="text-gray-600 mb-4">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600"
                onClick={() => router.push("/dashboard/bookings")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Update Booking
                </h1>
                <p className="text-sm text-gray-600">
                  Reference: {booking.reference_number}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className={getStatusColor(booking.booking_status)}>
                {booking.booking_status}
              </Badge>
              <Badge className={getStatusColor(booking.payment_status)}>
                {booking.payment_status}
              </Badge>
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
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="additional">Additional</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CalendarDays className="w-5 h-5" />
                      <span>Booking Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {booking.booking_date}
                          </p>
                          <p className="text-xs text-gray-600">Date</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Clock className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {booking.selected_time}
                          </p>
                          <p className="text-xs text-gray-600">Time</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Users className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {booking.slots} people
                          </p>
                          <p className="text-xs text-gray-600">Guests</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            ${booking.amount_paid}
                          </p>
                          <p className="text-xs text-gray-600">Paid</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>Customer Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <User className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {booking.full_name}
                          </p>
                          <p className="text-xs text-gray-600">Full Name</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Mail className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {booking.email}
                          </p>
                          <p className="text-xs text-gray-600">Email</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Phone className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {booking.phone_number}
                          </p>
                          <p className="text-xs text-gray-600">Phone</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <MapPin className="w-5 h-5 text-red-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {tour?.title || booking.tour_title}
                          </p>
                          <p className="text-xs text-gray-600">Tour</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Package className="w-5 h-5" />
                      <span>Booked Products</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {booking.booked_products &&
                    booking.booked_products.length > 0 ? (
                      <div className="space-y-3">
                        {booking.booked_products.map((product, index) => (
                          <div
                            key={`booked-product-${product.id || index}`}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Package className="w-5 h-5 text-gray-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {product.name}
                                </p>
                                <p className="text-xs text-gray-600">
                                  Qty: {product.quantity}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                              ${product.unit_price}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">
                        No products booked
                      </p>
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
                        <CalendarDays className="w-5 h-5" />
                        <span>Existing Additional Bookings</span>
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
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                        <p className="text-gray-600">
                          Loading additional bookings...
                        </p>
                      </div>
                    ) : additionalBookings.length > 0 ? (
                      <div className="space-y-4">
                        {additionalBookings.map((additional, index) => (
                          <div
                            key={`additional-booking-${index}`}
                            className="border rounded-lg p-4 space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <Plus className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">
                                    Additional Booking #{index + 1}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    Created:{" "}
                                    {new Date(
                                      additional.additional_created_at
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge className="bg-blue-100 text-blue-800">
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {additional.added_slots > 0 && (
                                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                  <Users className="w-5 h-5 text-blue-600" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      +{additional.added_slots} people
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      Added slots
                                    </p>
                                  </div>
                                </div>
                              )}

                              {additional.added_products &&
                                additional.added_products.length > 0 && (
                                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <Package className="w-5 h-5 text-green-600" />
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">
                                        {additional.added_products.length}{" "}
                                        products
                                      </p>
                                      <p className="text-xs text-gray-600">
                                        Added products
                                      </p>
                                    </div>
                                  </div>
                                )}
                            </div>

                            {/* Payment Information */}
                            {additional.payment_id && (
                              <div className="border-t pt-3">
                                <h5 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                                  <CreditCard className="w-4 h-4" />
                                  <span>Payment Information</span>
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {additional.amount_paid && (
                                    <div className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg">
                                      <DollarSign className="w-4 h-4 text-green-600" />
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">
                                          ${additional.amount_paid.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                          Amount Paid
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {additional.payment_method && (
                                    <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded-lg">
                                      <CreditCard className="w-4 h-4 text-blue-600" />
                                      <div>
                                        <p className="text-sm font-medium text-gray-900 capitalize">
                                          {additional.payment_method}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                          Payment Method
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {additional.paid_at && (
                                    <div className="flex items-center space-x-3 p-2 bg-purple-50 rounded-lg">
                                      <Calendar className="w-4 h-4 text-purple-600" />
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">
                                          {new Date(
                                            additional.paid_at
                                          ).toLocaleDateString()}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                          Paid Date
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {additional.payment_reference && (
                                    <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                                      <FileText className="w-4 h-4 text-gray-600" />
                                      <div>
                                        <p className="text-sm font-medium text-gray-900 font-mono">
                                          {additional.payment_reference.slice(
                                            -8
                                          )}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                          Reference
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Refund Information */}
                                {additional.refunded_amount &&
                                  additional.refunded_amount > 0 && (
                                    <div className="mt-3 p-3 bg-red-50 rounded-lg">
                                      <h6 className="font-medium text-red-900 mb-2">
                                        Refund Information
                                      </h6>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="flex items-center space-x-3">
                                          <DollarSign className="w-4 h-4 text-red-600" />
                                          <div>
                                            <p className="text-sm font-medium text-red-900">
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
                                          <div className="flex items-center space-x-3">
                                            <Calendar className="w-4 h-4 text-red-600" />
                                            <div>
                                              <p className="text-sm font-medium text-red-900">
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
                                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                                      <div className="flex items-center space-x-3">
                                        <Tag className="w-4 h-4 text-green-600" />
                                        <div>
                                          <p className="text-sm font-medium text-green-900">
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
                                <p className="text-sm text-gray-700">
                                  <strong>Note:</strong> {additional.note}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600">
                          No additional bookings found
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          You haven't made any additional bookings yet.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Add New Additional Booking */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Plus className="w-5 h-5" />
                      <span>Add New Additional Booking</span>
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
                      <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                        <CardContent className="p-6 text-center space-y-4">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                            <Users className="w-8 h-8 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              Add More People
                            </h3>
                            <p className="text-sm text-gray-600">
                              Increase the number of guests for your tour
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                        <CardContent className="p-6 text-center space-y-4">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <Package className="w-8 h-8 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              Add Products
                            </h3>
                            <p className="text-sm text-gray-600">
                              Book additional equipment or services
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="text-center">
                      <Button
                        onClick={handleAddAdditionalBooking}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Start Additional Booking
                      </Button>
                    </div>
                  </CardContent>
                </Card>
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
                  className="w-full bg-blue-600 hover:bg-blue-700"
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
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Tour Cost:</span>
                    <span>
                      ${(booking.tour_rate * bookingDetails.slots).toFixed(2)}
                    </span>
                  </div>

                  {selectedProducts.map((productId) => {
                    const product = availableProducts.find(
                      (p) => p.id === productId
                    );
                    const quantity = productQuantities[productId] || 1;
                    return product ? (
                      <div
                        key={`booked-product-${product.id || productId}`}
                        className="flex justify-between text-sm"
                      >
                        <span>
                          {product.name} (x{quantity}):
                        </span>
                        <span>${(product.price * quantity).toFixed(2)}</span>
                      </div>
                    ) : null;
                  })}

                  {booking.discount_amount && booking.discount_amount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-${booking.discount_amount.toFixed(2)}</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
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
                  <span className="text-gray-600">Booking ID:</span>
                  <span className="font-medium">{booking.booking_id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">
                    {new Date(booking.booking_created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium capitalize">
                    {booking.payment_method || "Not specified"}
                  </span>
                </div>
                {booking.stripe_payment_id && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Transaction ID:</span>
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
