// Types
import { DateValue } from "@internationalized/date";
import { format } from "date-fns";
import {
  CustomerInformation,
  PaymentInformation,
} from "@/app/_features/booking/types/booking-types";
// import { StripePayment } from "@/app/_components/stripe/StripePayment";
// import { Elements } from "@stripe/react-stripe-js";
import { Tour } from "@/app/_features/tours/tour-types";

import { useState } from "react";
import { useEffect } from "react";
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
  handleCompleteBooking: () => void;
}) => {
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  const handlePaymentSuccess = (paymentId: string) => {
    setPaymentInformation({
      ...paymentInformation,
      payment_id: paymentId,
    });
    handleCompleteBooking();
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await handleCompleteBooking();
    } catch (error) {
      // Error is already handled in the parent component
      console.error("Error in CheckForm:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Booking Preview Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tour Image */}
          <div className="lg:col-span-1">
            <div className="h-full">
              <div className="relative h-full">
                <img
                  src={featuredImage?.url}
                  alt={selectedTour.title}
                  className="absolute inset-0 w-full h-full object-cover rounded-lg"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Tour Information */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedTour.title}
              </h2>
              <p className="mt-2 text-gray-600">{selectedTour.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date & Time */}
              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center">
                  <svg
                    className="h-5 w-5 text-blue-600 mr-2"
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
                  Date & Time
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Selected Date</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formattedDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formattedTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Number of People</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {numberOfPeople} people
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tour Details */}
              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center">
                  <svg
                    className="h-5 w-5 text-purple-600 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Tour Details
                </h3>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <svg
                          className="h-5 w-5 text-purple-500"
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
                        <span className="text-gray-600">Duration</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {selectedTour.duration} hours
                      </span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <svg
                          className="h-5 w-5 text-purple-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-gray-600">Base Price</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        ${selectedTour.rate}
                      </span>
                    </div>
                  </div>
                  {selectedTour.group_size_limit && (
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <svg
                            className="h-5 w-5 text-purple-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          <span className="text-gray-600">Max Group Size</span>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {selectedTour.group_size_limit} people
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Information Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={customerInformation.first_name}
              onChange={(e) => handleInputChange(e, "first_name")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={customerInformation.last_name}
              onChange={(e) => handleInputChange(e, "last_name")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={customerInformation.email}
              onChange={(e) => handleInputChange(e, "email")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={customerInformation.phone_number}
              onChange={(e) => handleInputChange(e, "phone_number")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>
      </div>

      {/* Additional Products Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Additional Products
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {additionalOptions.map((option) => (
            <div
              key={option.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedOptions.includes(option.id)
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => toggleOption(option.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{option.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {option.description}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="text-blue-600 font-semibold mr-2">
                    ${option.price}
                  </span>
                  <input
                    type="checkbox"
                    checked={selectedOptions.includes(option.id)}
                    onChange={() => toggleOption(option.id)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Payment Method
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                paymentInformation.payment_method === "card"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() =>
                setPaymentInformation({
                  ...paymentInformation,
                  payment_method: "card",
                })
              }
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  checked={paymentInformation.payment_method === "card"}
                  onChange={() =>
                    setPaymentInformation({
                      ...paymentInformation,
                      payment_method: "card",
                    })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div className="ml-3">
                  <h3 className="font-medium">Credit Card</h3>
                  <p className="text-sm text-gray-600">
                    Pay securely with Stripe
                  </p>
                </div>
              </div>
            </div>
            {/* <div
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                paymentInformation.payment_method === "bank"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() =>
                setPaymentInformation({
                  ...paymentInformation,
                  payment_method: "bank",
                })
              }
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  checked={paymentInformation.payment_method === "bank"}
                  onChange={() =>
                    setPaymentInformation({
                      ...paymentInformation,
                      payment_method: "bank",
                    })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div className="ml-3">
                  <h3 className="font-medium">Bank Transfer</h3>
                  <p className="text-sm text-gray-600">Direct bank transfer</p>
                </div>
              </div>
            </div> */}
            <div
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                paymentInformation.payment_method === "cash"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() =>
                setPaymentInformation({
                  ...paymentInformation,
                  payment_method: "cash",
                })
              }
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  checked={paymentInformation.payment_method === "cash"}
                  onChange={() =>
                    setPaymentInformation({
                      ...paymentInformation,
                      payment_method: "cash",
                    })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div className="ml-3">
                  <h3 className="font-medium">Cash</h3>
                  <p className="text-sm text-gray-600">Pay on arrival</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* {paymentInformation.payment_method === "card" && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <StripePayment
            amount={paymentInformation.total_price * 100}
            onPaymentSuccess={handlePaymentSuccess}
          />
        </div>
      )} */}

      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Order Summary
        </h2>
        <div className="space-y-4">
          <div className="flex justify-between">
            <div>
              <span className="text-gray-600">Tour Price</span>
              <p className="text-sm text-gray-500">
                ${selectedTour.rate} × {numberOfPeople} people
              </p>
            </div>
            <span className="font-medium">
              ${selectedTour.rate * numberOfPeople}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Number of People</span>
            <span className="font-medium">{numberOfPeople} people</span>
          </div>
          {selectedOptions.length > 0 && (
            <>
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Additional Products</h3>
                {selectedOptions.map((optionId) => {
                  const option = additionalOptions.find(
                    (opt) => opt.id === optionId
                  );
                  return option ? (
                    <div
                      key={option.id}
                      className="flex justify-between text-sm text-gray-600 mb-2"
                    >
                      <span>{option.name}</span>
                      <span>${option.price}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </>
          )}
          <div className="border-t pt-4">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>${calculateTotal()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </div>
          ) : (
            "Complete Booking"
          )}
        </button>
      </div>
    </>
  );
};

export default CheckForm;
