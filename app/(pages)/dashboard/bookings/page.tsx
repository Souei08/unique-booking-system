"use client";

import { BookingTableV2 } from "@/app/_features/booking/components/BookingTableV2";
import { getAllBookings } from "@/app/_features/booking/api/get-booking/getAllBookings";
import ContentLayout from "@/app/(pages)/dashboard/ContentLayout";
import { useEffect, useState } from "react";
import { BookingTable } from "@/app/_features/booking/types/booking-types";

function BookingsList() {
  const [bookings, setBookings] = useState<BookingTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const data = await getAllBookings();

      console.log(data);
      const updatedBookings = data.map((booking) => ({
        id: booking.booking_id,
        booking_id: booking.booking_id,
        full_name: booking.full_name,
        tour_id: booking.tour_id,
        user_id: booking.user_id,
        tour_title: booking.tour_title,
        slots: booking.slots,
        amount_paid: booking.amount_paid,
        total_price: booking.total_price,
        created_at: booking.booking_created_at,
        booking_created_at: booking.booking_created_at,
        booking_date: booking.booking_date,
        selected_time: booking.selected_time,
        first_name: booking.first_name,
        last_name: booking.last_name,
        email: booking.email,
        phone_number: booking.phone_number,
        manage_token: booking.manage_token,
        payment_method: booking.payment_method,
        transaction_id: booking.transaction_id,
        booking_status: booking.booking_status,
        payment_status: booking.payment_status,
        reference_number: booking.reference_number,
        stripe_payment_id: booking.stripe_payment_id,
        payment_link: booking.payment_link,
        tour_rate: booking.tour_rate,
        slot_details: booking.slot_details,
        custom_slot_types: booking.custom_slot_types,
        custom_slot_fields: booking.custom_slot_fields,
        booked_products: booking.booked_products,
        tour_featured_image: booking.tour_featured_image,
        tour_description: booking.tour_description,
      }));
      setBookings(updatedBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  if (isLoading) {
    return <div>Loading bookings...</div>;
  }

  return <BookingTableV2 bookings={bookings} onRefresh={fetchBookings} />;
}

export default function BookingsPage() {
  return (
    <ContentLayout
      title="List of Bookings"
      description="View and manage all current bookings for tours."
      buttonText="Create Direct Booking"
      modalTitle="Create a Direct Booking"
      modalDescription="Create a direct booking for a customer."
      modalRoute="booking"
    >
      <BookingsList />
    </ContentLayout>
  );
}
