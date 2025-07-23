"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { createClient } from "@/supabase/client";
import { getUser } from "@/app/_api/actions/auth/actions";

// Components
import { Button } from "@/components/ui/button";

// Icons
import { ChevronLeft, X } from "lucide-react";

// Booking Steps
import CheckForm from "../CreateBookingv2/booking-steps/CheckForm";
import BookingSuccess from "../CreateBookingv2/booking-steps/BookingSuccess";
import AdminTourTimeAndDate from "../CreateBookingv2/booking-steps/AdminTourTimeAndDate";
import SelectTours from "../CreateBookingv2/booking-steps/SelectTours";

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

// Confirmation Dialog
import { AlertDialog } from "@/components/ui/dialog";

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
  const [selectedDate, setSelectedDate] = useState<DateValue | null>(
    initialSelectedDate || null
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
  const [authenticatedUser, setAuthenticatedUser] = useState<any>(null);

  const customSlotTypes =
    selectedTour?.custom_slot_types && selectedTour.custom_slot_types !== "[]"
      ? JSON.parse(selectedTour.custom_slot_types)
      : null;

  const customSlotFields =
    selectedTour?.custom_slot_fields && selectedTour.custom_slot_fields !== "[]"
      ? JSON.parse(selectedTour.custom_slot_fields)
      : [];

  // Get authenticated user on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getUser();
        console.log(user);
        setAuthenticatedUser(user);
      } catch (error) {
        console.error("Error fetching authenticated user:", error);
      }
    };
    fetchUser();
  }, []);

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

  // useEffect(() => {
  //   // Only update step if we're not already on step 3 and all info is available
  //   if (
  //     initialSelectedTour?.id &&
  //     initialSelectedDate &&
  //     initialSelectedTime &&
  //     currentStep !== 3
  //   ) {
  //     // Prevent infinite loop by checking if we're not already on step 3
  //     setCurrentStep(3);
  //   }
  // }, [initialSelectedTour, initialSelectedDate, initialSelectedTime]);

  const calculateTotal = useCallback(() => {
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
      total -= appliedPromo.discount_amount;
    }

    // Round to 2 decimal places to avoid floating point issues
    return Math.round(total * 100) / 100;
  }, [
    selectedTour,
    customSlotTypes,
    slotDetails,
    numberOfPeople,
    selectedProducts,
    productQuantities,
    availableProducts,
    appliedPromo,
  ]);

  const calculateSubtotal = useCallback(() => {
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
  }, [
    selectedTour,
    customSlotTypes,
    slotDetails,
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

    // Get secure calculation with server-side promo validation
    const secureCalculation = await calculateSecureTotal();

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
        sub_total: secureCalculation.subtotal,
        total_price: secureCalculation.total,
        payment_method: paymentInformation.payment_method,
        payment_id: paymentId || null,
        products: productsData,
        slot_details: slotDetails,
        promo_code_id: appliedPromo?.id || null,
        promo_code: appliedPromo?.code || null,
        discount_amount: secureCalculation.discountAmount,
        created_by: authenticatedUser?.id || "quick_booking",
      });

      if (!bookingResponse.success) {
        throw new Error("Failed to create booking");
      }

      const bookingId: string = bookingResponse.booking_id as string;
      if (!bookingId) {
        throw new Error("No booking ID returned");
      }

      setBookingId(bookingId);

      // Create payment link
      const paymentLinkResponse = await fetch("/api/create-payment-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(secureCalculation.total * 100), // Convert to cents and ensure integer
          email: customerInformation.email,
          name: `${customerInformation.first_name} ${customerInformation.last_name}`,
          phone: customerInformation.phone_number,
          booking_id: bookingId,
          payment_ref_id: bookingResponse.email_response.payment_ref_id,
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
        manage_link: `manage-booking?manage_token=${bookingResponse.email_response.manage_token}`,
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
                </h1>
                <p className="text-xs lg:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                  {currentStep === 1 &&
                    "Browse our curated tours and select your perfect adventure"}
                  {currentStep === 2 &&
                    "Pick your preferred date, time, and number of participants"}
                  {currentStep === 3 &&
                    "Enter your details and complete the booking process"}
                </p>
              </div>
            </div>

            {/* Right Section - Progress and Close */}
            <div className="flex items-center gap-3">
              {/* Progress Indicator */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3].map((step) => (
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
                  {currentStep}/3
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
          <div className="p-6 sm:p-8">
            {currentStep === 1 ? (
              <SelectTours
                setSelectedTour={handleTourSelect}
                handleNext={() => setCurrentStep(2)}
              />
            ) : currentStep === 2 ? (
              <AdminTourTimeAndDate
                selectedTour={selectedTour!}
                handleNext={() => setCurrentStep(3)}
                selectedDate={selectedDate || null}
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
                calculateSubtotal={calculateSubtotal}
              />
            )}
          </div>
        </div>
      </main>
      <AlertDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        type="error"
        config={{
          title: "Do you really want to exit?",
          message: "Exiting now will discard any unsaved changes.",
          confirmText: "Confirm",
          cancelText: "Cancel",
        }}
        onConfirm={handleConfirmClose}
        onCancel={() => setShowConfirmDialog(false)}
      />
    </div>
  );
};

export default QuickBooking;
