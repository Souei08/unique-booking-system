import React from "react";
import { Tour } from "@/app/_features/tours/types/TourTypes";
import { DateValue } from "@internationalized/date";

interface AdditionalOption {
  id: number;
  name: string;
  price: number;
  description: string;
}

interface CustomerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface OverviewStepProps {
  selectedTour: Tour | null;
  selectedDate: DateValue | null;
  customerDetails: CustomerDetails;
  selectedOptions: number[];
  additionalOptions: AdditionalOption[];
  paymentMethod: "onArrival" | "stripe";
  calculateTotalPrice: () => number;
}

export const OverviewStep: React.FC<OverviewStepProps> = ({
  selectedTour,
  selectedDate,
  customerDetails,
  selectedOptions,
  additionalOptions,
  paymentMethod,
  calculateTotalPrice,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Booking Overview</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-medium text-lg mb-3">Tour Information</h3>
            {selectedTour ? (
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Tour:</span>{" "}
                  {selectedTour.title}
                </p>
                <p>
                  <span className="font-medium">Date:</span>{" "}
                  {selectedDate?.toString() || "Not selected"}
                </p>
                <p>
                  <span className="font-medium">Duration:</span>{" "}
                  {selectedTour.duration} days
                </p>
                <p>
                  <span className="font-medium">Base Price:</span> $
                  {selectedTour.rate}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">No tour selected</p>
            )}
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-medium text-lg mb-3">Customer Information</h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Name:</span>{" "}
                {customerDetails.firstName} {customerDetails.lastName}
              </p>
              <p>
                <span className="font-medium">Email:</span>{" "}
                {customerDetails.email}
              </p>
              <p>
                <span className="font-medium">Phone:</span>{" "}
                {customerDetails.phone}
              </p>
            </div>
          </div>

          {selectedOptions.length > 0 && (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="font-medium text-lg mb-3">Additional Options</h3>
              <div className="space-y-2">
                {selectedOptions.map((optionId) => {
                  const option = additionalOptions.find(
                    (opt) => opt.id === optionId
                  );
                  return option ? (
                    <div key={option.id} className="flex justify-between">
                      <span>{option.name}</span>
                      <span>${option.price}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-medium text-lg mb-3">Payment Information</h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Payment Method:</span>{" "}
                {paymentMethod === "onArrival"
                  ? "Pay on Arrival"
                  : "Pay with Card"}
              </p>
              {paymentMethod === "stripe" && (
                <p className="text-sm text-gray-500">
                  Your card will be charged securely via Stripe
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-lg mb-3">Price Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Base Price:</span>
              <span>${selectedTour?.rate || 0}</span>
            </div>

            {selectedOptions.length > 0 && (
              <>
                <div className="border-t border-gray-200 pt-2">
                  <p className="font-medium mb-1">Additional Options:</p>
                  {selectedOptions.map((optionId) => {
                    const option = additionalOptions.find(
                      (opt) => opt.id === optionId
                    );
                    return option ? (
                      <div
                        key={option.id}
                        className="flex justify-between text-sm"
                      >
                        <span>{option.name}</span>
                        <span>${option.price}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </>
            )}

            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span>Total Price:</span>
                <span>${calculateTotalPrice()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
