import { createClient } from "@/supabase/client";

interface BookingAmountValidationResult {
  slot_total: number;
  product_total: number;
  calculated_total: number;
  stored_total: number;
  is_valid: boolean;
  slot_details_json: any[];
  booked_products_json: any[];
}

export async function validateBookingAmount(
  bookingId: string
): Promise<BookingAmountValidationResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("validate_booking_amount", {
    booking_id: bookingId,
  });

  if (error) {
    console.error("Failed to validate booking amount:", error);
    throw new Error("Validation failed");
  }

  if (!data || data.length === 0) {
    throw new Error("No validation result returned");
  }

  return data[0];
}
