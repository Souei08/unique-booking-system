"use client";

import { z } from "zod";

// Helper function to validate JSON strings
const isValidJsonString = (str: string) => {
  try {
    const parsed = JSON.parse(str);
    return (
      typeof parsed === "object" &&
      parsed !== null &&
      "question" in parsed &&
      "answer" in parsed
    );
  } catch (e) {
    return false;
  }
};

export const createTourSchema = z.object({
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
  languages: z.array(z.string()).min(1, "At least one language is required"),
  faq: z
    .array(z.string())
    .min(1, "At least one FAQ is required")
    .refine(
      (items) => items.every(isValidJsonString),
      "Each FAQ must have a question and answer"
    ),
  tripHighlights: z
    .array(z.string())
    .min(1, "At least one trip highlight is required"),
  thingToKnow: z.string(),
  meetingPointAddress: z
    .string()
    .min(3, "Meeting point address must be at least 3 characters"),
  dropoffPointAddress: z
    .string()
    .min(3, "Dropoff point address must be at least 3 characters"),
  category: z.enum(
    ["horseback_riding", "jet_ski_tour", "safari_tour_and_snorkeling"],
    {
      errorMap: () => ({ message: "Please select a valid category" }),
    }
  ),
  includes: z.array(z.string()).min(1, "At least one inclusion is required"),
  slots: z
    .number()
    .min(1, "Slots must be at least 1")
    .max(100, "Slots cannot exceed 100"),
});

export type UpsertTourData = z.infer<typeof createTourSchema>;
