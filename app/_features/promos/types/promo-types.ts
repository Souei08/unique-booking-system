export interface Promo {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  expires_at: string;
  max_uses: number;
  times_used: number;
  is_active: boolean;
  created_at: string;
}
