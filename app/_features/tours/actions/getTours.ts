import { createClient } from "@/supabase/server";
import { Tour as ActionTour } from "@/app/_lib/types/tours";
/**
 * Get all tours
 * @returns Array of tours
 */
export async function getAllTours(): Promise<ActionTour[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tours")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tours:", error);
    throw new Error("Failed to fetch tours");
  }

  return data;
}
