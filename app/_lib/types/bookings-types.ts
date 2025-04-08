export interface Booking {
  id: string;
  tour_id: string;
  user_id: string;
  date: string;
  start_time: string;
  spots: number;
  total_price: number;
  created_at: string;
}
