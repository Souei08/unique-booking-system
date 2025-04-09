"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useEffect, useState } from "react";
import { getAllTours } from "@/app/actions/tours/actions";
import { getAvailableTourSchedules } from "@/app/actions/schedule/actions";

import { Tour as ActionTour } from "@/app/actions/types";
import CustomSideCalendar from "@/app/_components/calendar/CustomSideCalendar";
import BookingSummary from "@/app/(pages)/schedule/_components/BookingSummary";

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
  onSubmit: () => void;
}

export default function BookingForm({ onSubmit }: BookingFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  const [tours, setTours] = useState<ActionTour[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  const [selectedTour, setSelectedTour] = useState<ActionTour | null>(null);

  const spots = watch("spots");
  const tourId = watch("tourId");
  const total_price = spots * (selectedTour?.rate || 0);

  // Fetch all tours on component mount
  useEffect(() => {
    const fetchTours = async () => {
      const tourGetResult = await getAllTours();

      console.log("tourGetResult", tourGetResult);
      setTours(tourGetResult);
    };

    fetchTours();
  }, []);

  // Fetch schedules when a tour is selected
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!tourId) {
        setSchedules([]);
        return;
      }

      setIsLoadingSchedules(true);
      try {
        const result = await getAvailableTourSchedules(tourId);
        if (result.success) {
          setSchedules(result.schedules || []);
        }
      } catch (error) {
        console.error("Error fetching schedules:", error);
      } finally {
        setIsLoadingSchedules(false);
      }
    };

    fetchSchedules();
  }, [tourId]);

  // Update selected tour when tourId changes
  useEffect(() => {
    if (tourId && tours.length > 0) {
      const tour = tours.find((t) => t.id === tourId);
      setSelectedTour(tour || null);
    } else {
      setSelectedTour(null);
    }
  }, [tourId, tours]);

  const handleFormSubmit = async (data: any) => {
    try {
      await onSubmit();
    } catch (error) {
      console.error("Booking submission error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label className="block mb-1 text-sm font-medium text-strong">
          Tours
        </label>
        <select
          {...register("tourId")}
          className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-strong outline-1 -outline-offset-1 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6 ${
            errors.tourId
              ? "outline-red-500"
              : "outline-gray-300 focus:outline-indigo-600"
          }`}
        >
          <option value="">Select a tour</option>
          {tours.map((tour) => (
            <option key={tour.id} value={tour.id}>
              {tour.title}
            </option>
          ))}
        </select>
        {errors.tourId && (
          <p className="text-red-500 text-sm">{errors.tourId.message}</p>
        )}
      </div>

      {selectedTour && (
        <div>
          {/* ScheduleSelector component is commented out for now */}
          {isLoadingSchedules ? (
            <div>Loading...</div>
          ) : (
            <CustomSideCalendar
              initialSchedules={schedules}
              tourId={tourId}
              rate={selectedTour?.rate || 0}
            >
              {(props) => <BookingSummary {...props} />}
            </CustomSideCalendar>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !selectedTour}
        className="w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? "Processing..." : "Book Now"}
      </button>
    </form>
  );
}
