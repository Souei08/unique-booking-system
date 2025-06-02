import { createClient } from "@/supabase/client";

interface UpdateBookingPaymentData {
  booking_id: string;
  payment_link?: string;
  status?: string;
  updated_at?: string;
}

export async function updateBookingPayment(
  data: UpdateBookingPaymentData
): Promise<{
  success: boolean;
  data: any;
}> {
  try {
    const supabase = await createClient();

    const updateData: any = {};
    if (data.payment_link) updateData.payment_link = data.payment_link;
    if (data.status) updateData.status = data.status;
    updateData.updated_at = new Date().toISOString();

    const { data: result, error } = await supabase
      .from("tour_bookings")
      .update(updateData)
      .eq("id", data.booking_id)
      .select()
      .single();

    if (error) {
      console.error("Error updating booking payment:", error);
      throw error;
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error in updateBookingPayment:", error);
    throw error;
  }
}
