import { createClient } from "@/supabase/client";

interface BulkRemoveProductFromToursData {
  product_id: string;
  tour_ids: string[];
}

export const bulkRemoveProductFromTours = async (
  data: BulkRemoveProductFromToursData
) => {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tour_products")
    .delete()
    .eq("product_id", data.product_id)
    .in("tour_id", data.tour_ids);

  if (error) {
    console.error("Error removing products from tours:", error);
    throw new Error("Failed to remove products from tours");
  }
};
