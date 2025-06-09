import { PaymentElement } from "@stripe/react-stripe-js";
import { useState } from "react";
import { useElements } from "@stripe/react-stripe-js";
import { useStripe } from "@stripe/react-stripe-js";
import { toast } from "sonner";

export const StripePaymentFormV2 = ({
  onPaymentSuccess,
  handleCompleteBooking,
}: {
  onPaymentSuccess: (paymentId: string, bookingId: string) => void;
  handleCompleteBooking: (paymentId: string | null) => Promise<{
    success: boolean;
    bookingId: string | null;
  }>;
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(undefined);

    if (!stripe || !elements) {
      setErrorMessage("Payment system is not ready. Please try again.");
      setIsLoading(false);
      return;
    }

    try {
      // 1. Validate form fields (card inputs etc)
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(submitError.message);
        toast.error("Payment Form Error", {
          description: submitError.message,
        });
        setIsLoading(false);
        return;
      }

      // 2. Create booking and update metadata before confirming payment

      const bookingResult = await handleCompleteBooking(null);
      if (!bookingResult.success || !bookingResult.bookingId) {
        toast.error("Booking Failed", {
          description: "We couldn't finalize your booking before payment.",
        });
        setIsLoading(false);
        return;
      }

      // 3. Confirm the payment AFTER booking is fully processed and metadata updated
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (error) {
        console.log("Payment Error", error);
        setErrorMessage(error.message);
        toast.error("Payment Failed", {
          description: error.message,
        });
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Payment successful, update booking status
        onPaymentSuccess(paymentIntent.id, bookingResult.bookingId);
        toast.success("Payment Successful", {
          description: "Your booking has been confirmed.",
        });
      } else {
        // Handle other payment statuses
        setErrorMessage("Payment is still processing. Please wait...");
        toast.info("Payment Processing", {
          description: "Your payment is being processed. Please wait...",
        });
      }
    } catch (error) {
      console.log("Payment Error", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
      toast.error("Payment Error", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <PaymentElement />
      </div>
      {errorMessage && (
        <p className="text-red-500 mt-2 text-sm">{errorMessage}</p>
      )}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand/90 focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:outline-none disabled:bg-gray-400 disabled:hover:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300"
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Processing...
          </div>
        ) : (
          "Pay Now"
        )}
      </button>
    </form>
  );
};
