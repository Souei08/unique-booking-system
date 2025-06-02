import { PaymentElement } from "@stripe/react-stripe-js";
import { useState } from "react";
import { useElements } from "@stripe/react-stripe-js";
import { useStripe } from "@stripe/react-stripe-js";
import { toast } from "sonner";

export const StripePaymentFormV2 = ({
  onPaymentSuccess,
}: {
  onPaymentSuccess: (paymentId: string) => void;
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
      // First, validate the form
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(submitError.message);
        toast.error("Payment Form Error", {
          description: submitError.message,
        });
        setIsLoading(false);
        return;
      }

      // Then, process the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message);
        toast.error("Payment Failed", {
          description: error.message,
        });
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Payment successful, update booking status
        onPaymentSuccess(paymentIntent.id);
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
      <PaymentElement />
      {errorMessage && (
        <p className="text-red-500 mt-2 text-sm">{errorMessage}</p>
      )}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-6 mt-4 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing Payment...
          </div>
        ) : (
          "Complete Payment"
        )}
      </button>
    </form>
  );
};
