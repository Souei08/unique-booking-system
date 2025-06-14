import { createClient } from "@/supabase/client";
import { Promo } from "../types/promo-types";

export async function getAllPromos(): Promise<Promo[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("promo_codes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching promos:", error);
    throw error;
  }

  return data || [];
}
