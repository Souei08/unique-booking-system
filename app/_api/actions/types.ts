"use server";

/**
 * Common response type for API operations
 */
export interface SuccessResponse {
  success: boolean;
  message?: string;
  data?: any;
}

/**
 * Schedule types
 */
export interface Schedule {
  id?: string;
  tour_id: string;
  date?: Date;
  max_slots: number;
  start_time: string;
  weekday?: string;
}

export interface ScheduleRule {
  weekday: string;
  start_time: string;
}

/**
 * Tour types
 */
export interface Tour {
  id: string;
  title: string;
  description: string;
  rate: number;
  duration: number;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Booking types
 */
export interface Booking {
  id: string;
  tour_id: string;
  total_price: string;
  status: string;
  created_at: string;
  user_email: string;
  date: string;
  slots: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  spots: string;
}

/**
 * Rental types
 */
export interface Rental {
  id: string;
  name: string;
  description: string;
  price_per_day: number;
  image_url?: string;
  available: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RentalBooking {
  id: string;
  user_id: string;
  rental_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: "pending" | "confirmed" | "cancelled";
  created_at?: string;
  updated_at?: string;
}

/**
 * User types
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  role: "user" | "admin";
  created_at?: string;
  updated_at?: string;
}
