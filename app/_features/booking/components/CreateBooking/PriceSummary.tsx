import React from "react";
import { Tour } from "@/app/_features/tours/types/TourTypes";
import { DateValue } from "@internationalized/date";

interface PriceSummaryProps {
  selectedTour: Tour | null;
  selectedDate: DateValue | null;
  calculateTotalPrice: () => number;
}

export const PriceSummary: React.FC<PriceSummaryProps> = ({
  selectedTour,
  selectedDate,
  calculateTotalPrice,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
        <div>
          <span className="text-sm text-gray-500">Total Price:</span>
          <span className="ml-2 text-xl font-bold text-brand">
            ${calculateTotalPrice()}
          </span>
        </div>
        <div className="text-sm text-gray-500 text-center sm:text-left">
          {selectedTour && (
            <span>
              {selectedTour.title} •{" "}
              {selectedDate?.toString() || "Date not selected"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
