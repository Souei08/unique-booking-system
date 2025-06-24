import { createClient } from "@/supabase/client";

export async function updateRegularSlots(
  bookingId: string,
  slots: number
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.rpc(
    "update_booking_slots_and_payment_basic",
    {
      input_booking_id: bookingId,
      new_slots: slots,
    }
  );

  if (error) {
    console.error("Error updating booking slots and payment:", error);
    throw new Error("Failed to update booking slots and payment");
  }
}
