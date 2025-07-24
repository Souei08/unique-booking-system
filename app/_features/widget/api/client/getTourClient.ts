"use client";

import { createClient } from "@/supabase/client";
import { Tour } from "@/app/_features/tours/tour-types";

export async function getTourClient(id: string): Promise<Tour | null> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("tours")
      .select("*")
      .eq("id", id)
      .eq("status", "active")
      .single();

    if (error) {
      console.error("Error fetching tour:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching tour:", error);
    return null;
  }
}
