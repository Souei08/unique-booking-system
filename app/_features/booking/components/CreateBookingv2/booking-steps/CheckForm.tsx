// Types
import { DateValue } from "@internationalized/date";
import { format } from "date-fns";
import {
  CustomerInformation,
  PaymentInformation,
} from "@/app/_features/booking/types/booking-types";
// import { StripePayment } from "@/app/_components/stripe/StripePayment";
import { Elements } from "@stripe/react-stripe-js";

import { Tour } from "@/app/_features/tours/tour-types";
import { Product } from "@/app/_features/products/types/product-types";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { StripePaymentFormV2 } from "./StripePaymentFormv2";
import { getAssignedToursByTourId } from "@/app/_features/products/api/getAssignedToursByTourId";
import { toast } from "sonner";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

const CheckForm = ({
  selectedTour,
  selectedDate,
  selectedTime,
  numberOfPeople,
  customerInformation,
  paymentInformation,
  setPaymentInformation,
  setCustomerInformation,
  handleCompleteBooking,
}: {
  selectedTour: Tour;
  selectedDate: DateValue;
  selectedTime: string;
  numberOfPeople: number;
  customerInformation: CustomerInformation;
  paymentInformation: PaymentInformation;
  setPaymentInformation: (paymentInformation: PaymentInformation) => void;
  setCustomerInformation: (
    customerInformation:
      | CustomerInformation
      | ((prev: CustomerInformation) => CustomerInformation)
  ) => void;
  handleCompleteBooking: (paymentId: string) => void;
}) => {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [productQuantities, setProductQuantities] = useState<
    Record<string, number>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Fetch available products for the selected tour
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoadingProducts(true);
        const assignedTours = await getAssignedToursByTourId(selectedTour.id);
        console.log("assignedTours", assignedTours);
        setAvailableProducts(assignedTours as unknown as Product[]);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to fetch available products");
      } finally {
        setIsLoadingProducts(false);
      }
    };

    if (selectedTour.id) {
      fetchProducts();
    }
  }, [selectedTour.id]);

  // Add useEffect to update total price
  useEffect(() => {
    const total = calculateTotal();
    setPaymentInformation({
      ...paymentInformation,
      total_price: total,
    });
  }, [selectedProducts, selectedTour.rate]);

  const tourImages = JSON.parse(selectedTour.images) as {
    url: string;
    isFeature: boolean;
  }[];
  const featuredImage = tourImages.find((image) => image.isFeature);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof CustomerInformation
  ) => {
    const { name, value } = e.target;

    setCustomerInformation((prev: CustomerInformation) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleProduct = (productId: string) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        // Remove product and its quantity when unselected
        setProductQuantities((quantities) => {
          const newQuantities = { ...quantities };
          delete newQuantities[productId];
          return newQuantities;
        });
        return prev.filter((id) => id !== productId);
      } else {
        // Add product with default quantity of 1
        setProductQuantities((quantities) => ({
          ...quantities,
          [productId]: 1,
        }));
        return [...prev, productId];
      }
    });
  };

  const updateProductQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setProductQuantities((prev) => ({
      ...prev,
      [productId]: quantity,
    }));
  };

  const calculateTotal = () => {
    let total = selectedTour.rate * numberOfPeople;
    selectedProducts.forEach((productId) => {
      const product = availableProducts.find((p) => p.id === productId);
      if (product) {
        const quantity = productQuantities[productId] || 1;
        total += product.price * quantity;
      }
    });
    return total;
  };

  const formattedDate = format(
    new Date(selectedDate.year, selectedDate.month - 1, selectedDate.day),
    "MMMM dd, yyyy"
  );
  const formattedTime = new Date(
    `1970-01-01T${selectedTime}Z`
  ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // const handleSubmit = async (e: React.MouseEvent) => {
  //   e.preventDefault();
  //   setIsLoading(true);
  //   try {
  //     await handleCompleteBooking();
  //   } catch (error) {
  //     // Error is already handled in the parent component
  //     console.error("Error in CheckForm:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  useEffect(() => {
    const fetchClientSecret = async () => {
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: calculateTotal() * 100,
          email: customerInformation.email,
        }),
      });
      const data = await response.json();
      setClientSecret(data.clientSecret);
    };

    fetchClientSecret();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-12 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
      {/* Main Content - Left Column */}
      <div className="lg:col-span-2 space-y-6 sm:space-y-8">
        {/* User Information Section */}
        <div className="rounded-2xl sm:rounded-3xl border bg-card shadow-lg p-4 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-strong mb-4 sm:mb-8">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2"
              >
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={customerInformation.first_name}
                onChange={(e) => handleInputChange(e, "first_name")}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-background border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm sm:text-base"
                required
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2"
              >
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={customerInformation.last_name}
                onChange={(e) => handleInputChange(e, "last_name")}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-background border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm sm:text-base"
                required
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={customerInformation.email}
                onChange={(e) => handleInputChange(e, "email")}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-background border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm sm:text-base"
                required
              />
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={customerInformation.phone_number}
                onChange={(e) => handleInputChange(e, "phone_number")}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-background border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm sm:text-base"
                required
              />
            </div>
          </div>
        </div>

        {/* Additional Products Section */}
        <div className="rounded-2xl sm:rounded-3xl border bg-card shadow-lg p-4 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-strong">
              Additional Products
            </h2>
            <span className="text-sm text-muted-foreground">
              {selectedProducts.length} selected
            </span>
          </div>
          {isLoadingProducts ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : availableProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {availableProducts.map((product) => (
                <div
                  key={product.id}
                  className={`border rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-300 ${
                    selectedProducts.includes(product.id)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start gap-4 sm:gap-6">
                    {/* Product Image */}
                    <div className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded-lg">
                      <img
                        src={product.image_url || ""}
                        alt={product.name}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-base sm:text-lg font-semibold text-strong">
                            {product.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {product.description}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-lg sm:text-xl font-bold text-primary">
                            ${product.price}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center space-x-2 bg-background rounded-lg px-2 py-1">
                              <button
                                onClick={() =>
                                  updateProductQuantity(
                                    product.id,
                                    (productQuantities[product.id] || 1) - 1
                                  )
                                }
                                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-primary/10 transition-colors"
                                disabled={
                                  !selectedProducts.includes(product.id)
                                }
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-medium">
                                {productQuantities[product.id] || 1}
                              </span>
                              <button
                                onClick={() =>
                                  updateProductQuantity(
                                    product.id,
                                    (productQuantities[product.id] || 1) + 1
                                  )
                                }
                                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-primary/10 transition-colors"
                                disabled={
                                  !selectedProducts.includes(product.id)
                                }
                              >
                                +
                              </button>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedProducts.includes(product.id)}
                                onChange={() => toggleProduct(product.id)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-strong mb-2">
                No Additional Products
              </h3>
              <p className="text-muted-foreground">
                There are no additional products available for this tour.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Order Summary - Right Column */}
      <div className="lg:col-span-1">
        <div className="sticky top-8 space-y-6 sm:space-y-8">
          <div className="rounded-2xl sm:rounded-3xl border bg-card shadow-lg p-4 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-strong mb-4 sm:mb-8">
              Order Summary
            </h2>
            <div className="space-y-4 sm:space-y-6">
              {/* Selected Tour Summary */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="relative h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 overflow-hidden rounded-lg sm:rounded-xl">
                    <img
                      src={featuredImage?.url}
                      alt={selectedTour.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-strong truncate">
                      {selectedTour.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {selectedTour.duration} hours
                    </p>
                  </div>
                </div>

                {/* Date and Time Section */}
                <div className="bg-background rounded-lg sm:rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <svg
                      className="h-4 w-4 sm:h-5 sm:w-5 text-primary"
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
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                        Date
                      </p>
                      <p className="text-sm sm:text-base font-semibold text-strong">
                        {formattedDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <svg
                      className="h-4 w-4 sm:h-5 sm:w-5 text-primary"
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
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                        Time
                      </p>
                      <p className="text-sm sm:text-base font-semibold text-strong">
                        {formattedTime}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
                  <span>Group Size</span>
                  <span className="font-medium">{numberOfPeople} people</span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t pt-4 sm:pt-6 space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm sm:text-base font-medium text-muted-foreground">
                      Tour Price
                    </span>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                      ${selectedTour.rate} × {numberOfPeople} people
                    </p>
                  </div>
                  <span className="text-base sm:text-lg font-semibold text-strong">
                    ${selectedTour.rate * numberOfPeople}
                  </span>
                </div>

                {selectedProducts.length > 0 && (
                  <div className="space-y-2 sm:space-y-3">
                    <h3 className="text-sm sm:text-base font-medium text-muted-foreground">
                      Additional Products
                    </h3>
                    {selectedProducts.map((productId) => {
                      const product = availableProducts.find(
                        (p) => p.id === productId
                      );
                      const quantity = productQuantities[productId] || 1;
                      return product ? (
                        <div
                          key={product.id}
                          className="flex justify-between items-center text-xs sm:text-sm"
                        >
                          <div className="flex-1">
                            <span className="text-muted-foreground">
                              {product.name}
                            </span>
                            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                              ${product.price} × {quantity} items
                            </p>
                          </div>
                          <span className="font-medium">
                            ${product.price * quantity}
                          </span>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}

                <div className="border-t pt-3 sm:pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-base sm:text-lg font-semibold text-strong">
                      Total
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-primary">
                      ${calculateTotal()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="rounded-2xl sm:rounded-3xl border bg-card shadow-lg p-4 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-strong mb-4 sm:mb-8">
              Card Payment
            </h2>
            <div className="space-y-4 sm:space-y-6">
              {clientSecret && (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <StripePaymentFormV2
                    onPaymentSuccess={async (paymentId) => {
                      await handleCompleteBooking(paymentId);
                    }}
                  />
                </Elements>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckForm;
