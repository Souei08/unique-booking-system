export const PaymentAmount = ({ amount }: { amount: number }) => (
  <div className="mb-4">
    <p className="text-gray-600 mb-2">Amount to pay:</p>
    <p className="text-2xl font-bold text-gray-900">
      ${(amount / 100).toFixed(2)}
    </p>
  </div>
);
