import { createClient } from "@/supabase/server";
import { Tour as ActionTour } from "@/app/_features/tours/tour-types";
import { revalidateTours } from "./revalidateTours";

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

  // Revalidate the tours pages
  await revalidateTours();

  return tour;
}
