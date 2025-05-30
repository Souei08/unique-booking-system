import { createClient } from "@/supabase/client";
import { Tour } from "../tour-types";

export async function getAllTours(): Promise<Tour[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tours")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tours:", error);
    throw new Error("Failed to fetch tours");
  }

  return data as Tour[];
}
