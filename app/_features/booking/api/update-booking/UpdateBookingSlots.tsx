import { createClient } from "@/supabase/client";

export async function updateBookingSlots(
  bookingId: string,
  slotDetails: any,
  slots: number
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.rpc("update_booking_slots_and_payment", {
    input_booking_id: bookingId,
    new_slots: slots,
    new_slot_details: slotDetails,
  });

  if (error) {
    console.error("Error updating booking slots and payment:", error);
    throw new Error("Failed to update booking slots and payment");
  }
}
