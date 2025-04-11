import { createClient } from "@/supabase/server";
import { Tour as ActionTour } from "@/app/_lib/types/tours";

/**
 * Create a new tour
 * @param data The tour data to create
 * @returns The created tour
 */
export async function createTour(
  data: Partial<ActionTour>
): Promise<ActionTour> {
  const supabase = await createClient();
  const { data: tour, error } = await supabase
    .from("tours")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("Error creating tour:", error);
    throw new Error("Failed to create tour");
  }

  return tour;
}
