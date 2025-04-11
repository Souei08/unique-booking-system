import { StepProps } from "../types";

export default function PreviewStep({ watch, selectedTour }: StepProps) {
  const total_price = watch("spots") * (selectedTour?.rate || 0);

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="font-medium text-lg">Tour Details</h3>
        <div className="mt-2 space-y-1">
          <p>
            <span className="font-medium">Tour:</span> {selectedTour?.title}
          </p>
          <p>
            <span className="font-medium">Date:</span> {watch("date")}
          </p>
          <p>
            <span className="font-medium">Time:</span> {watch("start_time")}
          </p>
          <p>
            <span className="font-medium">Spots:</span> {watch("spots")}
          </p>
          <p>
            <span className="font-medium">Price per person:</span> $
            {selectedTour?.rate}
          </p>
          <p>
            <span className="font-medium">Total Price:</span> ${total_price}
          </p>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="font-medium text-lg">Customer Information</h3>
        <div className="mt-2 space-y-1">
          <p>
            <span className="font-medium">Name:</span> {watch("customerName")}
          </p>
          <p>
            <span className="font-medium">Email:</span> {watch("customerEmail")}
          </p>
          <p>
            <span className="font-medium">Phone:</span> {watch("customerPhone")}
          </p>
          <p>
            <span className="font-medium">Address:</span>{" "}
            {watch("customerAddress")}
          </p>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="font-medium text-lg">Payment Information</h3>
        <div className="mt-2 space-y-1">
          <p>
            <span className="font-medium">Card Number:</span> **** **** ****{" "}
            {watch("cardNumber")?.slice(-4)}
          </p>
          <p>
            <span className="font-medium">Expiry:</span> {watch("cardExpiry")}
          </p>
          <p>
            <span className="font-medium">Cardholder:</span> {watch("cardName")}
          </p>
        </div>
      </div>
    </div>
  );
}
