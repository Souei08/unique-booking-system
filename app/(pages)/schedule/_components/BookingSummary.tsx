import { useState } from "react";
import { CalendarEvent } from "./types";

interface BookingSummaryProps {
  selectedEvent: CalendarEvent | null;
  rate: number;
  onCheckout: () => void;
  remainingSlots: number | null;
  isLoading: boolean;
}

export default function BookingSummary({
  selectedEvent,
  rate,
  onCheckout,
  remainingSlots,
  isLoading,
}: BookingSummaryProps) {
  const [slots, setSlots] = useState(1);

  if (!selectedEvent) {
    return (
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
        <p className="text-gray-600">Select a date from the calendar to book</p>
      </div>
    );
  }

  const totalPrice = rate * slots;
  const canBook = remainingSlots !== null && remainingSlots > 0;
  const maxSelectableSlots = remainingSlots || 1;

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
      <div className="space-y-4">
        <div>
          <h3 className="font-medium">Selected Tour</h3>
          <p className="text-gray-600">{selectedEvent.title}</p>
        </div>
        <div>
          <h3 className="font-medium">Date & Time</h3>
          <p className="text-gray-600">
            {selectedEvent.date.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-gray-600">
            {selectedEvent.date.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
          </p>
        </div>
        <div>
          <h3 className="font-medium">Available Slots</h3>
          {isLoading ? (
            <p className="text-gray-600">Loading...</p>
          ) : (
            <p className="text-gray-600">
              {remainingSlots} {remainingSlots === 1 ? "slot" : "slots"}{" "}
              remaining
            </p>
          )}
        </div>
        <div>
          <h3 className="font-medium">Number of Slots</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSlots(Math.max(1, slots - 1))}
              className="px-3 py-1 border rounded-md hover:bg-gray-100"
              disabled={!canBook}
            >
              -
            </button>
            <span className="w-8 text-center">{slots}</span>
            <button
              onClick={() => setSlots(Math.min(maxSelectableSlots, slots + 1))}
              className="px-3 py-1 border rounded-md hover:bg-gray-100"
              disabled={!canBook || slots >= maxSelectableSlots}
            >
              +
            </button>
          </div>
        </div>
        <div>
          <h3 className="font-medium">Price Details</h3>
          <div className="flex justify-between">
            <span>Rate per person:</span>
            <span>${rate}</span>
          </div>
          <div className="flex justify-between font-semibold mt-2">
            <span>Total Price:</span>
            <span>${totalPrice}</span>
          </div>
        </div>
        <button
          onClick={onCheckout}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={!canBook || isLoading}
        >
          {isLoading ? "Loading..." : "Proceed to Checkout"}
        </button>
      </div>
    </div>
  );
}
