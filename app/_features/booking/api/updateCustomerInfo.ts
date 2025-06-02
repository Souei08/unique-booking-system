import { createClient } from "@/supabase/client";

interface UpdateCustomerInfoData {
  booking_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
}

export async function updateCustomerInfo(
  data: UpdateCustomerInfoData
): Promise<{
  success: boolean;
  booking_id: string;
}> {
  const supabase = await createClient();

  const { booking_id, first_name, last_name, email, phone_number } = data;

  // Input Validation
  if (!booking_id || !first_name || !last_name || !email || !phone_number) {
    throw new Error("Missing required fields.");
  }

  try {
    // First get the customer_id from the booking
    const { data: bookingData, error: bookingError } = await supabase
      .from("tour_bookings")
      .select("customer_id")
      .eq("id", booking_id)
      .single();

    if (bookingError || !bookingData) {
      throw new Error("Booking not found");
    }

    // Update the users table
    const { error: userError } = await supabase
      .from("users")
      .update({
        full_name: `${first_name} ${last_name}`,
        email,
        phone_number,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingData.customer_id);

    if (userError) {
      console.error("Customer Update Failed:", userError);
      throw new Error("Failed to update customer information");
    }

    return {
      success: true,
      booking_id,
    };
  } catch (err: any) {
    console.error("Unhandled Error:", err);
    throw new Error(err.message || "An unexpected error occurred.");
  }
}
