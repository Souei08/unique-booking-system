import { createClient } from "@/supabase/client";

export async function getAnalyticsData() {
  const supabase = createClient();

  const [
    { data: totalRevenue },
    { data: revenuePerProduct },
    { data: revenuePerTour },
    { data: revenueByTimeframe },
  ] = await Promise.all([
    supabase.from("total_revenue_all_tours").select("*"),
    supabase.from("revenue_per_product").select("*"),
    supabase.from("revenue_per_tour").select("*"),
    supabase.from("revenue_by_timeframe").select("*"),
  ]);

  return {
    totalRevenue: totalRevenue?.[0]?.total_revenue || 0,
    revenuePerProduct: revenuePerProduct || [],
    revenuePerTour: revenuePerTour || [],
    revenueByTimeframe: revenueByTimeframe || [],
  };
}
