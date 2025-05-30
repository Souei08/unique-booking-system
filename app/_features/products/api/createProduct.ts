import { createClient } from "@/supabase/client";
import { Product } from "../types/product-types";

interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  image_url?: string;
}

export const createProduct = async (
  data: CreateProductData
): Promise<Product> => {
  const supabase = await createClient();

  const { data: newProduct, error: insertError } = await supabase
    .from("products")
    .insert([data])
    .select()
    .single();

  if (insertError) {
    throw new Error("Failed to create product");
  }

  return newProduct;
};
