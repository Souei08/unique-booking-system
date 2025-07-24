import { createClient } from "@/supabase/client";
import { Tour } from "../tour-types";

interface TourFilters {
  search_query?: string | null;
  status?: string | null;
  limit_count?: number;
  offset_count?: number;
}

export async function getAllToursV2(filters: TourFilters = {}): Promise<{
  data: Tour[];
  total_count: number;
}> {
  const supabase = await createClient();

  const { 
    search_query = null, 
    status = null,
    limit_count = 10, 
    offset_count = 0 
  } = filters;

  try {
    // Try to use the RPC function first
    const { data, error } = await supabase.rpc("get_all_tours_v2", {
      search_query,
      status_filter: status,
      limit_count,
      offset_count,
    });

    if (error) {
      console.warn("RPC function failed, falling back to direct query:", error);
      // Fallback to direct query if RPC function doesn't exist or fails
      return await getAllToursFallback(filters);
    }

    const total = data?.[0]?.total_count ?? 0;

    return {
      data: data || [],
      total_count: total,
    };
  } catch (error) {
    console.warn("RPC function error, falling back to direct query:", error);
    // Fallback to direct query
    return await getAllToursFallback(filters);
  }
}

// Fallback function using direct Supabase query
async function getAllToursFallback(filters: TourFilters): Promise<{
  data: Tour[];
  total_count: number;
}> {
  const supabase = await createClient();
  
  const { 
    search_query = null, 
    status = null,
    limit_count = 10, 
    offset_count = 0 
  } = filters;

  let query = supabase
    .from("tours")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  // Apply search filter
  if (search_query) {
    query = query.or(
      `title.ilike.%${search_query}%,description.ilike.%${search_query}%`
    );
  }

  // Apply status filter if provided
  if (status) {
    query = query.eq("status", status);
  }

  const { data, error, count } = await query
    .range(offset_count, offset_count + limit_count - 1);

  if (error) {
    console.error("Error fetching tours:", error);
    throw new Error("Failed to fetch tours");
  }

  return {
    data: data || [],
    total_count: count || 0,
  };
}
