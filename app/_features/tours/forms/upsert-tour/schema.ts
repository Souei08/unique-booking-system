import { z } from "zod";

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

export type UpsertTourData = z.infer<typeof createTourSchema>;
