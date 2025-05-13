// getAllToursClient.ts
import { createClient } from "@/supabase/client";
import { Tour } from "@/app/_features/tours/tour-types";

export async function getAllToursClient(): Promise<Tour[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tours")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tours:", error);
    throw new Error("Failed to fetch tours");
  }

  return data ?? [];
}
