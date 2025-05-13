import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { PaymentFormProps } from "../types";
import { CARD_ELEMENT_OPTIONS } from "../constants";
import { ErrorDisplay } from "./ErrorDisplay";
import { createPaymentIntent } from "../services/payment";

export function PaymentForm({
  amount,
  onPaymentSuccess,
  onPaymentStart,
  onPaymentEnd,
  error,
  setError,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    onPaymentStart();
    setError(null);

    try {
      const { clientSecret } = await createPaymentIntent(amount);

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (result.error) {
        setError(result.error.message || "Payment failed");
      } else if (result.paymentIntent?.status === "succeeded") {
        onPaymentSuccess(result.paymentIntent.id);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      onPaymentEnd();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>

      {error && <ErrorDisplay message={error} />}

      <p className="text-xs text-gray-500 text-center">
        Your payment is secured by Stripe. We never store your card details.
      </p>
    </form>
  );
}
