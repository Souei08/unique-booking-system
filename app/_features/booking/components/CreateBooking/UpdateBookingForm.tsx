"use client";

import React, { useState, useEffect } from "react";
import { Tour } from "@/app/_features/tours/types/TourTypes";
import { getBookingById } from "@/app/_api/actions/booking/actions";
import { CreateBookingForm } from "./CreateBookingForm";
import { useSearchParams } from "next/navigation";

export const UpdateBookingForm = () => {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  console.log(bookingId);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<any>(null);

  if (!bookingId) {
    return <div>Booking ID is required</div>;
  }

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        const booking = await getBookingById(bookingId);
        if (!booking) {
          setError("Booking not found");
          return;
        }
        setBookingData(booking);
      } catch (err) {
        setError("Error fetching booking data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingData();
  }, [bookingId]);

  if (isLoading) {
    return <div>Loading booking data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!bookingData) {
    return <div>No booking data available</div>;
  }

  // Pass the booking data as default values to CreateBookingForm
  return (
    <CreateBookingForm
      defaultValues={{
        tourId: bookingData.tour_id,
        date: bookingData.date,
        start_time: bookingData.start_time,
        spots: bookingData.spots,
        total_price: bookingData.total_price,
        customer_email: bookingData.user_email,
        first_name: bookingData.first_name,
        last_name: bookingData.last_name,
        phone_number: bookingData.phone_number,
      }}
      isUpdate={true}
      bookingId={bookingId}
    />
  );
};
