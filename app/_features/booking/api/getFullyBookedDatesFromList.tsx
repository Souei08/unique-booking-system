import { createClient } from "@/supabase/client";

export async function getFullyBookedDatesFromList(
  tourId: string,
  dateList: string[]
): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "get_fully_booked_dates_from_list",
    {
      _tour_id: tourId,
      _dates: dateList,
    }
  );

  if (error) {
    console.error("Error checking booked dates:", error);
    return [];
  }

  return data.map((d: { date: string }) => d.date);
}
