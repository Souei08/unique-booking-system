import { createClient } from "@/supabase/client";

interface TourProduct {
  tour_id: string;
  products: {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
  };
}

export const getAssignedToursByTourId = async (tourId: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tour_products")
    .select(
      `
      tour_id,
      products:product_id (
        id,
        name,
        description,
        price,
        image_url
      )
    `
    )
    .eq("tour_id", tourId);

  if (error) {
    console.error("Error fetching assigned tours:", error);
    throw new Error("Failed to fetch assigned tours");
  }

  // Transform the data to match the expected format
  return data?.map((item) => item.products) || [];
};
