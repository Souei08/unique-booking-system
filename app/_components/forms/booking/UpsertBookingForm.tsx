"use client";

import {
  createTourBooking,
  cancelBooking,
} from "@/app/actions/booking/actions";
import { getAllTours } from "@/app/actions/tours/actions";
import { bookingSchema, BookingFormValues } from "../schemas";
import BaseForm from "../common/BaseForm";
import { useState, useEffect } from "react";
import ScheduleView, {
  ScheduleData,
} from "@/app/_components/scheduler/ScheduleView";
import { Tour as ApiTour } from "@/app/_lib/types/tours";

// This is the interface for the tour data we get from the API
interface ApiTourResponse {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  rate?: number;
  price?: number;
  duration?: number;
  group_size?: number;
  slots?: number;
  experience_level?: "beginner" | "advanced" | "all";
  weight_limit?: number;
  location?: string;
  includes?: string[];
  booking_link?: string;
  created_at?: string;
  category?: string;
}

// This is the interface for the tour data we use in our component
interface Tour {
  id: string;
  title: string;
  description: string;
  rate: number;
  duration: number;
  group_size: number;
  slots: number;
  experience_level: "beginner" | "advanced" | "all";
  weight_limit: number;
  location: string;
  includes: string[];
  booking_link: string;
  created_at: string;
  category: string;
}

interface Schedule {
  id: string;
  date: string;
  start_time: string;
  available_spots: number;
}

interface UpsertBookingFormProps {
  schedules: Schedule[];
  initialTourId?: string;
  initialScheduleId?: string;
  mode?: "create" | "update";
  bookingId?: string;
  onSuccess?: () => void;
  onTourChange?: (tourId: string) => void;
  onScheduleChange?: (scheduleId: string) => void;
}

