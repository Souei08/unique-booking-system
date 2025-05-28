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

import { useState } from "react";
import { useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { StripePaymentFormV2 } from "./StripePaymentFormv2";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

interface AdditionalOption {
  id: number;
  name: string;
  price: number;
  description: string;
}

// Mock additional options - replace with actual data from your backend
const additionalOptions: AdditionalOption[] = [
  {
    id: 1,
    name: "Souvenir Package",
    price: 25,
    description: "Exclusive local souvenirs",
  },
  {
    id: 2,
    name: "Photo Package",
    price: 50,
    description: "Professional photos of your experience",
  },
  {
    id: 3,
    name: "Lunch Package",
    price: 35,
    description: "Local cuisine lunch included",
  },
];

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
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [clientSecret, setClientSecret] = useState("");

  // Add useEffect to update total price
  useEffect(() => {
    const total = calculateTotal();
    setPaymentInformation({
      ...paymentInformation,
      total_price: total,
    });
  }, [selectedOptions, selectedTour.rate]);

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

  const toggleOption = (optionId: number) => {
    setSelectedOptions((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId]
    );
  };

  const calculateTotal = () => {
    let total = selectedTour.rate * numberOfPeople;
    selectedOptions.forEach((optionId) => {
      const option = additionalOptions.find((opt) => opt.id === optionId);
      if (option) {
        total += option.price * numberOfPeople;
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
          <h2 className="text-xl sm:text-2xl font-bold text-strong mb-4 sm:mb-8">
            Additional Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {additionalOptions.map((option) => (
              <div
                key={option.id}
                className={`border rounded-xl sm:rounded-2xl p-4 sm:p-6 cursor-pointer transition-all duration-300 ${
                  selectedOptions.includes(option.id)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => toggleOption(option.id)}
              >
                <div className="flex justify-between items-start gap-3 sm:gap-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-strong">
                      {option.name}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
                      {option.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <span className="text-lg sm:text-xl font-bold text-primary">
                      ${option.price}
                    </span>
                    <input
                      type="checkbox"
                      checked={selectedOptions.includes(option.id)}
                      onChange={() => toggleOption(option.id)}
                      className="h-4 w-4 sm:h-5 sm:w-5 text-primary focus:ring-primary border-border rounded"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
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

                {selectedOptions.length > 0 && (
                  <div className="space-y-2 sm:space-y-3">
                    <h3 className="text-sm sm:text-base font-medium text-muted-foreground">
                      Additional Products
                    </h3>
                    {selectedOptions.map((optionId) => {
                      const option = additionalOptions.find(
                        (opt) => opt.id === optionId
                      );
                      return option ? (
                        <div
                          key={option.id}
                          className="flex justify-between items-center text-xs sm:text-sm"
                        >
                          <div className="flex-1">
                            <span className="text-muted-foreground">
                              {option.name}
                            </span>
                            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                              ${option.price} × {numberOfPeople} people
                            </p>
                          </div>
                          <span className="font-medium">
                            ${option.price * numberOfPeople}
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
