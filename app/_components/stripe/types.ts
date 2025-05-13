export interface PaymentFormProps {
  amount: number;
  onPaymentSuccess: (paymentId: string) => void;
  onPaymentStart: () => void;
  onPaymentEnd: () => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export interface StripePaymentProps {
  amount: number;
  onPaymentSuccess: (paymentId: string) => void;
}
