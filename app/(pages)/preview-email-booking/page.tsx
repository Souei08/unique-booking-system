import { ConfirmationEmailTemplate } from "@/app/_components/emails/ConfirmationEmailTemplate";

export default function PreviewBooking() {
  const bookingData = {
    full_name: "Jane Doe",
    email: "jane@example.com",
    booking_date: "2024-07-01",
    selected_time: "15:00",
    slots: 3,
    total_price: 250.0,
    booking_reference_id: "BOOK123456",
    tour_name: "Sunset City Tour",
    manage_token: "abcdef12345",
    sub_total: 300.0,
    coupon_code: "WELCOME50",
    discount_amount: 50.0,
  };

  return <ConfirmationEmailTemplate bookingData={bookingData} />;
}
