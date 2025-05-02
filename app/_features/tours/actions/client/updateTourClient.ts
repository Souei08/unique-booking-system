import { createClient } from "@/supabase/client";
import { Tour as ActionTour } from "@/app/_features/tours/types/TourTypes";

export async function updateTourClient(
  id: string,
  data: Partial<ActionTour>
): Promise<ActionTour> {
  const supabase = await createClient();

  try {
    const { data: tour, error } = await supabase
      .from("tours")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error("Failed to update tour");
    }

    return tour;
  } catch (error) {
    throw error;
  }
}
