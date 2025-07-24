"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Tour } from "@/app/_features/tours/tour-types";

/**
 * Get a tour by ID
 * @param id The ID of the tour to get
 * @returns The tour
 */
export const getTourById = async (tourId: string): Promise<Tour | null> => {
  try {
    const supabase = createClientComponentClient();

    const { data, error } = await supabase
      .from("tours")
      .select("*")
      .eq("id", tourId)
      .eq("status", "active")
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error fetching tour:", error);
    return null;
  }
};
