"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getBookingByToken } from "../booking/api/get-booking/getBookingByToken";
import { BookingTable } from "../booking/types/booking-types";
import CustomerUpdateBookingForm from "./CustomerUpdateBookingForm";
import { getOneBooking } from "../booking/api/get-booking/getOneBooking";

export default function UpdateCustomerBooking() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [booking, setBooking] = useState<BookingTable | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get manage token and validate it's not empty
  const manageToken = searchParams.get("manage_token")?.trim() || null;

  const fetchBooking = async () => {
    try {
      if (!manageToken) {
        setError(
          "No booking token provided. Please check your link and try again."
        );
        setLoading(false);
        return;
      }

      const bookingData = await getOneBooking(null, manageToken);

      if (!bookingData) {
        setError(
          "No booking found with this token. The booking may have been cancelled or the link may be invalid."
        );
        setLoading(false);
        return;
      }

      setBooking(bookingData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching booking:", error);
      setError(
        "Unable to load booking information. Please try again later or contact support if the problem persists."
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Check if manage token exists
    if (!manageToken) {
      setError(
        "No booking token provided. Please check your link and try again."
      );
      setLoading(false);
      return;
    }

    fetchBooking();
  }, [searchParams, mounted, manageToken]);

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="pt-10">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-10">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-red-600 font-semibold mb-2">
              Booking Not Found
            </div>
            <div className="text-red-500 text-sm">{error}</div>
            <div className="mt-4">
              <a
                href="/"
                className="text-blue-600 hover:text-blue-800 underline text-sm"
              >
                Return to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="pt-10">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="text-yellow-600 font-semibold mb-2">
              No Booking Found
            </div>
            <div className="text-yellow-500 text-sm">
              We couldn't find a booking with the provided information.
            </div>
            <div className="mt-4">
              <a
                href="/"
                className="text-blue-600 hover:text-blue-800 underline text-sm"
              >
                Return to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-10">
      <CustomerUpdateBookingForm
        bookingId={booking.id}
        manageToken={manageToken || ""}
        onClose={() => {}}
        onSuccess={() => {}}
      />
    </div>
  );
}
