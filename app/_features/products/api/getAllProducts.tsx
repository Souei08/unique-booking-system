import { createClient } from "@/supabase/client";
import { Product } from "../types/product-types";

interface ProductFilters {
  limit_count?: number; // pagination limit
  offset_count?: number; // pagination offset
}

export async function getAllProducts(
  filters: ProductFilters = {}
): Promise<Product[]> {
  const supabase = await createClient();

  const { limit_count = 10, offset_count = 0 } = filters;

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset_count, offset_count + limit_count - 1);

  if (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }

  return data;
}
