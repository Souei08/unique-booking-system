import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe } from "@stripe/react-stripe-js";
import { PaymentAmount } from "./components/PaymentAmount";
import { PaymentForm } from "./components/PaymentForm";
import { StripePaymentProps } from "./types";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

function StripePaymentContent({
  amount,
  onPaymentSuccess,
}: StripePaymentProps) {
  const stripe = useStripe();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePaymentStart = () => setLoading(true);
  const handlePaymentEnd = () => setLoading(false);

  return (
    <div className="w-full space-y-6">
      <PaymentAmount amount={amount} />

      <PaymentForm
        amount={amount}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentStart={handlePaymentStart}
        onPaymentEnd={handlePaymentEnd}
        error={error}
        setError={setError}
      />
    </div>
  );
}

export function StripePayment(props: StripePaymentProps) {
  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Payment Details
      </h2>
      <Elements stripe={stripePromise}>
        <StripePaymentContent {...props} />
      </Elements>
    </div>
  );
}
