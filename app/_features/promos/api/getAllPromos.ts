import { createClient } from "@/supabase/client";
import { Promo } from "../types/promo-types";

interface GetPromoParams {
  limit: number;
  offset: number;
  searchText?: string | null;
  statusFilter?: "active" | "expired" | "inactive" | null;
  discountTypeFilter?: "percentage" | "fixed_amount" | null;
}

interface PaginatedPromoResponse {
  data: Promo[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Function to get total count of promos with filters
async function getPromoCount({
  searchText = null,
  statusFilter = null,
  discountTypeFilter = null,
}: Omit<GetPromoParams, "limit" | "offset">): Promise<number> {
  const supabase = createClient();

  let query = supabase
    .from("promo_codes")
    .select("id", { count: "exact", head: true });

  // Apply search filter
  if (searchText) {
    query = query.ilike("code", `%${searchText}%`);
  }

  // Apply status filter
  if (statusFilter) {
    if (statusFilter === "active") {
      query = query.gte("expires_at", new Date().toISOString());
    } else if (statusFilter === "expired") {
      query = query.lt("expires_at", new Date().toISOString());
    }
  }

  // Apply discount type filter
  if (discountTypeFilter) {
    query = query.eq("discount_type", discountTypeFilter);
  }

  const { count, error } = await query;

  if (error) {
    console.error("Error getting promo count:", error);
    throw error;
  }

  return count || 0;
}

export async function getAllPromos({
  limit,
  offset,
  searchText = null,
  statusFilter = null,
  discountTypeFilter = null,
}: GetPromoParams): Promise<PaginatedPromoResponse> {
  const supabase = createClient();

  // Get the filtered and paginated data
  const { data, error } = await supabase.rpc("get_promo_codes", {
    _limit: limit,
    _offset: offset,
    _search_text: searchText,
    _status_filter: statusFilter,
    _discount_type_filter: discountTypeFilter,
  });

  if (error) {
    console.error("Error fetching promos:", error);
    throw error;
  }

  // Transform the data to match our Promo interface
  const transformedData: Promo[] = (data || []).map((item: any) => ({
    id: item.id,
    code: item.code,
    discount_type: item.discount_type,
    discount_value: item.discount_value,
    expires_at: item.expires_at,
    max_uses: item.max_uses || 0,
    times_used: item.times_used || 0,
    is_active: item.status === "active",
    created_at: item.created_at,
  }));

  // Get total count for proper pagination
  const total = await getPromoCount({
    searchText,
    statusFilter,
    discountTypeFilter,
  });

  const page = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    data: transformedData,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext,
      hasPrev,
    },
  };
}
