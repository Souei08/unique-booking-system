"use server";

import { createClient } from "@/supabase/server";
import { Tour as ActionTour } from "../types";
import { Tour } from "@/app/_lib/types/tours";

/**
 * Create a new tour
 * @param data The tour data to create
 * @returns The created tour
 */
export async function createTour(
  data: Partial<ActionTour>
): Promise<ActionTour> {
  const supabase = await createClient();
  const { data: tour, error } = await supabase
    .from("tours")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("Error creating tour:", error);
    throw new Error("Failed to create tour");
  }

  return tour;
}

/**
 * Update a tour
 * @param id The ID of the tour to update
 * @param data The tour data to update
 * @returns The updated tour
 */
export async function updateTour(
  id: string,
  data: Partial<ActionTour>
): Promise<ActionTour> {
  const supabase = await createClient();
  const { data: tour, error } = await supabase
    .from("tours")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating tour:", error);
    throw new Error("Failed to update tour");
  }

  return tour;
}

/**
 * Delete a tour
 * @param id The ID of the tour to delete
 * @returns Success response
 */
export async function deleteTour(
  id: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("tours").delete().eq("id", id);

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Get all tours
 * @returns Array of tours
 */
export async function getAllTours(): Promise<ActionTour[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tours")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tours:", error);
    throw new Error("Failed to fetch tours");
  }

  return data;
}

/**
 * Get a tour by ID
 * @param id The ID of the tour to get
 * @returns The tour
 */
export async function getTourById(id: string): Promise<Tour | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tours")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching tour:", error);
      return null;
    }

    return data as unknown as Tour;
  } catch (error) {
    console.error("Error fetching tour:", error);
    return null;
  }
}
