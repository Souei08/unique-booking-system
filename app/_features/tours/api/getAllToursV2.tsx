import { createClient } from "@/supabase/client";
import { Tour } from "../tour-types";

interface TourFilters {
  search_query?: string | null;
  limit_count?: number;
  offset_count?: number;
}

export async function getAllToursV2(filters: TourFilters = {}): Promise<{
  data: Tour[];
  total_count: number;
}> {
  const supabase = await createClient();

  const { search_query = null, limit_count = 10, offset_count = 0 } = filters;

  const { data, error } = await supabase.rpc("get_all_tours_v2", {
    search_query,
    limit_count,
    offset_count,
  });

  if (error) {
    console.error("Error fetching tours:", error);
    throw new Error("Failed to fetch tours");
  }

  const total = data?.[0]?.total_count ?? 0;

  return {
    data: data || [],
    total_count: total,
  };
}
