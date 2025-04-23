import React, { useState, useEffect } from "react";
import { Tour } from "@/app/_features/tours/types/TourTypes";
import { DateValue } from "@internationalized/date";
import { RenderCalendar } from "@/app/_components/calendar-v2/RenderCalendar";
import {
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  LanguageIcon,
  SparklesIcon,
  TicketIcon,
  MapPinIcon,
  CheckCircleIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

import {
  getRemainingSlots,
  getRecurringSchedules,
} from "@/app/_api/actions/schedule/actions";

import { format } from "date-fns";

import { allWeekdays } from "@/app/_features/tours/forms/tour-schedule/types";

interface DateSelectionStepProps {
  selectedTour: Tour | null;
  selectedDate: DateValue | null;
  setSelectedDate: (date: DateValue | null) => void;
  selectedSlots?: number;
  setSelectedSlots?: (slots: number) => void;
}

export const DateSelectionStep: React.FC<DateSelectionStepProps> = ({
  selectedTour,
  selectedDate,
  setSelectedDate,
  selectedSlots: externalSelectedSlots,
  setSelectedSlots: externalSetSelectedSlots,
}) => {
  // Internal state for slots if external state is not provided
  const [internalSelectedSlots, setInternalSelectedSlots] = useState<number>(1);

  // Use external state if provided, otherwise use internal state
  const selectedSlots =
    externalSelectedSlots !== undefined
      ? externalSelectedSlots
      : internalSelectedSlots;
  const setSelectedSlots = externalSetSelectedSlots || setInternalSelectedSlots;

  const [availableSlots, setAvailableSlots] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [availableWeekdays, setAvailableWeekdays] = useState<
    { day: string; isActive: boolean }[]
  >([]);

  // Fetch available weekdays when tour changes
  useEffect(() => {
    const fetchAvailableWeekdays = async () => {
      if (selectedTour) {
        try {
          // Get recurring schedules for the tour
          const schedules = await getRecurringSchedules(selectedTour.id);

          // Create a map of active weekdays
          const activeWeekdays = new Set(
            schedules.map((schedule) => schedule.weekday)
          );

          // Create the daysOfWeek array with active status
          const daysOfWeek = allWeekdays.map((day) => ({
            day,
            isActive: activeWeekdays.has(day),
          }));

          setAvailableWeekdays(daysOfWeek);
        } catch (err) {
          console.error("Error fetching available weekdays:", err);
          // Fallback to all days active if there's an error
          setAvailableWeekdays(
            allWeekdays.map((day) => ({ day, isActive: true }))
          );
        }
      } else {
        // If no tour is selected, all days are active by default
        setAvailableWeekdays(
          allWeekdays.map((day) => ({ day, isActive: true }))
        );
      }
    };

    fetchAvailableWeekdays();
  }, [selectedTour]);

  // Update available slots when date changes
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (selectedTour && selectedDate) {
        setIsLoading(true);
        setError(null);

        try {
          // Convert DateValue to string format YYYY-MM-DD
          const dateString = selectedDate.toString();

          // Get remaining slots from API
          const result = await getRemainingSlots(
            selectedTour.id,
            dateString,
            "09:00" // Default start time, could be made dynamic if needed
          );

          if (result.success) {
            setAvailableSlots(result.remaining);

            // Reset selected slots if it exceeds available slots
            if (selectedSlots > result.remaining) {
              setSelectedSlots(result.remaining);
            }
          } else {
            setError(result.message || "Failed to fetch available slots");
            setAvailableSlots(0);
          }
        } catch (err) {
          console.error("Error fetching available slots:", err);
          setError("An error occurred while fetching available slots");
          setAvailableSlots(0);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchAvailableSlots();
  }, [selectedTour, selectedDate]);

  // Handle slot changes safely
  const handleSlotChange = (newValue: number) => {
    if (typeof setSelectedSlots === "function") {
      setSelectedSlots(Math.min(Math.max(1, newValue), availableSlots));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Tour Details
        </h2>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          {selectedTour ? (
            <div className="space-y-5">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-lg text-blue-800 mb-2">
                  {selectedTour.title}
                </h4>
                <p className="text-blue-700 text-tiny">
                  {selectedTour.description ||
                    "Experience this amazing tour with our expert guides."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <ClockIcon className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium">{selectedTour.duration} hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <CurrencyDollarIcon className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="font-medium">${selectedTour.rate}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <UserGroupIcon className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Group Size</p>
                    <p className="font-medium">
                      Up to {selectedTour.group_size_limit} people
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <LanguageIcon className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Languages</p>
                    <p className="font-medium">
                      {selectedTour.languages.join(", ")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-2">
                <div className="flex items-center mb-2">
                  <SparklesIcon className="h-5 w-5 text-amber-500 mr-2" />
                  <p className="font-medium text-gray-800">Trip Highlights</p>
                </div>
                <ul className="space-y-2">
                  {selectedTour.trip_highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 mr-2"></span>
                      <span className="text-gray-700">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4">
                <div className="flex items-center mb-2">
                  <MapPinIcon className="h-5 w-5 text-green-500 mr-2" />
                  <p className="font-medium text-gray-800">Meeting Point</p>
                </div>
                <p className="text-gray-700">
                  {selectedTour.meeting_point_address}
                </p>
              </div>

              <div className="mt-4">
                <div className="flex items-center mb-2">
                  <CheckCircleIcon className="h-5 w-5 text-blue-500 mr-2" />
                  <p className="font-medium text-gray-800">What's Included</p>
                </div>
                <ul className="space-y-2">
                  {selectedTour.includes.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 mr-2"></span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4">
                <div className="flex items-center mb-2">
                  <QuestionMarkCircleIcon className="h-5 w-5 text-purple-500 mr-2" />
                  <p className="font-medium text-gray-800">Things to Know</p>
                </div>
                <p className="text-gray-700">{selectedTour.things_to_know}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CalendarIcon className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">
                Please select a tour first
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Choose a tour to view its details and available dates
              </p>
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Select Date & Slots
        </h2>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <RenderCalendar
            daysofWeek={
              availableWeekdays.length > 0
                ? availableWeekdays
                : allWeekdays.map((day) => ({ day, isActive: true }))
            }
            setSelectedDate={setSelectedDate}
          />

          {selectedDate && (
            <div className="mt-6">
              <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-100">
                <p className="text-green-800 font-medium">
                  Selected Date: {selectedDate.toString()}
                </p>
              </div>

              <div className="mt-4">
                <label
                  htmlFor="slots"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Number of Slots
                </label>
                <div className="flex items-center">
                  <div className="relative flex items-center">
                    <button
                      type="button"
                      onClick={() => handleSlotChange(selectedSlots - 1)}
                      disabled={isLoading || selectedSlots <= 1}
                      className="absolute left-0 inset-y-0 flex items-center justify-center w-10 h-full rounded-l-md border border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Decrease slots"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <input
                      type="number"
                      id="slots"
                      min="1"
                      max={availableSlots}
                      value={selectedSlots}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        handleSlotChange(value);
                      }}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm pl-10 pr-10 text-center"
                      disabled={isLoading || availableSlots === 0}
                    />
                    <button
                      type="button"
                      onClick={() => handleSlotChange(selectedSlots + 1)}
                      disabled={isLoading || selectedSlots >= availableSlots}
                      className="absolute right-0 inset-y-0 flex items-center justify-center w-10 h-full rounded-r-md border border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Increase slots"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                  <span className="ml-2 text-sm text-gray-500">
                    of {availableSlots} available
                  </span>
                </div>
                {isLoading && (
                  <p className="mt-1 text-xs text-blue-500">
                    Loading available slots...
                  </p>
                )}
                {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
                {!isLoading && !error && (
                  <p className="mt-1 text-xs text-gray-500">
                    Maximum slots available for this date: {availableSlots}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
