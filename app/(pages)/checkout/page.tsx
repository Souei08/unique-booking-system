"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getTour } from "@/app/actions/tours/actions";
import { Tour } from "@/app/_lib/types/tours";
import { CheckIcon } from "@heroicons/react/24/outline";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingComplete, setBookingComplete] = useState(false);

  // Get booking details from URL parameters
  const tourId = searchParams.get("tourId");
  const date = searchParams.get("date");
  const time = searchParams.get("time");
  const spots = searchParams.get("spots");

  useEffect(() => {
    const fetchTour = async () => {
      try {
        if (tourId) {
          const tourData = await getTour(tourId);
          setTour(tourData);
        }
      } catch (error) {
        console.error("Error fetching tour:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTour();
  }, [tourId]);

  const handleConfirmBooking = () => {
    // Here you would typically make an API call to create the booking
    // For now, we'll just simulate a successful booking
    setBookingComplete(true);

    // Redirect to a success page after 2 seconds
    setTimeout(() => {
      router.push("/booking-success");
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900">Tour not found</h1>
        <p className="mt-2 text-gray-600">
          The tour you are trying to book does not exist.
        </p>
        <a
          href="/tours"
          className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Browse Tours
        </a>
      </div>
    );
  }

  if (bookingComplete) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="rounded-full bg-green-100 p-3">
          <CheckIcon className="h-6 w-6 text-green-600" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Booking Confirmed!
        </h1>
        <p className="mt-2 text-gray-600">
          Your booking has been confirmed. You will receive a confirmation email
          shortly.
        </p>
        <p className="mt-4 text-sm text-gray-500">
          Redirecting to booking details...
        </p>
      </div>
    );
  }

  // Calculate total price
  const totalPrice = tour.rate * (spots ? parseInt(spots) : 1);

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Checkout
        </h1>

        <div className="mt-12">
          <div className="border-t border-gray-200 py-6">
            <h2 className="text-lg font-medium text-gray-900">
              Booking Details
            </h2>

            <dl className="mt-6 space-y-4 divide-y divide-gray-200">
              <div className="flex items-center justify-between pt-4">
                <dt className="text-sm font-medium text-gray-600">Tour</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {tour.title}
                </dd>
              </div>

              <div className="flex items-center justify-between pt-4">
                <dt className="text-sm font-medium text-gray-600">Date</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {date ? new Date(date).toLocaleDateString() : "Not selected"}
                </dd>
              </div>

              <div className="flex items-center justify-between pt-4">
                <dt className="text-sm font-medium text-gray-600">Time</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {time || "Not selected"}
                </dd>
              </div>

              <div className="flex items-center justify-between pt-4">
                <dt className="text-sm font-medium text-gray-600">
                  Number of Spots
                </dt>
                <dd className="text-sm font-medium text-gray-900">
                  {spots || "1"}
                </dd>
              </div>

              <div className="flex items-center justify-between pt-4">
                <dt className="text-sm font-medium text-gray-600">
                  Price per Person
                </dt>
                <dd className="text-sm font-medium text-gray-900">
                  ${tour.rate}
                </dd>
              </div>

              <div className="flex items-center justify-between pt-4">
                <dt className="text-base font-medium text-gray-900">Total</dt>
                <dd className="text-base font-medium text-gray-900">
                  ${totalPrice}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-10">
            <button
              onClick={handleConfirmBooking}
              className="w-full rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Confirm Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
