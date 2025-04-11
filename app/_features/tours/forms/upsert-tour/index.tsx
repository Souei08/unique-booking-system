"use client";

import { createTour } from "@/app/_features/tours/actions/createTour";
import { updateTour } from "@/app/_features/tours/actions/updateTour";
import { CreateTourDTO, UpdateTourDTO, Tour } from "@/app/_lib/types/tours";
import { createTourSchema, UpsertTourData } from "./schema";
import { tourFields } from "./types";
import TourForm from "./components/TourForm";

interface UpsertTourFormProps {
  initialData?: UpsertTourData;
  mode?: "create" | "update";
  tourId?: string;
  onSuccess?: () => void;
}

export default function UpsertTourForm({
  initialData,
  mode = "create",
  tourId,
  onSuccess,
}: UpsertTourFormProps) {
  const handleSubmit = async (data: UpsertTourData) => {
    try {
      // Convert string values to numbers for numeric fields
      const processedData = {
        ...data,
        price: Number(data.price),
        duration: Number(data.duration),
        maxGroupSize: Number(data.maxGroupSize),
        weightLimit: Number(data.weightLimit),
        slots: Number(data.slots),
      };

      // Map form data to match the Tour interface
      const tourData: CreateTourDTO = {
        title: processedData.title,
        description: processedData.description,
        duration: processedData.duration,
        group_size: processedData.maxGroupSize,
        slots: processedData.slots,
        rate: processedData.price,
        experience_level: mapDifficultyToExperienceLevel(
          processedData.difficulty
        ),
        weight_limit: processedData.weightLimit,
        location: processedData.location,
        includes: processedData.includes,
        booking_link: processedData.bookingLink,
        category: processedData.category,
      };

      let result: any;

      if (mode === "create") {
        result = await createTour(tourData as Tour);
      } else if (tourId) {
        result = await updateTour(tourId, tourData as UpdateTourDTO);
      }

      if (!result) {
        throw new Error(`Failed to ${mode} tour`);
      }

      onSuccess?.();
    } catch (error) {
      console.error(`Error ${mode}ing tour:`, error);
      throw error;
    }
  };

  // Helper function to map difficulty to experience level
  const mapDifficultyToExperienceLevel = (
    difficulty: "easy" | "medium" | "difficult"
  ): "beginner" | "advanced" | "all" => {
    switch (difficulty) {
      case "easy":
        return "beginner";
      case "difficult":
        return "advanced";
      case "medium":
      default:
        return "all";
    }
  };

  return (
    <TourForm
      schema={createTourSchema}
      onSubmit={handleSubmit}
      fields={tourFields}
      buttonText={mode === "create" ? "Create Tour" : "Update Tour"}
      initialData={initialData}
    />
  );
}
