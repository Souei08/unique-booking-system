"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { createClient } from "@/supabase/client";

// Components
import { Button } from "@/components/ui/button";

// Icons
import { ChevronLeft } from "lucide-react";

// Booking Steps
import CheckForm from "../CreateBookingv2/booking-steps/CheckForm";
import BookingSuccess from "../CreateBookingv2/booking-steps/BookingSuccess";

// Types
import { DateValue } from "@internationalized/date";
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
import { CustomSlotType } from "../CreateBookingv2/booking-steps/SlotDetails";

interface QuickBookingProps {
  onClose: () => void;
  selectedTour: Tour;
  selectedDate: DateValue;
  selectedTime: string;
  onSuccess?: () => void;
}

const QuickBooking = ({
  onClose,
  selectedTour,
  selectedDate,
  selectedTime,
  onSuccess,
}: QuickBookingProps) => {
  const [isBookingComplete, setIsBookingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
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

  const customSlotTypes =
    selectedTour.custom_slot_types && selectedTour.custom_slot_types !== "[]"
      ? JSON.parse(selectedTour.custom_slot_types)
      : null;

  const customSlotFields =
    selectedTour.custom_slot_fields && selectedTour.custom_slot_fields !== "[]"
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
        quantity: quantity,
        unit_price: product?.price || 0,
      };
    });

    try {
      // Create booking first
      console.log("Creating booking");
      const bookingResponse = await createTourBookingv2({
        first_name: customerInformation.first_name,
        last_name: customerInformation.last_name,
        email: customerInformation.email,
        phone_number: customerInformation.phone_number,
        tour_id: selectedTour.id,
        booking_date: formatToDateString(selectedDate) || "",
        selected_time: selectedTime,
        slots: numberOfPeople,
        total_price: calculateTotal(),
        payment_method: paymentInformation.payment_method,
        payment_id: paymentId || null,
        products: productsData,
        slot_details: slotDetails,
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
      console.log("Creating payment link");
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
          booking_price: calculateTotal() * 100, // Convert to cents and ensure integer
          tourProducts: productsData.map((product) => ({
            name:
              availableProducts.find((p) => p.id === product.product_id)
                ?.name || "",
            quantity: product.quantity,
            unit_price: Math.round(product.unit_price * 100), // Convert to cents and ensure integer
          })),
          bookingTitle: selectedTour.title,
          slotDetails: slotDetails,
          customSlotTypes: customSlotTypes,
          customSlotFields: customSlotFields,
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

  if (isBookingComplete) {
    return (
      <BookingSuccess
        isAdmin={true}
        selectedTour={selectedTour}
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
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary text-primary-foreground font-semibold text-sm sm:text-base">
                1
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-strong">
                Complete Booking
              </h2>
            </div>
            <Button
              variant="ghost"
              onClick={onClose}
              className="flex items-center gap-2 text-muted-foreground hover:text-strong transition-colors w-full sm:w-auto justify-center sm:justify-start"
            >
              <ChevronLeft className="w-5 h-5" />
              Cancel
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent rounded-2xl sm:rounded-3xl" />
          <div className="relative p-4 sm:p-6">
            <CheckForm
              selectedTour={selectedTour}
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
            />
          </div>
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

export default QuickBooking;
