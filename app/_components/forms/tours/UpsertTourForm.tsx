"use client";

import { z } from "zod";
import TourForm from "./tourForm";
import { createTour, updateTour } from "@/app/_api/actions/tours/actions";
import { CreateTourDTO, UpdateTourDTO, Tour } from "@/app/_lib/types/tours";

// Define the schema for tour creation
const createTourSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be less than 1000 characters"),
  price: z
    .number()
    .min(0, "Price cannot be negative")
    .max(100000, "Price is too high"),
  duration: z
    .number()
    .min(1, "Duration must be at least 1 hour")
    .max(30, "Duration cannot exceed 30 hours"),
  maxGroupSize: z
    .number()
    .min(1, "Group size must be at least 1")
    .max(20, "Group size cannot exceed 20"),
  difficulty: z.enum(["easy", "medium", "difficult"], {
    errorMap: () => ({ message: "Please select a valid difficulty level" }),
  }),
  location: z.string().min(3, "Location must be at least 3 characters"),
  category: z.string().min(3, "Category must be at least 3 characters"),
  weightLimit: z
    .number()
    .min(0, "Weight limit cannot be negative")
    .max(500, "Weight limit is too high"),
  includes: z.array(z.string()).min(1, "At least one inclusion is required"),
  bookingLink: z.string().url("Must be a valid URL"),
  slots: z
    .number()
    .min(1, "Slots must be at least 1")
    .max(100, "Slots cannot exceed 100"),
});

// Infer the type from the schema
type UpsertTourData = z.infer<typeof createTourSchema>;

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

  const tourFields = [
    {
      name: "title" as const,
      type: "text",
      placeholder: "Enter tour title",
      label: "Tour Title",
      colSpan: "full" as const,
    },
    {
      name: "description" as const,
      type: "textarea",
      placeholder: "Enter tour description",
      label: "Description",
      colSpan: "full" as const,
    },
    {
      name: "category" as const,
      type: "text",
      placeholder: "Enter tour category",
      label: "Category",
      colSpan: "full" as const,
    },
    {
      name: "price" as const,
      type: "number",
      placeholder: "Enter tour price",
      label: "Price ($)",
      colSpan: "half" as const,
    },
    {
      name: "duration" as const,
      type: "number",
      placeholder: "Enter tour duration in hrs",
      label: "Duration (hrs)",
      colSpan: "half" as const,
    },
    {
      name: "maxGroupSize" as const,
      type: "number",
      placeholder: "Enter maximum group size",
      label: "Maximum Group Size",
      colSpan: "half" as const,
    },
    {
      name: "slots" as const,
      type: "number",
      placeholder: "Enter number of slots",
      label: "Available Slots",
      colSpan: "half" as const,
    },
    {
      name: "weightLimit" as const,
      type: "number",
      placeholder: "Enter weight limit in kg",
      label: "Weight Limit (kg)",
      colSpan: "half" as const,
    },
    {
      name: "difficulty" as const,
      type: "select",
      placeholder: "Select difficulty level",
      label: "Difficulty Level",
      colSpan: "half" as const,
    },
    {
      name: "location" as const,
      type: "text",
      placeholder: "Enter tour location",
      label: "Location",
      colSpan: "full" as const,
    },
    {
      name: "includes" as const,
      type: "array",
      placeholder: "Enter inclusions (one per line)",
      label: "Inclusions",
      colSpan: "full" as const,
    },
    {
      name: "bookingLink" as const,
      type: "text",
      placeholder: "Enter booking link URL",
      label: "Booking Link",
      colSpan: "full" as const,
    },
  ];

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
