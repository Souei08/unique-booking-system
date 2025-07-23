"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

// Booking Steps
import ManageCheckForm from "./manage-steps/ManageCheckForm";
import BookingSuccess from "@/app/_features/booking/components/CreateBookingv2/booking-steps/BookingSuccess";
import PaymentStep from "@/app/_features/booking/components/CreateBookingv2/booking-steps/PaymentStep";
import OriginalBookingDetails from "./manage-steps/OriginalBookingDetails";

// Types
import { DateValue, parseDate } from "@internationalized/date";
import { Tour } from "@/app/_features/tours/tour-types";
import { Product } from "@/app/_features/products/types/product-types";
import { BookingTable } from "@/app/_features/booking/types/booking-types";

import {
  CustomerInformation,
  PaymentInformation,
  SlotDetail,
} from "@/app/_features/booking/types/booking-types";

// Api
import { createTourBookingv2 } from "@/app/_features/booking/api/create-booking/CreateTourBookingv2";
import { createTourAdditionalBooking } from "./api/CreateTourAddtionalBooking";

// Utils
import { formatToDateString } from "@/app/_lib/utils/utils";
import { CustomSlotType } from "@/app/_features/booking/components/CreateBookingv2/booking-steps/SlotDetails";
import { getOneBooking } from "../booking/api/get-booking/getOneBooking";
import { getTourById } from "../tours/api/getOneTour";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Plus,
  Calendar,
  Clock,
  Users,
  CreditCard,
} from "lucide-react";

