import { createClient } from "@/supabase/client";

export type AdditionalWithPayment = {
  additional_id: string;
  booking_id: string;
  added_slots: number;
  slot_details: any;
  added_products: any;
  note: string | null;
  additional_created_at: string;
  payment_id: string | null;
  payment_method: string | null;
  payment_reference: string | null;
  amount_paid: number | null;
  status: string | null;
  paid_at: string | null;
  refunded_amount: number | null;
  refunded_at: string | null;
  discount_amount: number | null;
};

// Legacy type for backward compatibility
export type BookingAdditional = AdditionalWithPayment;

export async function getAdditionalBookings(
  bookingId: string | null
): Promise<AdditionalWithPayment[]> {
  const supabase = await createClient();

  const idParam = bookingId?.trim() || null;

  const { data, error } = await supabase.rpc(
    "get_additional_bookings_with_payments",
    {
      p_booking_id: idParam,
    }
  );

  if (error) {
    console.error("Error fetching additional bookings:", error);
    throw new Error("F ailed to fetch additional bookings");
  }

  // Filter out duplicates that might be caused by the LEFT JOIN
  const uniqueData = (data as AdditionalWithPayment[]).filter(
    (item, index, self) =>
      index === self.findIndex((i) => i.additional_id === item.additional_id)
  );

  return uniqueData;
}

// Alias for backward compatibility
export const getAdditionalBookingsWithPayments = getAdditionalBookings;
