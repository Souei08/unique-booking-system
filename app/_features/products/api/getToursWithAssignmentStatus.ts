import { createClient } from "@/supabase/client";
import { Tour } from "@/app/_features/tours/tour-types";

interface TourWithAssignmentStatus extends Tour {
  is_assigned: boolean;
}

interface TourFilters {
  product_id: string;
  search_query?: string | null;
  limit_count?: number;
  offset_count?: number;
}

export async function getToursWithAssignmentStatus(
  filters: TourFilters
): Promise<{
  data: TourWithAssignmentStatus[];
  total_count: number;
}> {
  const supabase = await createClient();

  const {
    product_id,
    search_query = null,
    limit_count = 10,
    offset_count = 0,
  } = filters;

  // First, get all tours with search filter
  let baseQuery = supabase
    .from("tours")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (search_query) {
    baseQuery = baseQuery.or(
      `title.ilike.%${search_query}%,description.ilike.%${search_query}%`
    );
  }

  const {
    data: allTours,
    error: allToursError,
    count: totalCount,
  } = await baseQuery.range(offset_count, offset_count + limit_count - 1);

  if (allToursError) {
    console.error("Error fetching tours:", allToursError);
    throw new Error("Failed to fetch tours");
  }

  if (!allTours || allTours.length === 0) {
    return {
      data: [],
      total_count: totalCount || 0,
    };
  }

  // Get assignment status for these tours
  const tourIds = allTours.map((tour) => tour.id);
  const { data: assignments, error: assignmentsError } = await supabase
    .from("tour_products")
    .select("tour_id")
    .eq("product_id", product_id)
    .in("tour_id", tourIds);

  if (assignmentsError) {
    console.error("Error fetching assignments:", assignmentsError);
    throw new Error("Failed to fetch tour assignments");
  }

  // Create a set of assigned tour IDs for quick lookup
  const assignedTourIds = new Set(assignments?.map((a) => a.tour_id) || []);

  // Combine tours with assignment status
  const toursWithStatus: TourWithAssignmentStatus[] = allTours.map((tour) => ({
    ...tour,
    is_assigned: assignedTourIds.has(tour.id),
  }));

  return {
    data: toursWithStatus,
    total_count: totalCount || 0,
  };
}
