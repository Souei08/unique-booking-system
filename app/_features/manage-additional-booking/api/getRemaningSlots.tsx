import { createClient } from "@/supabase/client";

export async function getRemainingSlots(
  tourId: string,
  date: string,
  time: string
): Promise<number> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc("get_remaining_slots", {
      p_tour_id: tourId,
      p_booking_date: date,
      p_selected_time: time,
    })
    .single();

  if (error) {
    console.error("Error fetching remaining slots:", error);
    throw new Error("Failed to fetch remaining slots");
  }

  return data as number;
}
