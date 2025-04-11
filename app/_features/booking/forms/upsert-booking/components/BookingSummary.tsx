import { useState, useEffect, useRef } from "react";
import { CalendarEvent } from "@/app/(test)/schedule/_components/types";

interface BookingSummaryProps {
  selectedEvent: CalendarEvent | null;
  rate: number;
  remainingSlots: number | null;
  isLoading: boolean;
  onSelectionChange?: (values: {
    date: string;
    start_time: string;
    spots: number;
    total_price: number;
  }) => void;
  errors?: {
    date?: { message: string };
    start_time?: { message: string };
    spots?: { message: string };
    total_price?: { message: string };
  };
  initialSlots?: number;
}

export default function BookingSummary({
  selectedEvent,
  rate,
  remainingSlots,
  isLoading,
  onSelectionChange,
  errors = {},
  initialSlots = 1,
}: BookingSummaryProps) {
  const [slots, setSlots] = useState(initialSlots);
  const [validationErrors, setValidationErrors] = useState<{
    date?: string;
    start_time?: string;
    spots?: string;
    total_price?: string;
  }>({});

  // Use a ref to track previous values and avoid unnecessary updates
  const prevValuesRef = useRef({
    date: "",
    start_time: "",
    spots: initialSlots,
    total_price: 0,
  });

  // Update slots when initialSlots changes (when navigating back)
  useEffect(() => {
    setSlots(initialSlots);
    prevValuesRef.current.spots = initialSlots;
  }, [initialSlots]);

  // Calculate total price whenever slots or rate changes
  const totalPrice = rate * slots;

  // Update validation errors when props.errors changes
  useEffect(() => {
    setValidationErrors({
      date: errors.date?.message,
      start_time: errors.start_time?.message,
      spots: errors.spots?.message,
      total_price: errors.total_price?.message,
    });
  }, [errors]);

  // Update parent form when values change
  useEffect(() => {
    if (!selectedEvent || !onSelectionChange) return;

    try {
      // Format date as YYYY-MM-DD
      const dateStr =
        selectedEvent.date instanceof Date
          ? selectedEvent.date.toISOString().split("T")[0]
          : selectedEvent.date;

      // Format time (assuming it's in HH:MM format)
      const timeStr = selectedEvent.time || "";

      // Check if values have actually changed to avoid unnecessary updates
      const currentValues = {
        date: dateStr,
        start_time: timeStr,
        spots: slots,
        total_price: totalPrice,
      };

      // Only update if values have changed
      if (
        currentValues.date !== prevValuesRef.current.date ||
        currentValues.start_time !== prevValuesRef.current.start_time ||
        currentValues.spots !== prevValuesRef.current.spots ||
        currentValues.total_price !== prevValuesRef.current.total_price
      ) {
        // Update the ref with current values
        prevValuesRef.current = currentValues;

        // Notify parent component
        onSelectionChange(currentValues);
      }
    } catch (error) {
      console.error("Error updating selection:", error);
      setValidationErrors((prev) => ({
        ...prev,
        date: "Error processing date selection",
      }));
    }
  }, [selectedEvent, slots, totalPrice, onSelectionChange]);

  if (!selectedEvent) {
    return (
      <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Booking Summary
          </h2>
          <p className="text-gray-500">
            Please select a date from the calendar to proceed with your booking
          </p>
        </div>
      </div>
    );
  }

  const canBook = remainingSlots !== null && remainingSlots > 0;
  const maxSelectableSlots = remainingSlots || 1;

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Booking Summary
      </h2>

      <div className="space-y-6">
        {/* Tour Details */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500">Selected Tour</h3>
          <p className="text-gray-900 font-medium">{selectedEvent.title}</p>
        </div>

        {/* Date & Time */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
          <div className="flex flex-col">
            <p className="text-gray-900">
              {selectedEvent.date.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-gray-900">
              {selectedEvent.time || "Time not specified"}
            </p>
          </div>
          {validationErrors.date && (
            <p className="text-red-500 text-sm">{validationErrors.date}</p>
          )}
          {validationErrors.start_time && (
            <p className="text-red-500 text-sm">
              {validationErrors.start_time}
            </p>
          )}
        </div>

        {/* Available Slots */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500">Available Slots</h3>
          {isLoading ? (
            <p className="text-gray-900">Loading...</p>
          ) : (
            <p className="text-gray-900">
              {remainingSlots} {remainingSlots === 1 ? "slot" : "slots"}{" "}
              remaining
            </p>
          )}
        </div>

        {/* Number of Slots Selection */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500">Number of Slots</h3>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setSlots(Math.max(1, slots - 1))}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!canBook || slots <= 1}
            >
              -
            </button>
            <span className="w-12 text-center text-lg font-medium">
              {slots}
            </span>
            <button
              type="button"
              onClick={() => setSlots(Math.min(maxSelectableSlots, slots + 1))}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!canBook || slots >= maxSelectableSlots}
            >
              +
            </button>
          </div>
          {validationErrors.spots && (
            <p className="text-red-500 text-sm">{validationErrors.spots}</p>
          )}
        </div>

        {/* Price Details */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Rate per person</span>
            <span className="text-gray-900">${rate.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold">
            <span className="text-gray-900">Total Price</span>
            <span className="text-gray-900">${totalPrice.toFixed(2)}</span>
          </div>
          {validationErrors.total_price && (
            <p className="text-red-500 text-sm">
              {validationErrors.total_price}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
