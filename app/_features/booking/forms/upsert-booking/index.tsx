"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { getAllTours } from "@/app/_api/actions/tours/actions";
import { getAvailableTourSchedules } from "@/app/_api/actions/schedule/actions";
import { Tour } from "@/app/_api/actions/types";
import { createTourBooking } from "@/app/_api/actions/booking/actions";
import Steps from "@/app/_components/common/steps";
import { bookingSchema, BookingFormData } from "./schema";
import { BookingFormProps, Step } from "./types";
import {
  TourSelectionStep,
  CustomerDetailsStep,
  PaymentDetailsStep,
  PreviewStep,
} from "./components";

export default function UpsertBookingForm({ onSubmit }: BookingFormProps) {
  const [activeStep, setActiveStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    watch,
    setValue,
    trigger,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    mode: "onChange",
  });

  const [tours, setTours] = useState<Tour[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);

  const spots = watch("spots");
  const tourId = watch("tourId");
  const total_price = spots * (selectedTour?.rate || 0);

  // Define steps for the stepper component
  const steps: Step[] = [
    {
      id: 1,
      title: "Tour Selection",
      description: "Select your tour and schedule",
      status:
        activeStep > 1
          ? "completed"
          : activeStep === 1
          ? "current"
          : "upcoming",
      condition: true,
      children: null,
    },
    {
      id: 2,
      title: "Customer Details",
      description: "Enter your personal information",
      status:
        activeStep > 2
          ? "completed"
          : activeStep === 2
          ? "current"
          : "upcoming",
      condition: activeStep >= 2,
      children: null,
    },
    {
      id: 3,
      title: "Payment Details",
      description: "Enter your payment information",
      status:
        activeStep > 3
          ? "completed"
          : activeStep === 3
          ? "current"
          : "upcoming",
      condition: activeStep >= 3,
      children: null,
    },
    {
      id: 4,
      title: "Preview",
      description: "Review your booking details",
      status: activeStep === 4 ? "current" : "upcoming",
      condition: activeStep >= 4,
      children: null,
    },
  ];

  // Fetch all tours on component mount
  useEffect(() => {
    const fetchTours = async () => {
      const tourGetResult = await getAllTours();
      setTours(tourGetResult);
    };

    fetchTours();
  }, []);

  // Fetch schedules when a tour is selected
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!tourId) {
        setSchedules([]);
        return;
      }

      setIsLoadingSchedules(true);
      try {
        const result = await getAvailableTourSchedules(tourId);
        if (result.success) {
          setSchedules(result.schedules || []);
        }
      } catch (error) {
        console.error("Error fetching schedules:", error);
      } finally {
        setIsLoadingSchedules(false);
      }
    };

    fetchSchedules();
  }, [tourId]);

  // Update selected tour when tourId changes
  useEffect(() => {
    if (tourId && tours.length > 0) {
      const tour = tours.find((t) => t.id === tourId);
      setSelectedTour(tour || null);
    } else {
      setSelectedTour(null);
    }
  }, [tourId, tours]);

  const handleStepClick = (stepId: number) => {
    // Only allow moving to steps that are available
    if (steps.find((step) => step.id === stepId)?.condition) {
      setActiveStep(stepId);
    }
  };

  const handleNext = async () => {
    // Validate the current step before proceeding
    let isValidStep = false;

    if (activeStep === 1) {
      isValidStep = await trigger(["tourId", "date", "start_time", "spots"]);
    } else if (activeStep === 2) {
      isValidStep = await trigger([
        "customerName",
        "customerEmail",
        "customerPhone",
        "customerAddress",
      ]);
    } else if (activeStep === 3) {
      isValidStep = await trigger([
        "cardNumber",
        "cardExpiry",
        "cardCvv",
        "cardName",
      ]);
    } else {
      isValidStep = true; // Preview step doesn't need validation
    }

    if (isValidStep && activeStep < steps.length) {
      setActiveStep(activeStep + 1);
    }
  };

  const handlePrevious = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleFormSubmit = async (data: BookingFormData) => {
    try {
      // Set the total price before submitting
      setValue("total_price", total_price);

      // Call the booking API
      const result = await createTourBooking({
        tourId: data.tourId,
        date: data.date,
        start_time: data.start_time,
        spots: data.spots,
        total_price: total_price,
        customer_email: data.customerEmail,
      });

      if (result.success) {
        // Call the onSubmit prop for any additional handling
        await onSubmit();
      } else {
        // Handle error
        console.error("Booking creation failed:", result.message);
        // You might want to show an error message to the user here
      }
    } catch (error) {
      console.error("Booking submission error:", error);
    }
  };

  // Render the content for each step
  const renderStepContent = () => {
    const stepProps = {
      register,
      errors,
      watch,
      setValue,
      trigger,
      selectedTour,
      tours,
      schedules,
      isLoadingSchedules,
    };

    switch (activeStep) {
      case 1:
        return <TourSelectionStep {...stepProps} />;
      case 2:
        return <CustomerDetailsStep {...stepProps} />;
      case 3:
        return <PaymentDetailsStep {...stepProps} />;
      case 4:
        return <PreviewStep {...stepProps} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <Steps steps={steps} onStepClick={handleStepClick} />

      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="mt-8 space-y-6"
      >
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          {renderStepContent()}
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={activeStep === 1}
            className={`px-4 py-2 rounded-md ${
              activeStep === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            Previous
          </button>

          {activeStep < steps.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting || !selectedTour}
              className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? "Processing..." : "Confirm Booking"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
