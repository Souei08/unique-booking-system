import { createClient } from "@/supabase/client";

interface BookingData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  tour_id: string;
  booking_date: string; // Format: YYYY-MM-DD
  selected_time: string; // Format: HH:mm:ss
  slots: number;
  total_price: number;
  payment_method: string;
  payment_id: string | null;
  products: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
  }>;
  slot_details: Array<{
    type: string;
    price: number;
  }>;
}

export async function createTourBookingv2(data: BookingData): Promise<{
  success: boolean;
  booking_id: string;
  //   manage_link: string;
}> {
  const supabase = await createClient();

  const {
    first_name,
    last_name,
    email,
    phone_number,
    tour_id,
    booking_date,
    selected_time,
    slots,
    total_price,
    payment_method,
    payment_id,
    products,
    slot_details,
  } = data;

  // ✅ Input Validation
  if (
    !first_name ||
    !last_name ||
    !email ||
    !phone_number ||
    !tour_id ||
    !booking_date ||
    !selected_time ||
    !slots ||
    !total_price ||
    !payment_method ||
    !slot_details
    // !payment_id
  ) {
    throw new Error("Missing required fields.");
  }

  try {
    // ✅ Call updated booking procedure: create_full_booking_v2
    const { data: result, error } = await supabase.rpc(
      "create_full_booking_v2",
      {
        _first_name: first_name,
        _last_name: last_name,
        _email: email,
        _phone_number: phone_number,
        _tour_id: tour_id,
        _booking_date: booking_date,
        _selected_time: selected_time,
        _slots: slots,
        _total_price: total_price,
        _payment_method: payment_method,
        _payment_id: payment_id,
        _products: products,
        _slot_details: slot_details,
      }
    );

    if (error) {
      console.error("Booking Transaction Failed:", error);
      throw new Error("Booking failed. Please try again.");
    }

    if (!result || result.length === 0) {
      throw new Error("Booking creation failed. No data returned.");
    }

    const booking = result[0];

    return {
      success: true,
      booking_id: booking.booking_id,
    };
  } catch (err: any) {
    console.error("Unhandled Error:", err);
    throw new Error(err.message || "An unexpected error occurred.");
  }
}
