import { Tour } from "@/app/_lib/types/tours";
import { createClient } from "@/supabase/server";

/**
 * Get a tour by ID
 * @param id The ID of the tour to get
 * @returns The tour
 */
export async function getTourById(id: string): Promise<Tour | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tours")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching tour:", error);
      return null;
    }

    return data as unknown as Tour;
  } catch (error) {
    console.error("Error fetching tour:", error);
    return null;
  }
}
