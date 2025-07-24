"use server";

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Tour } from "@/app/_features/tours/tour-types";

export async function getTour(id: string): Promise<Tour | null> {
  const supabase = createServerComponentClient({ cookies });

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
}
