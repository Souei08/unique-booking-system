import { createClient } from "@/supabase/client";

interface BookingData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  tour_id: string;
  booking_date: string;
  selected_time: string;
  slots: number;
  total_price: number;
  payment_method: string;
  payment_id: string;
}

export async function createTourBooking(data: BookingData): Promise<any> {
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
    !payment_id
  ) {
    throw new Error("Missing required fields.");
  }

  try {
    // ✅ Call Supabase SQL Function for Transaction Handling
    const { data: result, error } = await supabase.rpc("create_full_booking", {
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
    });

    if (error) {
      console.error("Booking Transaction Failed:", error);
      throw new Error("Booking failed. Please try again.");
    }

    if (!result || result.length === 0) {
      throw new Error("Booking creation failed. No data returned.");
    }

    return {
      success: true,
      booking_id: result[0].booking_id,
      manage_link: `https://yourdomain.com/manage-booking/${result[0].manage_token}`,
    };
  } catch (err: any) {
    console.error("Unhandled Error:", err);
    throw new Error(err.message || "An unexpected error occurred.");
  }
}
