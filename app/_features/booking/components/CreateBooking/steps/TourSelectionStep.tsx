import React from "react";
import { Tour } from "@/app/_features/tours/types/TourTypes";
import { CheckIcon } from "@heroicons/react/24/outline";

interface TourSelectionStepProps {
  tours: Tour[];
  selectedTour: Tour | null;
  setSelectedTour: (tour: Tour | null) => void;
}

export const TourSelectionStep: React.FC<TourSelectionStepProps> = ({
  tours,
  selectedTour,
  setSelectedTour,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Select a Tour</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tours.map((tour) => (
          <div
            key={tour.id}
            className={`relative p-6 rounded-lg border-2 transition-all cursor-pointer ${
              selectedTour?.id === tour.id
                ? "border-brand bg-brand-light"
                : "border-gray-200 hover:border-brand"
            }`}
            onClick={() =>
              setSelectedTour(selectedTour?.id === tour.id ? null : tour)
            }
          >
            {selectedTour?.id === tour.id && (
              <div className="absolute top-2 right-2">
                <CheckIcon className="w-6 h-6 text-brand" />
              </div>
            )}
            <h3 className="text-lg font-semibold mb-2">{tour.title}</h3>
            <p className="text-gray-600 mb-4 line-clamp-2">
              {tour.description}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-brand font-semibold">
                ${tour.rate.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
