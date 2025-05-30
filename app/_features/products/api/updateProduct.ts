import { createClient } from "@/supabase/client";
import { Product } from "../types/product-types";

interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  image_url?: string;
}

export async function updateProduct(
  id: string,
  data: UpdateProductData
): Promise<Product> {
  const supabase = await createClient();

  const { data: updatedProduct, error } = await supabase
    .from("products")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating product:", error);
    throw new Error("Failed to update product");
  }

  return updatedProduct;
}
