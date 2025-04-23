import React from "react";

interface PaymentStepProps {
  paymentMethod: "onArrival" | "stripe";
  setPaymentMethod: (method: "onArrival" | "stripe") => void;
}

export const PaymentStep: React.FC<PaymentStepProps> = ({
  paymentMethod,
  setPaymentMethod,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Payment Method</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className={`border rounded-lg p-6 cursor-pointer transition-all ${
            paymentMethod === "onArrival"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
          onClick={() => setPaymentMethod("onArrival")}
        >
          <div className="flex items-center">
            <input
              type="radio"
              checked={paymentMethod === "onArrival"}
              onChange={() => setPaymentMethod("onArrival")}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <div className="ml-3">
              <h3 className="font-medium">Pay on Arrival</h3>
              <p className="text-sm text-gray-600 mt-1">
                Pay when you arrive at the tour location
              </p>
            </div>
          </div>
        </div>
        <div
          className={`border rounded-lg p-6 cursor-pointer transition-all ${
            paymentMethod === "stripe"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
          onClick={() => setPaymentMethod("stripe")}
        >
          <div className="flex items-center">
            <input
              type="radio"
              checked={paymentMethod === "stripe"}
              onChange={() => setPaymentMethod("stripe")}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <div className="ml-3">
              <h3 className="font-medium">Pay with Card</h3>
              <p className="text-sm text-gray-600 mt-1">
                Secure payment via Stripe
              </p>
            </div>
          </div>
        </div>
      </div>

      {paymentMethod === "stripe" && (
        <div className="mt-6 p-4 border border-gray-200 rounded-lg">
          <h3 className="font-medium mb-3">Card Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="cardNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Card Number
              </label>
              <input
                type="text"
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="cardName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Cardholder Name
              </label>
              <input
                type="text"
                id="cardName"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="cardExpiry"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Expiry Date
              </label>
              <input
                type="text"
                id="cardExpiry"
                placeholder="MM/YY"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="cardCvv"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                CVV
              </label>
              <input
                type="text"
                id="cardCvv"
                placeholder="123"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
