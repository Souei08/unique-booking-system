"use server";

import ConfirmationEmailTemplate from "../../../../_components/emails/ConfirmationEmailTemplate";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export type BookingEmailType =
  | "confirmation"
  | "resend"
  | "cancellation"
  | "refund"
  | "reminder";

export interface BookingEmailData {
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
  manage_link: string;
  waiver_link: string;
  sub_total: number;
  coupon_code: string;
  discount_amount: number;
}

export async function sendBookingEmail(
  bookingData: BookingEmailData,
  type: BookingEmailType = "confirmation"
) {
  try {
    let subject = "";
    let reactTemplate: React.ReactElement;

    switch (type) {
      case "confirmation":
      case "resend":
        subject = `Booking Confirmation - ${bookingData.tour_name}`;
        reactTemplate = ConfirmationEmailTemplate({ bookingData });
        break;
      // Future: Add cases for cancellation, refund, reminder, etc.
      default:
        subject = `Booking Notification - ${bookingData.tour_name}`;
        reactTemplate = ConfirmationEmailTemplate({ bookingData });
        break;
    }

    const data = await resend.emails.send({
      from: "Unique Tours And Rentals <info@uniquetoursandrentals.com>",
      to: bookingData.email,
      subject,
      react: reactTemplate,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Resend Error:", error);
    return { success: false, error };
  }
}

// Backward compatibility
export async function sendBookingConfirmationEmail(bookingData: BookingEmailData) {
  return sendBookingEmail(bookingData, "confirmation");
}
