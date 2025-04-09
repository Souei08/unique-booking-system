import { z } from "zod";

export const bookingSchema = z.object({
  tourId: z.string().min(1, "Tour is required"),
  scheduleId: z.string().min(1, "Schedule is required"),
  spots: z.number().min(1, "At least 1 spot is required"),
  total_price: z.number().min(0, "Total price must be a positive number"),
});

export type BookingFormValues = z.infer<typeof bookingSchema>;
