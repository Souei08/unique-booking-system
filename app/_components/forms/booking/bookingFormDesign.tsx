"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Define the schema for booking creation
const bookingSchema = z.object({
  tourId: z.string().min(1, "Tour is required"),
  date: z.string().min(1, "Date is required"),
  start_time: z.string().min(1, "Start time is required"),
  spots: z
    .number()
    .min(1, "At least 1 spot is required")
    .max(20, "Maximum 20 spots allowed"),
  total_price: z
    .number()
    .min(0, "Price cannot be negative")
    .max(100000, "Price is too high"),
});

// Infer the type from the schema
type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  onSubmit: (data: BookingFormData) => Promise<void>;
  tourId: string;
  pricePerSpot: number;
  maxSpots: number;
  availableDates: string[];
  availableTimes: string[];
}

export default function BookingForm({
  onSubmit,
  tourId,
  pricePerSpot,
  maxSpots,
  availableDates,
  availableTimes,
}: BookingFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      tourId,
      spots: 1,
      total_price: pricePerSpot,
    },
  });

  const spots = watch("spots");
  const total_price = spots * pricePerSpot;

  const handleFormSubmit = async (data: BookingFormData) => {
    try {
      await onSubmit({ ...data, total_price });
    } catch (error) {
      console.error("Booking submission error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label className="block mb-1 text-sm font-medium text-strong">
          Date
        </label>
        <select
          {...register("date")}
          className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-strong outline-1 -outline-offset-1 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6 ${
            errors.date
              ? "outline-red-500"
              : "outline-gray-300 focus:outline-indigo-600"
          }`}
        >
          <option value="">Select a date</option>
          {availableDates.map((date) => (
            <option key={date} value={date}>
              {new Date(date).toLocaleDateString()}
            </option>
          ))}
        </select>
        {errors.date && (
          <p className="text-red-500 text-sm">{errors.date.message}</p>
        )}
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium text-strong">
          Start Time
        </label>
        <select
          {...register("start_time")}
          className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-strong outline-1 -outline-offset-1 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6 ${
            errors.start_time
              ? "outline-red-500"
              : "outline-gray-300 focus:outline-indigo-600"
          }`}
        >
          <option value="">Select a time</option>
          {availableTimes.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
        {errors.start_time && (
          <p className="text-red-500 text-sm">{errors.start_time.message}</p>
        )}
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium text-strong">
          Number of Spots
        </label>
        <input
          type="number"
          {...register("spots", { valueAsNumber: true })}
          min={1}
          max={maxSpots}
          className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-strong outline-1 -outline-offset-1 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6 ${
            errors.spots
              ? "outline-red-500"
              : "outline-gray-300 focus:outline-indigo-600"
          }`}
        />
        {errors.spots && (
          <p className="text-red-500 text-sm">{errors.spots.message}</p>
        )}
      </div>

      <div className="p-4 bg-gray-50 rounded-md">
        <p className="text-sm text-gray-600">Price per spot: ${pricePerSpot}</p>
        <p className="text-lg font-semibold text-strong">
          Total Price: ${total_price}
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? "Processing..." : "Book Now"}
      </button>
    </form>
  );
}
