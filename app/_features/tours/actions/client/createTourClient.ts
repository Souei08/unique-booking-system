import { createClient } from "@/supabase/client";

import { Tour as ActionTour } from "@/app/_features/tours/types/TourTypes";

export async function createTourClient(
  data: Partial<ActionTour>
): Promise<ActionTour> {
  const supabase = await createClient();

  const { data: tour, error } = await supabase
    .from("tours")
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return tour!;
}
