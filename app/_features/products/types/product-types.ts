export interface Product {
  product_booking_id?: string;
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  created_at: string;
}
