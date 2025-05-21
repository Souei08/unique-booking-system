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
