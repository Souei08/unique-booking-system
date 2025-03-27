"use client";

import { z } from "zod";
import TourForm from "./tourForm";

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
    .min(1, "Duration must be at least 1 day")
    .max(30, "Duration cannot exceed 30 days"),
  maxGroupSize: z
    .number()
    .min(1, "Group size must be at least 1")
    .max(20, "Group size cannot exceed 20"),
  difficulty: z.enum(["easy", "medium", "difficult"], {
    errorMap: () => ({ message: "Please select a valid difficulty level" }),
  }),
  location: z.string().min(3, "Location must be at least 3 characters"),
});

// Infer the type from the schema
type CreateTourData = z.infer<typeof createTourSchema>;

export default function CreateTourForm() {
  const handleCreateTour = async (data: CreateTourData) => {
    try {
      // You'll need to implement your API call here
      const response = await fetch("/api/tours", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw error;
      }

      // Handle successful creation (e.g., redirect or show success message)
    } catch (error) {
      // Handle errors appropriately
      console.error("Error creating tour:", error);
      throw error;
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
      name: "price" as const,
      type: "number",
      placeholder: "Enter tour price",
      label: "Price ($)",
      colSpan: "half" as const,
    },
    {
      name: "duration" as const,
      type: "number",
      placeholder: "Enter tour duration in days",
      label: "Duration (days)",
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
  ];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Create New Tour</h2>
      <TourForm
        schema={createTourSchema}
        onSubmit={handleCreateTour}
        fields={tourFields}
        buttonText="Create Tour"
      />
    </div>
  );
}
