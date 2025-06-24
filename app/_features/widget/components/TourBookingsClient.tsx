"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import CreateBookingv2 from "../../booking/components/CreateBookingv2/CreateBookingv2";
import { getTourClient } from "../api/client/getTourClient";
import { Tour } from "../../tours/tour-types";

export default function TourBookingsClient() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const bookingId = searchParams.get("booking_id");
    if (!bookingId) {
      setTour(null);
      setLoading(false);
      return;
    }

    const fetchTour = async () => {
      try {
        const tourData = await getTourClient(bookingId);
        setTour(tourData);
      } catch (error) {
        console.error("Error fetching tour:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTour();
  }, [searchParams, mounted]);

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

  return (
    <div className="pt-10">
      <CreateBookingv2 onClose={() => {}} customerSelectedTour={tour as Tour} />
    </div>
  );
}
