import { createClient } from "@/supabase/client";

interface TourProduct {
  tour_id: string;
  tours: {
    id: string;
    title: string;
  };
}

export const getAssignedToursByProductId = async (productId: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tour_products")
    .select(
      `
      tour_id,
      tours (
        id,
        title
      )
    `
    )
    .eq("product_id", productId);

  if (error) {
    console.error("Error fetching assigned tours:", error);
    throw new Error("Failed to fetch assigned tours");
  }

  // Transform the data to match the expected format
  return (data as unknown as TourProduct[]).map((item) => ({
    id: item.tours.id,
    title: item.tours.title,
  }));
};
