"use client";

import { EventModalProps } from "./types";

export default function EventModal({
  event,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
}: EventModalProps) {
  if (!isOpen) return null;

  const formatDateTime = (date: Date) => {
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  const { date, time } = formatDateTime(event.date);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">{event.title}</h2>
        <div className="space-y-4">
          <div>
            <p className="text-gray-600">Time: {time}</p>
            <p className="text-gray-600">Date: {date}</p>
            {event.max_slots && (
              <p className="text-gray-600">
                Available Slots: {event.max_slots}
              </p>
            )}
            {event.description && (
              <p className="text-gray-600">Description: {event.description}</p>
            )}
            <p className="text-gray-600">Status: {event.status || "pending"}</p>
          </div>
          {!event.tour_id && (
            <div className="space-y-2">
              <h3 className="font-medium">Change Status:</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => onStatusChange(event, "pending")}
                  className="px-3 py-1 text-sm rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                >
                  Pending
                </button>
                <button
                  onClick={() => onStatusChange(event, "completed")}
                  className="px-3 py-1 text-sm rounded bg-green-100 text-green-700 hover:bg-green-200"
                >
                  Complete
                </button>
                <button
                  onClick={() => onStatusChange(event, "cancelled")}
                  className="px-3 py-1 text-sm rounded bg-red-100 text-red-700 hover:bg-red-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          {!event.tour_id && (
            <button
              onClick={() => onDelete(event.id)}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
            >
              Delete
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
