import { z } from "zod";

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Tour Schemas
export const tourSchema = z.object({
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

// Booking Schemas
export const bookingSchema = z.object({
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

// Schedule Schemas
export const scheduleSchema = z.object({
  tourId: z.string().min(1, "Tour is required"),
  weekday: z.string().min(1, "Weekday is required"),
  start_time: z.string().min(1, "Start time is required"),
  max_slots: z
    .number()
    .min(1, "At least 1 slot is required")
    .max(20, "Maximum 20 slots allowed"),
});

// Export types
export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type TourFormValues = z.infer<typeof tourSchema>;
export type BookingFormValues = z.infer<typeof bookingSchema>;
export type ScheduleFormValues = z.infer<typeof scheduleSchema>;
