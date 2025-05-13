export interface BookingTable {
  id: string;
  tour_id: string;
  user_id: string;
  slots: number;
  total_price: number;
  created_at: string;
  booking_date: string;
  selected_time: string;
  status: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  manage_token: string;
  tour_title: string;
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
