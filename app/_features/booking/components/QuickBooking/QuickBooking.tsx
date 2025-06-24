"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { createClient } from "@/supabase/client";

// Components
import { Button } from "@/components/ui/button";
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

// Icons
import { ChevronLeft } from "lucide-react";

// Booking Steps
import CheckForm from "../CreateBookingv2/booking-steps/CheckForm";
import BookingSuccess from "../CreateBookingv2/booking-steps/BookingSuccess";
import TourTimeAndDate from "../CreateBookingv2/booking-steps/TourTimeAndDate";
import SelectTours from "../CreateBookingv2/booking-steps/SelectTours";
import PromoCodeInput from "../CreateBookingv2/booking-steps/PromoCodeInput";

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
import { sendBookingConfirmationEmail } from "../../api/email-booking/send-confirmation-email";

// Utils
import { formatToDateString } from "@/app/_lib/utils/utils";
import { CustomSlotType } from "../CreateBookingv2/booking-steps/SlotDetails";

interface QuickBookingProps {
  onClose: () => void;
  selectedTour: Tour | null;
  selectedDate: DateValue | null;
  selectedTime: string | null;
  onSuccess?: () => void;
}

const QuickBooking = ({
  onClose,
  selectedTour: initialSelectedTour,
  selectedDate: initialSelectedDate,
  selectedTime: initialSelectedTime,
  onSuccess,
}: QuickBookingProps) => {
  // Determine initial step based on provided information
  const getInitialStep = () => {
    if (initialSelectedTour?.id && initialSelectedDate && initialSelectedTime) {
      return 3; // Skip to last step if all info is provided
    } else if (initialSelectedTour?.id) {
      return 2; // Skip to date/time selection if only tour is provided
    }
    return 1; // Start with tour selection if nothing is provided
  };

  const [currentStep, setCurrentStep] = useState(getInitialStep());
  const [isBookingComplete, setIsBookingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [numberOfPeople, setNumberOfPeople] = useState<number>(1);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<DateValue>(
    initialSelectedDate || parseDate(new Date().toISOString().split("T")[0])
  );
  const [selectedTime, setSelectedTime] = useState<string>(
    initialSelectedTime || ""
  );
  const [selectedTour, setSelectedTour] = useState<Tour | null>(
    initialSelectedTour
  );
  const [slotDetails, setSlotDetails] = useState<SlotDetail[]>([]);

  // Customer and Payment Information
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

  // Products state
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [productQuantities, setProductQuantities] = useState<
    Record<string, number>
  >({});
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [appliedPromo, setAppliedPromo] = useState<any>(null);

  const customSlotTypes =
    selectedTour?.custom_slot_types && selectedTour.custom_slot_types !== "[]"
      ? JSON.parse(selectedTour.custom_slot_types)
      : null;

  const customSlotFields =
    selectedTour?.custom_slot_fields && selectedTour.custom_slot_fields !== "[]"
      ? JSON.parse(selectedTour.custom_slot_fields)
      : [];

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

  // Update step if all required information becomes available
  useEffect(() => {
    // Only update step if we're not already on step 3 and all info is available
    if (
      initialSelectedTour?.id &&
      initialSelectedDate &&
      initialSelectedTime &&
      currentStep !== 3
    ) {
      // Prevent infinite loop by checking if we're not already on step 3
      setCurrentStep(3);
    }
  }, [initialSelectedTour, initialSelectedDate, initialSelectedTime]);

  const calculateTotal = () => {
    let total = 0;

    if (!selectedTour) return total;

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
      total = appliedPromo.final_amount;
    }

    // Round to 2 decimal places to avoid floating point issues
    return Math.round(total * 100) / 100;
  };

  const calculateSubtotal = () => {
    let total = 0;

    if (!selectedTour) return total;

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

  const handlePromoApplied = (promoData: any) => {
    setAppliedPromo(promoData);
  };

  const handlePromoRemoved = () => {
    setAppliedPromo(null);
  };

  const handleCompleteBooking = async (paymentId: string | null) => {
    if (!selectedTour?.id || !selectedDate) {
      toast.error("Missing Information", {
        description: "Required tour or date information is missing.",
      });
      return;
    }

    setIsLoading(true);

    // Format products data for the API
    const productsData = selectedProducts.map((productId) => {
      const product = availableProducts.find((p) => p.id === productId);
      const quantity = productQuantities[productId] || 1;
      return {
        product_id: productId,
        product_name: product?.name || "",
        quantity: quantity,
        unit_price: product?.price || 0,
        description: product?.description || "",
        images: product?.image_url || "",
      };
    });

    try {
      // Create booking first
      const bookingResponse = await createTourBookingv2({
        first_name: customerInformation.first_name,
        last_name: customerInformation.last_name,
        email: customerInformation.email,
        phone_number: customerInformation.phone_number,
        tour_id: selectedTour.id,
        booking_date: formatToDateString(selectedDate) || "",
        selected_time: selectedTime,
        slots: numberOfPeople,
        sub_total: calculateSubtotal(),
        total_price: calculateTotal(),
        payment_method: paymentInformation.payment_method,
        payment_id: paymentId || null,
        products: productsData,
        slot_details: slotDetails,
        promo_code_id: appliedPromo?.id || null,
        promo_code: appliedPromo?.code || null,
        discount_amount: appliedPromo?.discount_amount || null,
      });

      if (!bookingResponse.success) {
        throw new Error("Failed to create booking");
      }

      const bookingId: string = bookingResponse.booking_id as string;
      if (!bookingId) {
        throw new Error("No booking ID returned");
      }

      console.log("Booking created successfully:", bookingResponse);
      setBookingId(bookingId);

      // Create payment link
      const paymentLinkResponse = await fetch("/api/create-payment-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(calculateTotal() * 100), // Convert to cents and ensure integer
          email: customerInformation.email,
          name: `${customerInformation.first_name} ${customerInformation.last_name}`,
          phone: customerInformation.phone_number,
          booking_id: bookingId,
          slots: numberOfPeople,
          booking_price: selectedTour.rate, // Convert to cents and ensure integer
          tourProducts: productsData.map((product) => ({
            name:
              availableProducts.find((p) => p.id === product.product_id)
                ?.name || "",
            quantity: product.quantity,
            description: product.description,
            images: product.images,
            unit_price: Math.round(product.unit_price * 100), // Convert to cents and ensure integer
          })),
          bookingTitle: selectedTour.title,
          bookingImage:
            JSON.parse(selectedTour.images).find(
              (image: any) => image.isFeature
            )?.url || "",
          bookingDescription: selectedTour.description,
          slotDetails: slotDetails,
          customSlotTypes: customSlotTypes,
          customSlotFields: customSlotFields,
          discounts: appliedPromo?.stripe_coupon_id
            ? [{ coupon: appliedPromo.stripe_coupon_id }]
            : undefined,
        }),
      });

      if (!paymentLinkResponse.ok) {
        const errorData = await paymentLinkResponse.json();
        throw new Error(errorData.error || "Failed to create payment link");
      }

      const { checkoutUrl } = await paymentLinkResponse.json();

      const supabase = createClient();
      await supabase
        .from("tour_bookings")
        .update({ payment_link: checkoutUrl })
        .eq("id", bookingId);

      await sendBookingConfirmationEmail({
        full_name: bookingResponse.email_response.full_name,
        email: bookingResponse.email_response.email,
        booking_date: bookingResponse.email_response.booking_date,
        selected_time: bookingResponse.email_response.selected_time,
        slots: bookingResponse.email_response.slots,
        total_price: bookingResponse.email_response.total_price,
        booking_reference_id:
          bookingResponse.email_response.booking_reference_id,
        tour_name: bookingResponse.email_response.tour_name,
        tour_rate: bookingResponse.email_response.tour_rate,
        products: bookingResponse.email_response.products,
        slot_details: bookingResponse.email_response.slot_details,
        manage_token: bookingResponse.email_response.manage_token,
        waiver_link: "https://your-waiver-link.com",
        sub_total: bookingResponse.email_response.sub_total,
        coupon_code: appliedPromo?.code || null,
        discount_amount: bookingResponse.email_response.discount_amount,
      });

      toast.success("Booking Created", {
        description: "A payment link has been generated for the customer.",
      });

      setIsBookingComplete(true);
      onSuccess?.();
    } catch (error) {
      console.error("Booking Error:", error);
      toast.error("Booking Failed", {
        description:
          error instanceof Error
            ? error.message
            : "There was an error processing your booking. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add handler for back navigation
  const handleBack = () => {
    if (currentStep > 1) {
      // If we're on step 3 and all info is available, stay on step 3
      if (
        currentStep === 3 &&
        selectedTour?.id &&
        selectedDate &&
        selectedTime
      ) {
        return;
      }
      setCurrentStep(currentStep - 1);
    } else {
      onClose();
    }
  };

  // Add handler for close attempt
  const handleCloseAttempt = () => {
    if (currentStep > 1) {
      setShowConfirmDialog(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setShowConfirmDialog(false);
    onClose();
  };

  // Add handler for tour selection
  const handleTourSelect = (tour: Tour) => {
    setSelectedTour(tour);
    // If date and time are already selected, go to last step
    if (selectedDate && selectedTime) {
      setCurrentStep(3);
    } else {
      setCurrentStep(2);
    }
  };

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

  // Add handler for time selection
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  if (isBookingComplete) {
    return (
      <BookingSuccess
        isAdmin={true}
        selectedTour={selectedTour!}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        bookingId={bookingId || ""}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="">
        {/* Progress Bar */}
        <div className="mb-4 md:mb-8 lg:mb-12 px-3 md:px-6">
          <div className="flex flex-col gap-2 md:gap-6 mb-3 md:mb-4">
            <div className="flex items-center justify-between">
              {currentStep > 1 &&
              !(
                currentStep === 3 &&
                selectedTour?.id &&
                selectedDate &&
                selectedTime
              ) ? (
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
                </h2>

                <div className="flex items-center justify-center w-6 h-6 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-full bg-strong text-primary-foreground font-semibold text-xs md:text-base">
                  {currentStep}
                </div>
              </div>
            </div>
          </div>
          <div className="relative h-1 md:h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-brand dark:bg-brand transition-all duration-300 ease-in-out"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent rounded-2xl sm:rounded-3xl" />
          <div className="relative p-4 sm:p-6">
            {currentStep === 1 ? (
              <SelectTours
                setSelectedTour={handleTourSelect}
                handleNext={() => setCurrentStep(2)}
              />
            ) : currentStep === 2 ? (
              <TourTimeAndDate
                selectedTour={selectedTour!}
                handleNext={() => setCurrentStep(3)}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                setSelectedDate={handleDateChange}
                setSelectedTime={handleTimeSelect}
                numberOfPeople={numberOfPeople}
                setNumberOfPeople={setNumberOfPeople}
                customSlotTypes={customSlotTypes}
                setSlotDetails={setSlotDetails}
                slotDetails={slotDetails}
              />
            ) : (
              <CheckForm
                selectedTour={selectedTour!}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                numberOfPeople={numberOfPeople}
                customerInformation={customerInformation}
                paymentInformation={paymentInformation}
                setPaymentInformation={setPaymentInformation}
                setCustomerInformation={setCustomerInformation}
                handleCompleteBooking={handleCompleteBooking}
                selectedProducts={selectedProducts}
                setSelectedProducts={setSelectedProducts}
                productQuantities={productQuantities}
                setProductQuantities={setProductQuantities}
                availableProducts={availableProducts}
                setAvailableProducts={setAvailableProducts}
                isAdmin={true}
                isLoading={isLoading}
                setNumberOfPeople={setNumberOfPeople}
                calculateTotal={calculateTotal}
                setSlotDetails={setSlotDetails}
                slotDetails={slotDetails}
                customSlotTypes={customSlotTypes}
                customSlotFields={customSlotFields}
                handleNext={() => {}}
                appliedPromo={appliedPromo}
                onPromoApplied={handlePromoApplied}
                onPromoRemoved={handlePromoRemoved}
              />
            )}
          </div>
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

export default QuickBooking;
