import { z } from "zod";

// Define the schema for booking creation
export const bookingSchema = z.object({
  // Step 1: Tour Selection
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

  // Step 2: Customer Details
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  customerAddress: z.string().min(5, "Address must be at least 5 characters"),

  // Step 3: Payment Details
  cardNumber: z.string().min(16, "Card number must be 16 digits"),
  cardExpiry: z.string().min(5, "Expiry date must be in MM/YY format"),
  cardCvv: z.string().min(3, "CVV must be at least 3 digits"),
  cardName: z.string().min(2, "Cardholder name is required"),
});

// Infer the type from the schema
export type BookingFormData = z.infer<typeof bookingSchema>;
