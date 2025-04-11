import { createClient } from "@/supabase/server";
import { Tour as ActionTour } from "@/app/_lib/types/tours";

/**
 * Update a tour
 * @param id The ID of the tour to update
 * @param data The tour data to update
 * @returns The updated tour
 */
export async function updateTour(
  id: string,
  data: Partial<ActionTour>
): Promise<ActionTour> {
  const supabase = await createClient();
  const { data: tour, error } = await supabase
    .from("tours")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating tour:", error);
    throw new Error("Failed to update tour");
  }

  return tour;
}