export default function UpsertBookingForm({
  schedules,
  initialTourId,
  initialScheduleId,
  mode = "create",
  bookingId,
  onSuccess,
  onTourChange,
  onScheduleChange,
}: UpsertBookingFormProps) {
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoadingTours, setIsLoadingTours] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTour, setSelectedTour] = useState<Tour | undefined>();
  const [selectedSchedule, setSelectedSchedule] = useState<
    Schedule | undefined
  >(schedules.find((s) => s.id === initialScheduleId));
  const [totalPrice, setTotalPrice] = useState(0);
  const [formData, setFormData] = useState<BookingFormValues>({
    tourId: initialTourId || "",
    scheduleId: initialScheduleId || "",
    spots: 1,
    total_price: 0,
  });

  // Fetch tours when component mounts
  useEffect(() => {
    const fetchTours = async () => {
      try {
        setIsLoadingTours(true);
        setError(null);
        const fetchedTours = (await getAllTours()) as ApiTourResponse[];

        if (!fetchedTours || fetchedTours.length === 0) {
          setError("No tours available");
          return;
        }

        // Transform the tours to match our Tour interface
        const transformedTours = fetchedTours.map((tour) => ({
          id: tour.id,
          title: tour.title || tour.name || "Untitled Tour",
          description: tour.description || "",
          rate: tour.rate || tour.price || 0,
          duration: tour.duration || 0,
          group_size: tour.group_size || 0,
          slots: tour.slots || 0,
          experience_level: tour.experience_level || "all",
          weight_limit: tour.weight_limit || 0,
          location: tour.location || "",
          includes: tour.includes || [],
          booking_link: tour.booking_link || "",
          created_at: tour.created_at || new Date().toISOString(),
          category: tour.category || "",
        }));

        setTours(transformedTours);

        // Set initial tour if provided
        if (initialTourId) {
          const tour = transformedTours.find((t) => t.id === initialTourId);
          setSelectedTour(tour);
        }
      } catch (error) {
        console.error("Error fetching tours:", error);
        setError("Failed to load tours. Please try again later.");
      } finally {
        setIsLoadingTours(false);
      }
    };

    fetchTours();
  }, [initialTourId]);

  // Update total price when tour, schedule, or spots change
  useEffect(() => {
    const rate = selectedTour?.rate ?? 0;
    if (rate > 0 && selectedSchedule) {
      setTotalPrice(rate);
      setFormData((prev) => ({
        ...prev,
        total_price: rate * prev.spots,
      }));
    }
  }, [selectedTour, selectedSchedule]);

  const handleSubmit = async (data: BookingFormValues) => {
    try {
      const schedule = schedules.find((s) => s.id === data.scheduleId);
      if (!schedule) {
        throw new Error("Selected schedule not found");
      }

      if (data.spots > schedule.available_spots) {
        throw new Error(`Only ${schedule.available_spots} spots available`);
      }

      let result;

      if (mode === "create") {
        result = await createTourBooking({
          tourId: data.tourId,
          date: schedule.date,
          start_time: schedule.start_time,
          spots: data.spots,
          total_price: totalPrice * data.spots,
        });
      } else if (mode === "update" && bookingId) {
        await cancelBooking(bookingId);
        result = await createTourBooking({
          tourId: data.tourId,
          date: schedule.date,
          start_time: schedule.start_time,
          spots: data.spots,
          total_price: totalPrice * data.spots,
        });
      }

      if (!result?.success) {
        throw new Error(result?.message || `Failed to ${mode} booking`);
      }

      onSuccess?.();
    } catch (error) {
      console.error(`Error ${mode}ing booking:`, error);
      throw error;
    }
  };

  const handleTourChange = (tourId: string) => {
    const tour = tours.find((t) => t.id === tourId);
    setSelectedTour(tour);
    setFormData((prev) => ({ ...prev, tourId }));
    onTourChange?.(tourId);
  };

  const handleScheduleSubmit = (data: ScheduleData) => {
    // Find the matching schedule from our schedules array
    const schedule = schedules.find(
      (s) =>
        s.date === data.schedules[0].date &&
        s.start_time === data.schedules[0].time
    );

    if (schedule) {
      setSelectedSchedule(schedule);
      setFormData((prev) => ({ ...prev, scheduleId: schedule.id }));
      onScheduleChange?.(schedule.id);
    }
  };

  // Define the fields for the booking form
  const bookingFields = [
    {
      name: "tourId" as const,
      type: "select",
      placeholder: isLoadingTours ? "Loading tours..." : "Select a tour",
      label: "Tour",
      colSpan: "full" as const,
      options: tours.map((tour) => ({
        value: tour.id,
        label: tour.title,
      })),
      onChange: handleTourChange,
      disabled: isLoadingTours,
    },
    {
      name: "spots" as const,
      type: "number",
      placeholder: "Enter number of spots",
      label: "Number of Spots",
      colSpan: "half" as const,
      min: 1,
      max: selectedSchedule?.available_spots || 1,
    },
    {
      name: "total_price" as const,
      type: "number",
      placeholder: "Total price",
      label: "Total Price",
      colSpan: "half" as const,
      disabled: true,
    },
  ];

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md">{error}</div>
      )}

      <BaseForm<BookingFormValues>
        schema={bookingSchema}
        onSubmit={handleSubmit}
        fields={bookingFields}
        buttonText={mode === "create" ? "Book Now" : "Update Booking"}
        initialData={formData}
      />

      {/* Schedule Selection */}
      {selectedTour && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Select Schedule</h3>
          <ScheduleView
            tourId={selectedTour.id}
            onSubmit={handleScheduleSubmit}
            showSubmitButton={true}
          />
        </div>
      )}

      {/* Price summary */}
      <div className="mt-4 p-4 bg-gray-50 rounded-md">
        <p className="text-sm text-gray-600">
          Price per spot: ${selectedTour?.rate || 0}
        </p>
        <p className="text-lg font-semibold text-strong">
          Total Price: ${totalPrice}
        </p>
      </div>
    </div>
  );
}
