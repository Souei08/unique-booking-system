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
  total_price: number;
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
  additional_products?: AdditionalProduct[];
  booking_status: string;
  payment_status: string;
  reference_number: string;
  stripe_payment_id: string;
  payment_link: string;
  tour_rate: number;
}

export interface AdditionalProduct {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
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
}
