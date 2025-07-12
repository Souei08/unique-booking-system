import { createClient } from "@/supabase/client";

interface BulkAssignProductToToursData {
  product_id: string;
  tour_ids: string[];
}

export const bulkAssignProductToTours = async (
  data: BulkAssignProductToToursData
) => {
  const supabase = await createClient();

  // Create array of assignment objects
  const assignments = data.tour_ids.map((tour_id) => ({
    tour_id,
    product_id: data.product_id,
  }));

  const { error } = await supabase.from("tour_products").insert(assignments);

  if (error) {
    if (error.code === "23505") {
      // Unique violation - some assignments already exist
      throw new Error("Some products are already assigned to these tours");
    }
    throw new Error("Failed to assign products to tours");
  }
};
