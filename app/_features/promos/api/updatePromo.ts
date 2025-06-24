import { createClient } from "@/supabase/client";
import { Promo } from "../types/promo-types";

interface UpdatePromoData {
  code: string;
  discount_type: string;
  discount_value: number;
  expires_at: string;
  max_uses: number;
  is_active: boolean;
}

export async function updatePromo(
  id: string,
  data: UpdatePromoData
): Promise<Promo> {
  const supabase = createClient();

  const { data: updatedPromo, error } = await supabase
    .from("promo_codes")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating promo:", error);
    throw error;
  }

  return updatedPromo;
}
