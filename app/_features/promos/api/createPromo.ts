import { createClient } from "@/supabase/client";
import { Promo } from "../types/promo-types";

interface CreatePromoData {
  code: string;
  discount_type: string;
  discount_value: number;
  expires_at: string;
  max_uses: number;
  is_active: boolean;
}

export async function createPromo(data: CreatePromoData): Promise<Promo> {
  const supabase = createClient();

  const { data: newPromo, error } = await supabase
    .from("promo_codes")
    .insert([
      {
        ...data,
        times_used: 0,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating promo:", error);
    throw error;
  }

  return newPromo;
}
