import { createClient } from "@/supabase/client";

interface AssignProductToTourData {
  tour_id: string;
  product_id: string;
}

export const assignProductToTour = async (data: AssignProductToTourData) => {
  const supabase = await createClient();

  const { error } = await supabase.from("tour_products").insert([data]);

  if (error) {
    if (error.code === "23505") {
      // Unique violation
      throw new Error("This product is already assigned to this tour");
    }
    throw new Error("Failed to assign product to tour");
  }
};
