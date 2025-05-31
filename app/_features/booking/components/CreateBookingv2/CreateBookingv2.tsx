"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";

// Components
import { Button } from "@/components/ui/button";

// Icons
import { ChevronLeft } from "lucide-react";

// Booking Steps
import SelectTours from "./booking-steps/SelectTours";
import TourTimeAndDate from "./booking-steps/TourTimeAndDate";
import CheckForm from "./booking-steps/CheckForm";
import BookingSuccess from "./booking-steps/BookingSuccess";

// Types
import { DateValue, parseDate, CalendarDate } from "@internationalized/date";
import { Tour } from "@/app/_features/tours/tour-types";

import {
  CustomerInformation,
  PaymentInformation,
} from "@/app/_features/booking/types/booking-types";

// Api
import { createTourBookingv2 } from "../../api/CreateTourBookingv2";

// Utils
import { formatToDateString } from "@/app/_lib/utils/utils";

const CreateBookingv2 = ({
  onClose,
  customerSelectedTour,
  initialDate,
}: {
  onClose: () => void;
  customerSelectedTour?: Tour;
  initialDate?: Date;
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isBookingComplete, setIsBookingComplete] = useState(false);

  // Step 1
  const [selectedTour, setSelectedTour] = useState<Tour>(
    customerSelectedTour || ({} as Tour)
  );

  // Step 2
  const [selectedDate, setSelectedDate] = useState<DateValue | undefined>(
    initialDate ? parseDate(initialDate.toISOString().split("T")[0]) : undefined
  );
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [numberOfPeople, setNumberOfPeople] = useState<number>(1);

  // Step 3
  const [customerInformation, setCustomerInformation] =
    useState<CustomerInformation>({
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
    });

  const [paymentInformation, setPaymentInformation] =
    useState<PaymentInformation>({
      payment_method: "card",
      payment_id: "",
      total_price: 0,
    });

  useEffect(() => {
    if (selectedTour && selectedTour.id) {
      setCurrentStep(2);
    }
  }, [selectedTour]);

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      setSelectedTour({} as Tour);
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && selectedTour) {
      setCurrentStep(currentStep + 1);
    }

    if (currentStep === 2 && selectedDate) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleCompleteBooking = async (paymentId: string) => {
    if (!selectedTour?.id || !selectedDate) {
      throw new Error("Missing required tour or date information");
    }

    // Log the current payment information
    console.log("Current Payment Information:", paymentInformation);

    const bookingData = {
      first_name: customerInformation.first_name,
      last_name: customerInformation.last_name,
      email: customerInformation.email,
      phone_number: customerInformation.phone_number,
      tour_id: selectedTour.id,
      booking_date: formatToDateString(selectedDate) || "",
      selected_time: selectedTime,
      slots: numberOfPeople,
      total_price: paymentInformation.total_price,
      payment_method: paymentInformation.payment_method,
      payment_id: paymentId,
    };

    console.log("Booking Data:", bookingData);

    if (!bookingData.payment_id) {
      toast.error("Payment Error", {
        description: "Payment ID is missing. Please try again.",
      });
      return;
    }

    try {
      const response = await createTourBookingv2(bookingData);
      setIsBookingComplete(true);
    } catch (error) {
      console.error("Booking Error:", error);
      toast.error("Booking Failed", {
        description:
          "There was an error processing your booking. Please try again.",
      });
      throw error;
    }
  };

  if (isBookingComplete) {
    return (
      <BookingSuccess
        selectedTour={selectedTour!}
        selectedDate={selectedDate!}
        selectedTime={selectedTime}
        customerEmail={customerInformation.email}
        onClose={onClose}
      />
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <SelectTours
            setSelectedTour={setSelectedTour}
            handleNext={handleNext}
          />
        );
      case 2:
        return (
          <TourTimeAndDate
            selectedTour={selectedTour!}
            handleNext={handleNext}
            selectedDate={selectedDate!}
            selectedTime={selectedTime}
            setSelectedDate={setSelectedDate}
            setSelectedTime={setSelectedTime}
            numberOfPeople={numberOfPeople}
            setNumberOfPeople={setNumberOfPeople}
          />
        );
      case 3:
        return (
          <CheckForm
            selectedTour={selectedTour!}
            selectedDate={selectedDate!}
            selectedTime={selectedTime}
            numberOfPeople={numberOfPeople}
            customerInformation={customerInformation!}
            paymentInformation={paymentInformation!}
            setPaymentInformation={setPaymentInformation}
            setCustomerInformation={setCustomerInformation}
            handleCompleteBooking={handleCompleteBooking}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="">
        {/* Progress Bar */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary text-primary-foreground font-semibold text-sm sm:text-base">
                {currentStep}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-strong">
                {currentStep === 1 && "Select Tour"}
                {currentStep === 2 && "Choose Date & Time"}
                {currentStep === 3 && "Complete Booking"}
              </h2>
            </div>
            {currentStep > 1 && (
              <Button
                variant="ghost"
                onClick={handleBack}
                className="flex items-center gap-2 text-muted-foreground hover:text-strong transition-colors w-full sm:w-auto justify-center sm:justify-start"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </Button>
            )}
          </div>
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-primary transition-all duration-300 ease-in-out"
              style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent rounded-2xl sm:rounded-3xl" />
          <div className="relative p-4 sm:p-6">{renderStep()}</div>
        </div>

        {/* Footer */}
        <div className="mt-8 sm:mt-12 text-center text-xs sm:text-sm text-muted-foreground">
          <p>Need help? Contact our support team at support@example.com</p>
          <p className="mt-2">Secure booking powered by Stripe</p>
        </div>
      </div>
    </div>
  );
};

export default CreateBookingv2;
