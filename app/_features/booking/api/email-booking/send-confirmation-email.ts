"use server";

import ConfirmationEmailTemplate from "../../../../_components/emails/ConfirmationEmailTemplate";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBookingConfirmationEmail(bookingData: {
  full_name: string;
  email: string;
  booking_date: string;
  selected_time: string;
  slots: number;
  total_price: number;
  booking_reference_id: string;
  tour_name: string;
  tour_rate: number;
  products: Array<{
    product_name: string;
    product_id: string;
    quantity: number;
    unit_price: number;
  }>;
  slot_details: Array<{ type: string; price: number }>;
  manage_token: string;
  waiver_link: string;
  sub_total: number;
  coupon_code: string;
  discount_amount: number;
}) {
  try {
    const data = await resend.emails.send({
      from: "Unique Tours And Rentals <onboarding@resend.dev>", // ✅ Use a verified sender domain
      to: "jubet.sode.5@gmail.com",
      subject: `Booking Confirmation - ${bookingData.tour_name}`,
      react: ConfirmationEmailTemplate({ bookingData }),
    });

    return { success: true, data };
  } catch (error) {
    console.error("Resend Error:", error);
    return { success: false, error };
  }
}
