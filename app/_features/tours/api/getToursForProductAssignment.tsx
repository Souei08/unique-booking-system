import { createClient } from "@/supabase/client";
import { Tour } from "../tour-types";

interface TourFilters {
  search_query?: string | null;
  limit_count?: number;
  offset_count?: number;
}

export async function getToursForProductAssignment(
  filters: TourFilters = {}
): Promise<{
  data: Tour[];
  total_count: number;
}> {
  const supabase = await createClient();

  const { search_query = null, limit_count = 10, offset_count = 0 } = filters;

  let query = supabase
    .from("tours")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (search_query) {
    query = query.or(
      `title.ilike.%${search_query}%,description.ilike.%${search_query}%`
    );
  }

  const { data, error, count } = await query.range(
    offset_count,
    offset_count + limit_count - 1
  );

  if (error) {
    console.error("Error fetching tours:", error);
    throw new Error("Failed to fetch tours");
  }

  return {
    data: (data as Tour[]) || [],
    total_count: count || 0,
  };
}
