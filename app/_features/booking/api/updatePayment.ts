import { createClient } from "@/supabase/client";

interface UpdatePaymentData {
  booking_id: string;
  amount_paid: number;
  status?: string;
  payment_method?: string;
  payment_id?: string;
}

export async function updatePayment(data: UpdatePaymentData): Promise<{
  success: boolean;
  data: any;
}> {
  try {
    const supabase = await createClient();

    // First, get the payment record for this booking
    const { data: existingPayment, error: fetchError } = await supabase
      .from("payments")
      .select("*")
      .eq("booking_id", data.booking_id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching payment:", fetchError);
      throw new Error("Failed to fetch payment record");
    }

    const updateData: any = {
      amount_paid: data.amount_paid,
      updated_at: new Date().toISOString(),
    };

    if (data.status) updateData.status = data.status;
    if (data.payment_method) updateData.payment_method = data.payment_method;
    if (data.payment_id) updateData.payment_id = data.payment_id;

    let result;
    if (existingPayment) {
      // Update existing payment record
      const { data: updatedPayment, error: updateError } = await supabase
        .from("payments")
        .update(updateData)
        .eq("booking_id", data.booking_id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating payment:", updateError);
        throw new Error("Failed to update payment record");
      }

      result = updatedPayment;
    } else {
      // Create new payment record
      const { data: newPayment, error: insertError } = await supabase
        .from("payments")
        .insert({
          booking_id: data.booking_id,
          ...updateData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating payment:", insertError);
        throw new Error("Failed to create payment record");
      }

      result = newPayment;
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error in updatePayment:", error);
    throw error;
  }
}
