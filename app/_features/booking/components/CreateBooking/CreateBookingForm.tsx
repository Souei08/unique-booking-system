"use client";

import React, { useState, useEffect } from "react";
import { Tour } from "@/app/_features/tours/types/TourTypes";
import { DateValue } from "@internationalized/date";
import { getAllToursClient } from "@/app/_features/tours/actions/client/getAllToursClient";
import {
  CreditCardIcon,
  UserIcon,
  CalendarIcon,
  ShoppingBagIcon,
  GiftIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { StepIndicator } from "./StepIndicator";
import { TourSelectionStep } from "./steps/TourSelectionStep";
import { DateSelectionStep } from "./steps/DateSelectionStep";
import { CustomerDetailsStep } from "./steps/CustomerDetailsStep";
import { PaymentStep } from "./steps/PaymentStep";
import { OverviewStep } from "./steps/OverviewStep";
import { PriceSummary } from "./PriceSummary";
import { AdditionalOptionsStep } from "./steps/AdditionalOptionsStep";
import { createTourBooking } from "@/app/_features/booking/actions/CreateTourBooking";

// Mock data for additional options
const additionalOptions = [
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
  {
    id: 4,
    name: "Transportation",
    price: 40,
    description: "Round-trip transportation from hotel",
  },
];

export const CreateBookingForm = () => {
  // State for multi-step form
  const [currentStep, setCurrentStep] = useState(1);
  const [tours, setTours] = useState<Tour[]>([]);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [selectedDate, setSelectedDate] = useState<DateValue | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"onArrival" | "stripe">(
    "onArrival"
  );

  // Customer details
  const [customerDetails, setCustomerDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  // Add validation state
  const [validationErrors, setValidationErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  // Fetch tours on component mount
  useEffect(() => {
    const fetchTours = async () => {
      try {
        const fetchedTours = await getAllToursClient();
        setTours(fetchedTours);
      } catch (error) {
        console.error("Error fetching tours:", error);
      }
    };

    fetchTours();
  }, []);

  // Calculate total price
  const calculateTotalPrice = () => {
    let total = 0;

    // Add tour price if selected
    if (selectedTour) {
      total += selectedTour.rate;
    }

    // Add selected options prices
    selectedOptions.forEach((optionId) => {
      const option = additionalOptions.find((opt) => opt.id === optionId);
      if (option) {
        total += option.price;
      }
    });

    return total;
  };

  // Handle option selection
  const toggleOption = (optionId: number) => {
    setSelectedOptions((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId]
    );
  };

  // Add validation function
  const validateCustomerDetails = () => {
    const errors = {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    };

    let isValid = true;

    // First name validation
    if (!customerDetails.firstName.trim()) {
      errors.firstName = "First name is required";
      isValid = false;
    } else if (customerDetails.firstName.length < 2) {
      errors.firstName = "First name must be at least 2 characters";
      isValid = false;
    }

    // Last name validation
    if (!customerDetails.lastName.trim()) {
      errors.lastName = "Last name is required";
      isValid = false;
    } else if (customerDetails.lastName.length < 2) {
      errors.lastName = "Last name must be at least 2 characters";
      isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customerDetails.email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(customerDetails.email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Phone validation
    const phoneRegex = /^\+?[\d\s-()]{10,}$/;
    if (!customerDetails.phone.trim()) {
      errors.phone = "Phone number is required";
      isValid = false;
    } else if (!phoneRegex.test(customerDetails.phone)) {
      errors.phone = "Please enter a valid phone number";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would implement the actual booking submission logic
    console.log({
      tour: selectedTour,
      date: selectedDate,
      customerDetails,
      selectedOptions,
      paymentMethod,
      totalPrice: calculateTotalPrice(),
      selectedDate: selectedDate?.toString(),
    });

    try {
      const bookingResponse = await createTourBooking({
        tourId: selectedTour?.id || "",
        date: selectedDate?.toString() || "",
        first_name: customerDetails.firstName || "",
        last_name: customerDetails.lastName || "",
        customer_email: customerDetails.email || "",
        phone_number: customerDetails.phone || "",
        total_price: calculateTotalPrice(),
        spots: 2,
        start_time: "9:00 AM",
      });

      console.log(bookingResponse);

      if (bookingResponse.success) {
        alert("Booking submitted successfully!");
      } else {
        alert(bookingResponse.message);
      }
    } catch (error) {
      console.error("Error creating booking:", error);
    }

    // console.log(bookingResponse);
    // // For now, just show an alert
    // alert("Booking submitted successfully!");
  };

  // Navigation functions
  const nextStep = () => {
    // Validate customer details before proceeding to next step
    if (currentStep === 3 && !validateCustomerDetails()) {
      return; // Stop if validation fails
    }

    setCurrentStep((prev) => Math.min(prev + 1, 6));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Add function to handle step click
  const handleStepClick = (step: number) => {
    // Only allow clicking on completed steps or the current step
    if (step <= currentStep) {
      setCurrentStep(step);
    }
  };

  // Render step content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <TourSelectionStep
            tours={tours}
            selectedTour={selectedTour}
            setSelectedTour={setSelectedTour}
          />
        );

      case 2:
        return (
          <DateSelectionStep
            selectedTour={selectedTour}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
        );

      case 3:
        return (
          <CustomerDetailsStep
            customerDetails={customerDetails}
            setCustomerDetails={setCustomerDetails}
            validationErrors={validationErrors}
          />
        );

      case 4:
        return (
          <AdditionalOptionsStep
            additionalOptions={additionalOptions}
            selectedOptions={selectedOptions}
            toggleOption={toggleOption}
          />
        );

      case 5:
        return (
          <PaymentStep
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
          />
        );

      case 6:
        return (
          <OverviewStep
            selectedTour={selectedTour}
            selectedDate={selectedDate}
            customerDetails={customerDetails}
            selectedOptions={selectedOptions}
            additionalOptions={additionalOptions}
            paymentMethod={paymentMethod}
            calculateTotalPrice={calculateTotalPrice}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Progress Steps */}
      <StepIndicator
        currentStep={currentStep}
        handleStepClick={handleStepClick}
      />

      {/* Price Summary (Always visible) */}
      <PriceSummary
        selectedTour={selectedTour}
        selectedDate={selectedDate}
        calculateTotalPrice={calculateTotalPrice}
      />

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0">
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            currentStep === 1 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Previous
        </button>

        {currentStep < 6 ? (
          <button
            type="button"
            onClick={nextStep}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Complete Booking
          </button>
        )}
      </div>
    </>
  );
};
