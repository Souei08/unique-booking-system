export interface PromoCodeAnalytics {
  promo_code_id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  total_bookings: string; // PostgreSQL bigint comes as string
  total_slots: string; // PostgreSQL bigint comes as string
  total_revenue: number;
  first_used: string | null;
  last_used: string | null;
}

export interface PromoAnalyticsSummary {
  total_promos: number;
  active_promos: number;
  total_promo_revenue: number;
  total_promo_discounts: number;
  average_discount_value: number;
}
