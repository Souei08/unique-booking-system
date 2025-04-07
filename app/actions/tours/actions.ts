"use server";

import { Tour, CreateTourDTO, UpdateTourDTO } from "@/app/_lib/types/tours";
import { createClient } from "@/supabase/server";

interface SuccessResponse {
  success: boolean;
  message?: string;
}

export const createTour = async (
  tour: CreateTourDTO
): Promise<SuccessResponse> => {
  const supabase = await createClient();

  const { error } = await supabase.from("tours").insert(tour);

  if (error) return { success: false, message: error.message };

  return { success: true };
};

export const updateTour = async (
  tourId: string,
  tour: UpdateTourDTO
): Promise<SuccessResponse> => {
  const supabase = await createClient();

  const { error } = await supabase.from("tours").update(tour).eq("id", tourId);

  if (error) return { success: false, message: error.message };

  return { success: true };
};

export const deleteTour = async (tourId: string): Promise<SuccessResponse> => {
  const supabase = await createClient();

  const { error } = await supabase.from("tours").delete().eq("id", tourId);

  if (error) return { success: false, message: error.message };

  return { success: true };
};

export const getTour = async (tourId: string): Promise<Tour | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tours")
    .select("*")
    .eq("id", tourId)
    .single();

  if (error) return null;

  return data as Tour;
};