const ManageAdditionalBooking = ({
  customerSelectedTour,
}: {
  onClose?: () => void;
  customerSelectedTour?: Tour;
  initialDate?: Date;
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [isBookingComplete, setIsBookingComplete] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [paymentRefId, setPaymentRefId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const token = searchParams.get("manage_token")?.trim() || null;

  // Original booking data
  const [originalBooking, setOriginalBooking] = useState<BookingTable | null>(
    null
  );

  // Tour and date/time data
  const [selectedTour, setSelectedTour] = useState<Tour>(
    customerSelectedTour || ({} as Tour)
  );
  const [selectedDate, setSelectedDate] = useState<DateValue>(
    parseDate(new Date().toISOString().split("T")[0])
  );
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [numberOfPeople, setNumberOfPeople] = useState<number>(0);
  const [slotDetails, setSlotDetails] = useState<SlotDetail[]>([]);

  // Customer and payment information
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

  // Step titles for navigation
  const stepTitles = ["Original Booking", "Add Services", "Payment"];

  useEffect(() => {
    const fetchBooking = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const bookingData = await getOneBooking(null, token);

        if (bookingData) {
          // Debug: Log the booking data structure
          console.log("Original booking data:", bookingData);
          console.log(
            "Booking ID field:",
            bookingData.booking_id || bookingData.id
          );

          // Ensure we have a plain object by converting the response
          const plainBookingData = JSON.parse(JSON.stringify(bookingData));
          setOriginalBooking(plainBookingData);

          const tour = await getTourById(bookingData.tour_id);

          if (tour) {
            // Ensure tour data is also a plain object
            const plainTourData = JSON.parse(JSON.stringify(tour));
            setSelectedTour(plainTourData);
            setSelectedDate(parseDate(bookingData.booking_date));
            setSelectedTime(bookingData.selected_time);
            // setNumberOfPeople(bookingData.slots);

            // Pre-fill customer information from original booking
            setCustomerInformation({
              first_name: bookingData.first_name || "",
              last_name: bookingData.last_name || "",
              email: bookingData.email || "",
              phone_number: bookingData.phone_number || "",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching booking data:", error);
        toast.error("Failed to load booking information");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooking();
  }, [token]);

  // Update slot details when selectedTour changes
  useEffect(() => {
    if (
      selectedTour?.custom_slot_types &&
      selectedTour.custom_slot_types !== "[]" &&
      selectedTour.custom_slot_types !== "undefined"
    ) {
      try {
        const customTypes = JSON.parse(selectedTour.custom_slot_types);
        if (customTypes && customTypes.length > 0) {
          setSlotDetails([
            {
              type: customTypes[0].name,
              price: customTypes[0].price,
            },
          ]);
        }
      } catch (error) {
        console.error("Error parsing custom slot types:", error);
        // Set default slot details if parsing fails
        setSlotDetails([]);
      }
    } else {
      // Set default slot details if no custom types
      setSlotDetails([]);
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
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  // Parse custom slot types and fields with error handling
  const customSlotTypes = (() => {
    if (
      selectedTour?.custom_slot_types &&
      selectedTour.custom_slot_types !== "[]" &&
      selectedTour.custom_slot_types !== "undefined"
    ) {
      try {
        return JSON.parse(selectedTour.custom_slot_types);
      } catch (error) {
        console.error("Error parsing custom slot types:", error);
        return null;
      }
    }
    return null;
  })();

  const customSlotFields = (() => {
    if (
      selectedTour?.custom_slot_fields &&
      selectedTour.custom_slot_fields !== "[]" &&
      selectedTour.custom_slot_fields !== "undefined"
    ) {
      try {
        return JSON.parse(selectedTour.custom_slot_fields);
      } catch (error) {
        console.error("Error parsing custom slot fields:", error);
        return [];
      }
    }
    return [];
  })();

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

    // Validate original booking data
    if (!originalBooking) {
      throw new Error("Original booking data is missing");
    }

    if (!originalBooking.booking_id) {
      throw new Error("Booking ID is missing from original booking data");
    }

    if (!selectedTour?.id || !selectedDate) {
      throw new Error("Missing required tour or date information");
    }

    // Get secure calculation with server-side promo validation
    const secureCalculation = await calculateSecureTotal();

    // Format products data for the additional booking API
    const productsData = selectedProducts.map((productId) => {
      const product = availableProducts.find((p) => p.id === productId);
      const quantity = productQuantities[productId] || 1;
      return {
        product_id: productId,
        quantity: quantity,
        unit_price: product?.price || 0,
      };
    });

    // Format slot details for the API
    const slotDetailsData = slotDetails.reduce(
      (acc, slot, index) => {
        acc[`slot_${index + 1}`] = {
          type: slot.type,
          price: slot.price,
        };
        return acc;
      },
      {} as Record<string, any>
    );

    const additionalBookingData = {
      booking_id: originalBooking.booking_id,
      added_slots: numberOfPeople,
      note: `Additional booking for ${selectedTour.title} on ${formatToDateString(selectedDate)} at ${selectedTime}`,
      sub_total: secureCalculation.subtotal,
      discount_amount: secureCalculation.discountAmount,
      payment_method: paymentInformation.payment_method,
      payment_id: paymentId,

      full_name:
        customerInformation.first_name + " " + customerInformation.last_name,
      email: customerInformation.email,
      phone_number: customerInformation.phone_number,
      booking_date: selectedDate.toString() || "",
      selected_time: selectedTime,
      slots: numberOfPeople,
      total_price: secureCalculation.total,
      booking_reference_id: originalBooking.reference_number,
      tour_name: selectedTour.title,
      tour_rate: selectedTour.rate,
      manage_token: token || "",
      products: productsData,
      slot_details: slotDetailsData,
    };

    try {
      // Create additional booking
      const response = await createTourAdditionalBooking(additionalBookingData);

      if (response && response.success) {
        // Update payment intent metadata BEFORE confirming the payment
        if (paymentIntentId) {
          await fetch("/api/update-payment-intent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paymentIntentId: paymentIntentId,
              metadata: {
                booking_id: originalBooking.booking_id,
                additional_id: response.additional_id,
                payment_ref_id: response.payment_ref_id,
              },
            }),
          });
        }

        return {
          success: true,
          bookingId: originalBooking.booking_id, // Return original booking ID
          email_response: response.email_response,
        };
      }
      return { success: false, bookingId: null, email_response: null };
    } catch (error) {
      console.error("Additional Booking Error:", error);
      toast.error("Additional Booking Failed", {
        description:
          "There was an error processing your additional booking. Please try again.",
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

      // Get the correct booking ID with fallback
      const originalBookingId =
        originalBooking?.booking_id || originalBooking?.id;

      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(secureCalculation.total * 100),
          paymentIntentId: paymentIntentId || null,
          bookingId: originalBookingId || bookingId || null, // Use original booking ID for additional bookings
          paymentRefId: paymentRefId || null,
          name:
            customerInformation.first_name +
            " " +
            customerInformation.last_name,
          email: customerInformation.email,
          phone: customerInformation.phone_number,
          metadata: {
            booking_type: "additional",
            original_booking_id: originalBookingId,
          },
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

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
          <p className="text-strong">Loading booking information...</p>
        </div>
      </div>
    );
  }

  // Show error if no token or no booking data
  if (!token || !selectedTour?.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center p-8">
          <div className="mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-strong mb-2">
              Invalid Booking Link
            </h2>
            <p className="text-muted-foreground mb-6">
              The booking link is invalid or has expired.
            </p>
            <Button onClick={handleGoBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (isBookingComplete) {
    return (
      <BookingSuccess
        isAdmin={false}
        selectedTour={selectedTour!}
        selectedDate={selectedDate!}
        selectedTime={selectedTime}
        bookingId={bookingId || ""}
        onClose={() => {}}
      />
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <OriginalBookingDetails
            booking={originalBooking}
            tour={selectedTour}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <ManageCheckForm
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
            handleBack={handleBack}
            calculateTotal={calculateTotal}
            appliedPromo={appliedPromo}
            onPromoApplied={handlePromoApplied}
            onPromoRemoved={handlePromoRemoved}
            isAdmin={false}
            isLoading={false}
            calculateSubtotal={calculateSubtotal}
            originalBooking={originalBooking}
          />
        );
      case 3:
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back Button and Title */}
            <div className="flex items-center space-x-4">
              {currentStep > 1 && (
                <Button
                  onClick={handleBack}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Additional Booking
                  </h1>
                  <p className="text-sm text-gray-500">
                    Add more services to your existing booking
                  </p>
                </div>
              </div>
            </div>

            {/* Step Indicator */}
            <div className="hidden md:flex items-center space-x-8">
              {stepTitles.map((title, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        currentStep > index + 1
                          ? "bg-green-500 text-white"
                          : currentStep === index + 1
                            ? "bg-blue-500 text-white"
                            : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {currentStep > index + 1 ? "✓" : index + 1}
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        currentStep >= index + 1
                          ? "text-gray-900"
                          : "text-gray-500"
                      }`}
                    >
                      {title}
                    </span>
                  </div>
                  {index < stepTitles.length - 1 && (
                    <div className="w-8 h-px bg-gray-300" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Step Indicator */}
        <div className="md:hidden mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              {stepTitles.map((title, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2 ${
                      currentStep > index + 1
                        ? "bg-green-500 text-white"
                        : currentStep === index + 1
                          ? "bg-blue-500 text-white"
                          : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {currentStep > index + 1 ? "✓" : index + 1}
                  </div>
                  <span
                    className={`text-xs font-medium text-center ${
                      currentStep >= index + 1
                        ? "text-gray-900"
                        : "text-gray-500"
                    }`}
                  >
                    {title}
                  </span>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300 ease-out"
                style={{
                  width: `${((currentStep - 1) / (stepTitles.length - 1)) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="relative">{renderStep()}</div>
      </div>
    </div>
  );
};

export default ManageAdditionalBooking;
