import { createClient } from "@/supabase/client";

export type AdditionalBookingData = {
  booking_id: string;
  added_slots: number;
  products: any[];
  slot_details: any;
  note: string | null;
  sub_total: number;
  discount_amount: number;
  payment_method: string;
  payment_id: string | null;
  full_name: string;
  email: string;
  phone_number: string;
  booking_date: string;
  selected_time: string;
  slots: number;
  total_price: number;
  booking_reference_id: string;
  tour_name: string;
  tour_rate: number;
  manage_token: string;
};

export async function createTourAdditionalBooking(
  data: AdditionalBookingData
): Promise<{
  success: boolean;
  additional_id: string;
  payment_id: string;
  payment_ref_id: string;
  email_response: any;
}> {
  const supabase = await createClient();

  const {
    booking_id,
    added_slots,
    products,
    slot_details,
    note,
    sub_total,
    discount_amount,
    payment_method,
    payment_id,
    full_name,
    email,
    booking_date,
    selected_time,
    slots,
    total_price,
    booking_reference_id,
    tour_name,
    tour_rate,
    manage_token,
  } = data;

  if (
    !booking_id ||
    sub_total === undefined ||
    sub_total === null ||
    !payment_method
  ) {
    throw new Error("Missing required fields for additional booking.");
  }

  if (added_slots <= 0 && (!products || products.length === 0)) {
    throw new Error("You must add at least slots or products.");
  }

  const serializedInput = {
    _booking_id: String(booking_id),
    _sub_total: Number(sub_total),
    _added_slots: Number(added_slots),
    _products: JSON.parse(JSON.stringify(products ?? [])),
    _slot_details: JSON.parse(JSON.stringify(slot_details ?? {})),
    _note: note ? String(note) : null,
    _discount_amount: Number(discount_amount ?? 0),
    _payment_method: String(payment_method),
    _payment_external_id:
      payment_id && payment_id.trim() !== "" ? String(payment_id) : null,
  };

  console.log("Serialized input data:", serializedInput);

  try {
    const { data: result, error } = await supabase.rpc(
      "create_full_additional_booking_v1",
      serializedInput
    );

    if (error) {
      console.error("Additional Booking Failed:", error);
      throw new Error("Adding additional booking failed. Please try again.");
    }

    if (!result || result.length === 0) {
      throw new Error("Additional booking creation failed. No data returned.");
    }

    console.table(result);
    const plainResult = JSON.parse(JSON.stringify(result));
    const additional = plainResult[0];

    const serializedResponse = {
      success: true,
      additional_id: additional.additional_id || "",
      payment_id: additional.payment_id || "",
      payment_ref_id: additional.payment_ref_id || "",
      email_response: {
        full_name: full_name,
        email: email,
        booking_date: booking_date,
        selected_time: selected_time,
        slots: slots,
        total_price: total_price,
        booking_reference_id: booking_reference_id,
        tour_name: tour_name,
        tour_rate: tour_rate,
        products,
        slot_details,
        manage_token: manage_token,
        waiver_link: "https://your-waiver-link.com",
        sub_total,
        coupon_code: null,
        discount_amount: discount_amount || null,

        booking_id,
        added_slots,
        note,
        payment_method,
      },
    };

    console.log("Serialized response:", serializedResponse);
    return serializedResponse;
  } catch (err: any) {
    console.error("Unhandled Error in Additional Booking:", err);
    throw new Error(err.message || "An unexpected error occurred.");
  }
}
