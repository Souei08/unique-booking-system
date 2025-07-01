import { createClient } from "@/supabase/client";

export interface DashboardSummary {
  today_tours: number;
  today_tours_change_pct: number;
  month_bookings: number;
  month_bookings_change_pct: number;
  promo_used: number;
  promo_used_change_pct: number;
}

export async function getDashboardSummary(): Promise<DashboardSummary | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_dashboard_summary").single();

  if (error) {
    console.error("Error fetching dashboard summary:", error);
    throw new Error("Failed to fetch dashboard summary");
  }

  return data as DashboardSummary | null;
}
