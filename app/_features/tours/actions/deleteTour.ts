import { createClient } from "@/supabase/server";
import { Tour as ActionTour } from "@/app/_lib/types/tours";

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
