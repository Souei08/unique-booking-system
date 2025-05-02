import { createClient } from "@/supabase/client";
import {
  Tour as ActionTour,
  CreateTourDTO,
} from "@/app/_features/tours/types/TourTypes";

export async function createTourClient(
  data: CreateTourDTO
): Promise<ActionTour> {
  const supabase = await createClient();

  try {
    const { data: tour, error } = await supabase
      .from("tours")
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error("Failed to create tour");
    }

    return tour;
  } catch (error) {
    throw error;
  }
}
