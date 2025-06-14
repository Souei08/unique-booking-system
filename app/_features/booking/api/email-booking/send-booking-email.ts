"use server";

import BookingConfirmationEmail from "../../../../_components/emails/BookingConfirmationEmail";
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
  waiver_link: string;
}) {
  try {
    const data = await resend.emails.send({
      from: "Unique Tours <onboarding@resend.dev>", // ✅ Use a verified sender domain
      to: "jubet.sode.5@gmail.com",
      subject: `Booking Confirmation - ${bookingData.tour_name}`,
      react: BookingConfirmationEmail({ bookingData }),
    });

    return { success: true, data };
  } catch (error) {
    console.error("Resend Error:", error);
    return { success: false, error };
  }
}
