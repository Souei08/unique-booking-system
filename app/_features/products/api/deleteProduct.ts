import { createClient } from "@/supabase/client";

export async function deleteProduct(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    console.error("Error deleting product:", error);
    throw new Error("Failed to delete product");
  }
}
