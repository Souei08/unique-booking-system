import { createClient } from "@/supabase/client";

export async function fetchCalendarSlotSummary({
  month,
  year,
  tourTitle = null,
  onlyAvailable = false,
}: {
  month: number;
  year: number;
  tourTitle?: string | null;
  onlyAvailable?: boolean;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_filtered_slots", {
    filter_month: month,
    filter_year: year,
    tour_title: tourTitle,
    only_available: onlyAvailable,
  });

  if (error) {
    console.error("Failed to fetch calendar slots:", error);
    throw error;
  }

  return data;
}
