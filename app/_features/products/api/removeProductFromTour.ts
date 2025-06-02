import { createClient } from "@/supabase/client";

interface RemoveProductFromTourData {
  tour_id: string;
  product_id: string;
}

export const removeProductFromTour = async (
  data: RemoveProductFromTourData
) => {
  const supabase = await createClient();

  const { error } = await supabase.from("tour_products").delete().match({
    tour_id: data.tour_id,
    product_id: data.product_id,
  });

  if (error) {
    console.error("Error removing product from tour:", error);
    throw new Error("Failed to remove product from tour");
  }
};
