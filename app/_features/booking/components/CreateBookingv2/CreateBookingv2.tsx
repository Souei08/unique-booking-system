"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { ChevronLeft, X } from "lucide-react";

// Booking Steps
import SelectTours from "./booking-steps/SelectTours";
import TourTimeAndDate from "./booking-steps/TourTimeAndDate";
import CheckForm from "./booking-steps/CheckForm";
import BookingSuccess from "./booking-steps/BookingSuccess";
import PaymentStep from "./booking-steps/PaymentStep";

// Types
import { DateValue, parseDate } from "@internationalized/date";
import { Tour } from "@/app/_features/tours/tour-types";
import { Product } from "@/app/_features/products/types/product-types";

import {
  CustomerInformation,
  PaymentInformation,
  SlotDetail,
} from "@/app/_features/booking/types/booking-types";

// Api
import { createTourBookingv2 } from "../../api/create-booking/CreateTourBookingv2";

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
  const [paymentRefId, setPaymentRefId] = useState<string | null>(null);

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
  const [slotDetails, setSlotDetails] = useState<SlotDetail[]>([]);

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
  const [appliedPromo, setAppliedPromo] = useState<any>(null);

  useEffect(() => {
    if (selectedTour && selectedTour.id) {
      setCurrentStep(2);
    }
  }, [selectedTour]);

  const handlePromoApplied = (promoData: any) => {
    setAppliedPromo(promoData);
  };

  const handlePromoRemoved = () => {
    setAppliedPromo(null);
  };

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
    paymentId: string | null,
    existingBookingId: string | null
  ): Promise<{
    success: boolean;
    bookingId: string | null;
    email_response: any;
  }> => {
    if (existingBookingId) {
      return {
        success: true,
        bookingId: existingBookingId,
        email_response: null,
      };
    }

    if (!selectedTour?.id || !selectedDate) {
      throw new Error("Missing required tour or date information");
    }

    // Get secure calculation with server-side promo validation
    const secureCalculation = await calculateSecureTotal();

    // Format products data for the API
    const productsData = selectedProducts.map((productId) => {
      const product = availableProducts.find((p) => p.id === productId);
      const quantity = productQuantities[productId] || 1;
      const bookingProductId = product?.product_booking_id || "";
      return {
        product_id: productId,
        product_name: product?.name || "",
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
      total_price: secureCalculation.total,
      payment_method: paymentInformation.payment_method,
      payment_id: paymentId,
      products: productsData,
      slot_details: slotDetails,
      promo_code_id: appliedPromo?.id || null,
      promo_code: appliedPromo?.code || null,
      sub_total: secureCalculation.subtotal,
      discount_amount: secureCalculation.discountAmount,
    };

    console.log(bookingData);

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
            metadata: {
              booking_id: response.booking_id,
              payment_ref_id: response.email_response.payment_ref_id,
            },
          }),
        });

        return {
          success: true,
          bookingId: response.booking_id,
          email_response: response.email_response,
        };
      }
      return { success: false, bookingId: null, email_response: null };
    } catch (error) {
      console.error("Booking Error:", error);
      toast.error("Booking Failed", {
        description:
          "There was an error processing your booking. Please try again.",
      });
      return { success: false, bookingId: null, email_response: null };
    }
  };

  const calculateTotal = useCallback(() => {
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

    // Apply promo code discount if available
    if (appliedPromo) {
      total -= appliedPromo.discount_amount;
    }

    // Round to 2 decimal places to avoid floating point issues
    return Math.round(total * 100) / 100;
  }, [
    customSlotTypes,
    slotDetails,
    selectedTour,
    numberOfPeople,
    selectedProducts,
    productQuantities,
    availableProducts,
    appliedPromo,
  ]);

  const calculateSubtotal = useCallback(() => {
    let subtotal = 0;

    // Calculate tour price based on slot types if they exist
    if (customSlotTypes && customSlotTypes.length > 0) {
      // Sum up prices from slot details
      subtotal = slotDetails.reduce((sum, slot) => {
        const slotType = customSlotTypes.find(
          (type: CustomSlotType) => type.name === slot.type
        );
        return sum + (slotType?.price || 0);
      }, 0);
    } else {
      // Use regular tour rate if no custom slot types
      subtotal = selectedTour.rate * numberOfPeople;
    }

    // Add product prices
    selectedProducts.forEach((productId) => {
      const product = availableProducts.find((p) => p.id === productId);
      if (product) {
        const quantity = productQuantities[productId] || 1;
        subtotal += product.price * quantity;
      }
    });

    // Round to 2 decimal places to avoid floating point issues
    return Math.round(subtotal * 100) / 100;
  }, [
    customSlotTypes,
    slotDetails,
    selectedTour,
    numberOfPeople,
    selectedProducts,
    productQuantities,
    availableProducts,
  ]);

  // Secure calculation function that validates promo codes server-side
  const calculateSecureTotal = useCallback(async (): Promise<{
    subtotal: number;
    discountAmount: number;
    total: number;
    promoValidation: any;
  }> => {
    const subtotal = calculateSubtotal();

    if (!appliedPromo) {
      return {
        subtotal,
        discountAmount: 0,
        total: subtotal,
        promoValidation: null,
      };
    }

    try {
      // Validate promo code server-side and get secure discount calculation
      const response = await fetch("/api/validate-promo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: appliedPromo.code,
          totalAmount: subtotal,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // If promo validation fails, remove the promo and recalculate
        setAppliedPromo(null);
        toast.error("Promo code validation failed", {
          description:
            data.error || "Please try again or remove the promo code.",
        });
        return {
          subtotal,
          discountAmount: 0,
          total: subtotal,
          promoValidation: null,
        };
      }

      return {
        subtotal,
        discountAmount: data.promo.discount_amount,
        total: data.promo.final_amount,
        promoValidation: data.promo,
      };
    } catch (error) {
      console.error("Error validating promo code:", error);
      toast.error("Failed to validate promo code", {
        description: "Please try again or remove the promo code.",
      });
      return {
        subtotal,
        discountAmount: 0,
        total: subtotal,
        promoValidation: null,
      };
    }
  }, [calculateSubtotal, appliedPromo]);

  const fetchClientSecret = async (bookingId: string | null) => {
    if (isLoadingPayment) return;

    try {
      setIsLoadingPayment(true);

      // Get secure calculation with server-side promo validation
      const secureCalculation = await calculateSecureTotal();

      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(secureCalculation.total * 100),
          paymentIntentId: paymentIntentId || null,
          paymentRefId: paymentRefId || null,
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
    if (currentStep > 1) {
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
            appliedPromo={appliedPromo}
            onPromoApplied={handlePromoApplied}
            onPromoRemoved={handlePromoRemoved}
            calculateSubtotal={calculateSubtotal}
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
            calculateSubtotal={calculateSubtotal}
            calculateSecureTotal={calculateSecureTotal}
            isLoadingPayment={isLoadingPayment}
            setBookingId={setBookingId}
            setIsBookingComplete={setIsBookingComplete}
            appliedPromo={appliedPromo}
            setPaymentRefId={setPaymentRefId}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Left Section - Back Button */}
            <div className="flex items-center gap-4">
              {currentStep > 1 ? (
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 px-3 py-2 rounded-md font-medium"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="text-sm">Back</span>
                </Button>
              ) : (
                <div className="w-24" />
              )}
            </div>

            {/* Center Section - Title and Progress */}
            <div className="flex-1 flex flex-col items-center justify-center px-4">
              <div className="text-center max-w-2xl">
                <h1 className="text-lg lg:text-xl font-semibold text-gray-900 mb-1">
                  {currentStep === 1 && "Select Your Tour"}
                  {currentStep === 2 && "Choose Date & Time"}
                  {currentStep === 3 && "Complete Booking"}
                  {currentStep === 4 && "Complete Your Payment"}
                </h1>
                <p className="text-xs lg:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                  {currentStep === 1 &&
                    "Browse our curated tours and select your perfect adventure"}
                  {currentStep === 2 &&
                    "Pick your preferred date, time, and number of participants"}
                  {currentStep === 3 &&
                    "Enter your details and complete the booking process"}
                  {currentStep === 4 &&
                    "Complete your payment to confirm your booking"}
                </p>
              </div>
            </div>

            {/* Right Section - Progress and Close */}
            <div className="flex items-center gap-3">
              {/* Progress Indicator */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        currentStep >= step
                          ? "bg-blue-600 scale-125 shadow-sm"
                          : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-medium text-gray-500 hidden sm:block">
                  {currentStep}/4
                </span>
              </div>

              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseAttempt}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all duration-200 p-2 rounded-md"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-8">{renderStep()}</div>
        </div>
      </main>

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
