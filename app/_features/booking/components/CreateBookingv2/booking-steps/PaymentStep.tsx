import React, { useState, useEffect, useRef } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import { StripePaymentFormV2 } from "./StripePaymentFormv2";
import { CreditCard } from "lucide-react";
import {
  PaymentInformation,
  SlotDetail,
  CustomerInformation,
} from "@/app/_features/booking/types/booking-types";
import { Product } from "@/app/_features/products/types/product-types";
import { Tour } from "@/app/_features/tours/tour-types";
import { CustomSlotType, CustomSlotField } from "./SlotDetails";
import OrderSummary from "./OrderSummary";
import { DateValue } from "@internationalized/date";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

interface PaymentStepProps {
  fetchClientSecret: (bookingId: string | null) => void;
  clientSecret: string;
  paymentInformation: PaymentInformation;
  handleCompleteBooking: (
    paymentId: string | null,
    existingBookingId: string | null
  ) => Promise<{
    success: boolean;
    bookingId: string | null;
    email_response: any;
  }>;
  handleNext: () => void;
  handleBack: () => void;
  totalAmount: number;
  paymentIntentId: string;
  setPaymentIntentId: (id: string) => void;
  selectedProducts: string[];
  productQuantities: Record<string, number>;
  availableProducts: Product[];
  slotDetails: SlotDetail[];
  numberOfPeople: number;
  customSlotTypes: CustomSlotType[] | null;
  customSlotFields: CustomSlotField[] | null;
  selectedTour: Tour;
  customerInformation: CustomerInformation;
  selectedDate: DateValue;
  selectedTime: string;
  calculateTotal: () => number;
  calculateSubtotal: () => number;
  calculateSecureTotal: () => Promise<{
    subtotal: number;
    discountAmount: number;
    total: number;
    promoValidation: any;
  }>;
  isLoadingPayment: boolean;
  setBookingId: (id: string) => void;
  setIsBookingComplete: (complete: boolean) => void;
  appliedPromo?: any;
  setPaymentRefId: (id: string) => void;
}

const PaymentStep: React.FC<PaymentStepProps> = ({
  fetchClientSecret,
  clientSecret,
  paymentInformation,
  handleCompleteBooking,
  handleNext,
  handleBack,
  totalAmount,
  paymentIntentId,
  setPaymentIntentId,
  selectedProducts,
  productQuantities,
  availableProducts,
  slotDetails,
  numberOfPeople,
  customSlotTypes,
  customSlotFields,
  selectedTour,
  customerInformation,
  selectedDate,
  selectedTime,
  calculateTotal,
  calculateSubtotal,
  calculateSecureTotal,
  isLoadingPayment,
  setBookingId,
  setIsBookingComplete,
  appliedPromo,
  setPaymentRefId,
}) => {
  const hasFetchedRef = useRef(false);
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const [securePromoData, setSecurePromoData] = useState<{
    subtotal: number;
    discountAmount: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    stripePromise.then(() => setStripeLoaded(true));
  }, []);

  // Calculate secure promo data when appliedPromo changes
  useEffect(() => {
    const calculateSecurePromo = async () => {
      if (!appliedPromo) {
        setSecurePromoData(null);
        return;
      }

      try {
        const secureCalculation = await calculateSecureTotal();
        setSecurePromoData({
          subtotal: secureCalculation.subtotal,
          discountAmount: secureCalculation.discountAmount,
          total: secureCalculation.total,
        });
      } catch (error) {
        console.error("Error calculating secure promo:", error);
        setSecurePromoData(null);
      }
    };

    calculateSecurePromo();
  }, [appliedPromo, calculateSecureTotal]);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchClientSecret(null);
  }, [clientSecret]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
      <div className="space-y-8">
        {/* Main Content - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-12 items-start">
          {/* Card Payment Form */}
          <div className="md:col-span-2 rounded-2xl sm:rounded-3xl border bg-card shadow-lg p-4 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-strong mb-4 sm:mb-8">
              Card Payment Form
            </h2>

            <div className="space-y-4 sm:space-y-6">
              {isLoadingPayment ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                  <p className="text-muted-foreground">
                    Preparing payment form...
                  </p>
                </div>
              ) : clientSecret && stripeLoaded ? (
                <Elements
                  stripe={stripePromise}
                  options={{ clientSecret }}
                  key={clientSecret}
                >
                  <StripePaymentFormV2
                    onPaymentSuccess={async (
                      paymentId,
                      bookingId,
                      paymentRefId
                    ) => {
                      setBookingId(bookingId);
                      setIsBookingComplete(true);
                      setPaymentRefId(paymentRefId);
                    }}
                    handleCompleteBooking={handleCompleteBooking}
                  />
                </Elements>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <p className="text-muted-foreground text-center">
                    Unable to load payment form. Please try again.
                  </p>
                  <button
                    onClick={() => fetchClientSecret(null)}
                    className="px-4 py-2 text-sm font-medium text-primary hover:text-primary/90 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Payment Summary */}
          <OrderSummary
            selectedTour={selectedTour}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            numberOfPeople={numberOfPeople}
            selectedProducts={selectedProducts}
            productQuantities={productQuantities}
            availableProducts={availableProducts}
            slotDetails={slotDetails}
            customSlotTypes={customSlotTypes}
            customSlotFields={customSlotFields}
            totalAmount={
              securePromoData ? securePromoData.total : calculateTotal()
            }
            showGroupSizeControls={false}
            appliedPromo={appliedPromo}
            securePromoData={securePromoData}
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentStep;
