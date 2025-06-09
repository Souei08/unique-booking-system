import { createClient } from "@/supabase/client";

interface BookingProduct {
  product_id: string;
  quantity: number;
  unit_price: number;
}

export async function updateBookingProducts(
  bookingId: string,
  products: BookingProduct[]
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.rpc("update_booking_products_and_payment", {
    input_booking_id: bookingId,
    new_products: products,
  });

  if (error) {
    console.error("Error updating booking products:", error);
    throw new Error("Failed to update booking products");
  }
}
