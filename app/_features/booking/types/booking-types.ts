import {
  CustomSlotField,
  CustomSlotType,
} from "../components/CreateBookingv2/booking-steps/SlotDetails";

export interface BookingResponse {
  id: string;
  tour_id: string;
  customer_id: string;
  booking_date: string;
  selected_time: string;
  slots: number;
  total_price: number;
  status: string;
  manage_token: string;
  created_at: string;
  updated_at: string | null;
  reference_number: string;
  payment_link: string | null;

  tours: {
    title: string;
  };
  users: {
    full_name: string;
    email: string;
    phone_number: string | null;
  };
  payments: Array<{
    status: string;
    payment_id: string;
    amount_paid: number;
    payment_method: string;
  }>;
}

// For backward compatibility with existing code
export interface BookingTable {
  id: string;
  full_name: string;
  booking_id: string;
  tour_id: string;
  user_id: string;
  slots: number;
  // total_price: number;
  total_price_before_discount?: number;
  booking_created_at: string;
  booking_date: string;
  selected_time: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  manage_token: string;
  tour_title: string;
  payment_method?: string;
  transaction_id?: string;
  booking_status: string;
  payment_status: string;
  reference_number: string;
  stripe_payment_id: string;
  payment_link: string;
  tour_rate: number;
  slot_details: SlotDetail[];
  custom_slot_types: CustomSlotType[];
  custom_slot_fields: CustomSlotField[];
  booked_products: AdditionalProduct[];
  tour_featured_image: string;
  tour_description: string;

  promo_code_id?: string;
  promo_code?: string;

  stripe_coupon_id?: string;
  original_amount?: number;
  discount_amount?: number;
  amount_paid: number;

  total_count?: number;
}

export interface AdditionalProduct {
  product_booking_id?: string;
  id: string;
  product_id?: string;
  name: string;
  quantity: number;
  unit_price: number;
  image_url?: string | null;
  description?: string | null;
}

export interface CustomerInformation {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
}

export interface PaymentInformation {
  payment_method: string;
  payment_id: string;
  total_price: number;
  additional_products?: {
    name: string;
    quantity: number;
    price: number;
  }[];
}

export interface SlotDetail {
  type: string;
  price: number;
  [key: string]: string | number; // Allow dynamic string properties
}
