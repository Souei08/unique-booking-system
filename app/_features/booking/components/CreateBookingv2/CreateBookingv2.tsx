import React, { useState } from "react";
import { toast } from "sonner";

// Components
import { Button } from "@/components/ui/button";

// Icons
import { ChevronLeft } from "lucide-react";

// Booking Steps
import SelectTours from "./booking-steps/SelectTours";
import TourTimeAndDate from "./booking-steps/TourTimeAndDate";
import CheckForm from "./booking-steps/CheckForm";

// Types
import { DateValue } from "@internationalized/date";
import { Tour } from "@/app/_features/tours/tour-types";

import {
  CustomerInformation,
  PaymentInformation,
} from "@/app/_features/booking/types/booking-types";

// Api
import { createTourBooking } from "../../api/CreateTourBooking";

// Utils
import { formatToDateString } from "@/app/_lib/utils/utils";

const CreateBookingv2 = ({ onClose }: { onClose: () => void }) => {
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1
  const [selectedTour, setSelectedTour] = useState<Tour>();

  // Step 2
  const [selectedDate, setSelectedDate] = useState<DateValue>();
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
      payment_method: "",
      payment_id: "",
      total_price: 0,
    });

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      setSelectedTour(undefined);
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

  const handleCompleteBooking = async () => {
    if (!selectedTour?.id || !selectedDate) {
      throw new Error("Missing required tour or date information");
    }

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
      payment_id:
        paymentInformation.payment_method === "cash"
          ? crypto.randomUUID()
          : paymentInformation.payment_id,
    };

    try {
      const response = await createTourBooking(bookingData);
      toast.success("Booking Successful!", {
        description: "Your tour has been booked successfully.",
      });
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Booking Failed", {
        description:
          "There was an error processing your booking. Please try again.",
      });
      throw error;
    }
  };

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
    <div className="space-y-6">
      {currentStep > 1 && (
        <Button
          variant="ghost"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
      )}

      {renderStep()}
    </div>
  );
};

export default CreateBookingv2;
