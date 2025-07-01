import { createClient } from "@/supabase/client";
import {
  PromoCodeAnalytics,
  PromoAnalyticsSummary,
} from "../types/promo-analytics-types";

export async function getAnalyticsData() {
  const supabase = createClient();

  const [
    { data: totalRevenue },
    { data: revenuePerProduct },
    { data: revenuePerTour },
    { data: revenueByTimeframe },
    { data: promoCodeAnalytics },
    { data: promoSummary },
  ] = await Promise.all([
    supabase.from("total_revenue_all_tours").select("*"),
    supabase.from("revenue_per_product").select("*"),
    supabase.from("revenue_per_tour").select("*"),
    supabase.from("revenue_by_timeframe").select("*"),
    supabase.rpc("get_promo_code_analytics"),
    supabase.from("promo_codes").select("*"),
  ]);

  // Calculate promo summary statistics
  const promoSummaryData: PromoAnalyticsSummary = {
    total_promos: promoSummary?.length || 0,
    active_promos: promoSummary?.filter((p: any) => p.is_active)?.length || 0,
    total_promo_revenue:
      promoCodeAnalytics?.reduce(
        (acc: number, promo: PromoCodeAnalytics) => acc + promo.total_revenue,
        0
      ) || 0,
    total_promo_discounts:
      promoCodeAnalytics?.reduce((acc: number, promo: PromoCodeAnalytics) => {
        if (promo.discount_type === "percentage") {
          return acc + (promo.total_revenue * promo.discount_value) / 100;
        } else {
          return (
            acc + Number(promo.discount_value) * Number(promo.total_bookings)
          );
        }
      }, 0) || 0,
    average_discount_value:
      promoSummary?.reduce(
        (acc: number, promo: any) => acc + promo.discount_value,
        0
      ) / (promoSummary?.length || 1) || 0,
  };

  return {
    totalRevenue: totalRevenue?.[0]?.total_revenue || 0,
    revenuePerProduct: revenuePerProduct || [],
    revenuePerTour: revenuePerTour || [],
    revenueByTimeframe: revenueByTimeframe || [],
    promoCodeAnalytics: promoCodeAnalytics || [],
    promoSummary: promoSummaryData,
  };
}
