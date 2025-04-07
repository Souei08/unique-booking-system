export interface Schedule {
  id: string;
  tour_id: string;
  start_time: string;
  end_time: string;
  available_slots: number;
  price: number;
  created_at: string;
  updated_at: string;
}
