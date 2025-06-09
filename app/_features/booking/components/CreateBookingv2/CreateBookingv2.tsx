"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

// Components
import { Button } from "@/components/ui/button";

// Icons
import { ChevronLeft } from "lucide-react";

// Booking Steps
import SelectTours from "./booking-steps/SelectTours";
import TourTimeAndDate from "./booking-steps/TourTimeAndDate";
import CheckForm from "./booking-steps/CheckForm";
import BookingSuccess from "./booking-steps/BookingSuccess";
import PaymentStep from "./booking-steps/PaymentStep";

// Types
import { DateValue, parseDate, CalendarDate } from "@internationalized/date";
import { Tour } from "@/app/_features/tours/tour-types";
import { Product } from "@/app/_features/products/types/product-types";

import {
  CustomerInformation,
  PaymentInformation,
  SlotDetail,
} from "@/app/_features/booking/types/booking-types";

// Api
import { createTourBookingv2 } from "../../api/CreateTourBookingv2";
import { updateBookingPaymentStatus } from "../../api/updateBookingPaymentStatus";

// Utils
import { formatToDateString } from "@/app/_lib/utils/utils";
import { CustomSlotType } from "./booking-steps/SlotDetails";

const CreateBookingv2 = ({
  onClose,
  customerSelectedTour,
  initialDate,
}: {
  onClose?: () => void;
  customerSelectedTour?: Tour;
  initialDate?: Date;
}) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isBookingComplete, setIsBookingComplete] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>("");

  // Step 1
  const [selectedTour, setSelectedTour] = useState<Tour>(
    customerSelectedTour || ({} as Tour)
  );

  // Step 2
  const [selectedDate, setSelectedDate] = useState<DateValue>(
    parseDate(new Date().toISOString().split("T")[0])
  );
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [numberOfPeople, setNumberOfPeople] = useState<number>(1);
  const [slotDetails, setSlotDetails] = useState<SlotDetail[]>([
    {
      type:
        selectedTour.custom_slot_types &&
        selectedTour.custom_slot_types !== "[]"
          ? JSON.parse(selectedTour.custom_slot_types)[0].name
          : "",
      price:
        selectedTour.custom_slot_types &&
        selectedTour.custom_slot_types !== "[]"
          ? JSON.parse(selectedTour.custom_slot_types)[0].price
          : 0,
    },
  ]);

  // Add handler for date changes
  const handleDateChange = (newDate: DateValue) => {
    setSelectedDate(newDate);
    // Clear time selection
    setSelectedTime("");
    // Reset number of people
    setNumberOfPeople(1);
    // Clear selected products
    setSelectedProducts([]);
    setProductQuantities({});
    // Reset slot details to initial state
    if (
      selectedTour?.custom_slot_types &&
      selectedTour.custom_slot_types !== "[]"
    ) {
      const customTypes = JSON.parse(selectedTour.custom_slot_types);
      if (customTypes.length > 0) {
        setSlotDetails([
          {
            type: customTypes[0].name,
            price: customTypes[0].price,
          },
        ]);
      }
    }
  };

  // Update slot details when selectedTour changes
  useEffect(() => {
    if (
      selectedTour?.custom_slot_types &&
      selectedTour.custom_slot_types !== "[]"
    ) {
      const customTypes = JSON.parse(selectedTour.custom_slot_types);
      if (customTypes.length > 0) {
        setSlotDetails([
          {
            type: customTypes[0].name,
            price: customTypes[0].price,
          },
        ]);
      }
    }
  }, [selectedTour]);

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

  // Add state for payment intent
  const [paymentIntentId, setPaymentIntentId] = useState<string>("");

  // Add state for products
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [productQuantities, setProductQuantities] = useState<
    Record<string, number>
  >({});
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);

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

    if (currentStep === 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Parse custom slot types and fields
  const customSlotTypes =
    selectedTour.custom_slot_types && selectedTour.custom_slot_types !== "[]"
      ? JSON.parse(selectedTour.custom_slot_types)
      : null;
  const customSlotFields =
    selectedTour.custom_slot_fields && selectedTour.custom_slot_fields !== "[]"
      ? JSON.parse(selectedTour.custom_slot_fields)
      : [];

  const handleCompleteBooking = async (
    paymentId: string | null
  ): Promise<{ success: boolean; bookingId: string | null }> => {
    if (!selectedTour?.id || !selectedDate) {
      throw new Error("Missing required tour or date information");
    }

    // Format products data for the API
    const productsData = selectedProducts.map((productId) => {
      const product = availableProducts.find((p) => p.id === productId);
      const quantity = productQuantities[productId] || 1;
      const bookingProductId = product?.product_booking_id || "";
      console.log(bookingProductId);
      return {
        product_id: productId,
        quantity: quantity,
        unit_price: product?.price || 0,
        product_booking_id: bookingProductId,
      };
    });

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
      products: productsData,
      slot_details: slotDetails,
    };

    try {
      // Create booking first
      const response = await createTourBookingv2(bookingData);

      if (response && response.booking_id) {
        // Update payment intent metadata BEFORE confirming the payment
        await fetch("/api/update-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentIntentId: paymentIntentId,
            metadata: { booking_id: response.booking_id },
          }),
        });

        return { success: true, bookingId: response.booking_id };
      }
      return { success: false, bookingId: null };
    } catch (error) {
      console.error("Booking Error:", error);
      toast.error("Booking Failed", {
        description:
          "There was an error processing your booking. Please try again.",
      });
      return { success: false, bookingId: null };
    }
  };

  const calculateTotal = () => {
    let total = 0;

    // Calculate tour price based on slot types if they exist
    if (customSlotTypes && customSlotTypes.length > 0) {
      // Sum up prices from slot details
      total = slotDetails.reduce((sum, slot) => {
        const slotType = customSlotTypes.find(
          (type: CustomSlotType) => type.name === slot.type
        );
        return sum + (slotType?.price || 0);
      }, 0);
    } else {
      // Use regular tour rate if no custom slot types
      total = selectedTour.rate * numberOfPeople;
    }

    // Add product prices
    selectedProducts.forEach((productId) => {
      const product = availableProducts.find((p) => p.id === productId);
      if (product) {
        const quantity = productQuantities[productId] || 1;
        total += product.price * quantity;
      }
    });

    // Round to 2 decimal places to avoid floating point issues
    return Math.round(total * 100) / 100;
  };

  const fetchClientSecret = async (bookingId: string | null) => {
    if (isLoadingPayment) return;

    try {
      setIsLoadingPayment(true);

      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(calculateTotal() * 100),
          paymentIntentId: paymentIntentId || null,
          bookingId: bookingId || null,
          name:
            customerInformation.first_name +
            " " +
            customerInformation.last_name,
          email: customerInformation.email,
          phone: customerInformation.phone_number,
        }),
      });

      const data = await response.json();

      if (data.clientSecret) setClientSecret(data.clientSecret);
      if (data.paymentIntentId) setPaymentIntentId(data.paymentIntentId);
    } catch (error) {
      console.error("Error creating/updating payment intent:", error);
      toast.error("Failed to create payment intent");
    } finally {
      setIsLoadingPayment(false);
    }
  };

  const handleCloseAttempt = () => {
    if (currentStep === 4) {
      setShowConfirmDialog(true);
    } else {
      onClose?.();
    }
  };

  const handleConfirmClose = () => {
    setShowConfirmDialog(false);
    onClose?.();
  };

  if (isBookingComplete) {
    return (
      <BookingSuccess
        isAdmin={false}
        selectedTour={selectedTour!}
        selectedDate={selectedDate!}
        selectedTime={selectedTime}
        bookingId={bookingId || ""}
        onClose={onClose || (() => {})}
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
            setSelectedDate={handleDateChange}
            setSelectedTime={setSelectedTime}
            numberOfPeople={numberOfPeople}
            setNumberOfPeople={setNumberOfPeople}
            customSlotTypes={customSlotTypes}
            setSlotDetails={setSlotDetails}
            slotDetails={slotDetails}
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
            selectedProducts={selectedProducts}
            setSelectedProducts={setSelectedProducts}
            productQuantities={productQuantities}
            setProductQuantities={setProductQuantities}
            availableProducts={availableProducts}
            setAvailableProducts={setAvailableProducts}
            setNumberOfPeople={setNumberOfPeople}
            setSlotDetails={setSlotDetails}
            slotDetails={slotDetails}
            customSlotTypes={customSlotTypes}
            customSlotFields={customSlotFields}
            handleNext={handleNext}
            calculateTotal={calculateTotal}
          />
        );
      case 4:
        return (
          <PaymentStep
            fetchClientSecret={fetchClientSecret}
            clientSecret={clientSecret}
            paymentInformation={paymentInformation}
            handleCompleteBooking={handleCompleteBooking}
            handleNext={handleNext}
            handleBack={handleBack}
            totalAmount={paymentInformation.total_price}
            paymentIntentId={paymentIntentId}
            setPaymentIntentId={setPaymentIntentId}
            selectedProducts={selectedProducts}
            productQuantities={productQuantities}
            availableProducts={availableProducts}
            slotDetails={slotDetails}
            numberOfPeople={numberOfPeople}
            customSlotTypes={customSlotTypes}
            customSlotFields={customSlotFields}
            selectedTour={selectedTour}
            customerInformation={customerInformation}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            calculateTotal={calculateTotal}
            isLoadingPayment={isLoadingPayment}
            setBookingId={setBookingId}
            setIsBookingComplete={setIsBookingComplete}
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
        <div className="mb-4 md:mb-8 lg:mb-12 px-3 md:px-6">
          <div className="flex flex-col gap-2 md:gap-6 mb-3 md:mb-4">
            <div className="flex items-center justify-between">
              {currentStep > 1 ? (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex items-center gap-1.5 md:gap-2 text-strong hover:bg-strong/10 transition-colors text-sm md:text-base -ml-1.5 md:-ml-2 px-3 md:px-4 py-1.5 md:py-2 border-strong/20 hover:border-strong/30"
                >
                  <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
              ) : (
                <div className="w-12 md:w-16" />
              )}
              <div className="flex items-center gap-2.5 md:gap-4">
                <h2 className="text-base md:text-xl lg:text-2xl font-bold text-strong">
                  {currentStep === 1 && "Select Tour"}
                  {currentStep === 2 && "Choose Date & Time"}
                  {currentStep === 3 && "Complete Booking"}
                  {currentStep === 4 && "Complete Your Payment"}
                </h2>

                <div className="flex items-center justify-center w-6 h-6 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-full bg-strong text-primary-foreground font-semibold text-xs md:text-base">
                  {currentStep}
                </div>
              </div>
              {/* <div className="w-12 md:w-16" /> */}
            </div>
          </div>
          <div className="relative h-1 md:h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-brand dark:bg-brand transition-all duration-300 ease-in-out"
              style={{ width: `${(currentStep / 4) * 100}%` }}
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

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to leave?</AlertDialogTitle>
            <AlertDialogDescription>
              Your booking progress will be lost if you leave this page. Are you
              sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose}>
              Yes, leave page
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CreateBookingv2;
