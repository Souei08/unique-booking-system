"use client";

import { useState } from "react";
import { StarIcon } from "@heroicons/react/20/solid";
import { Tour } from "@/app/_lib/types/tours";
import { BookingDialog } from "./BookingDialog";

// Mock reviews data - replace with actual reviews from the API
const reviews = {
  href: "#",
  average: 4,
  totalCount: 12,
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

interface TourInfoProps {
  tour: Tour;
}

export function TourInfo({ tour }: TourInfoProps) {
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);

  // Map experience levels to difficulty levels
  const difficultyMap = {
    beginner: "easy",
    advanced: "difficult",
    all: "medium",
  } as const;

  const difficulty = difficultyMap[tour.experience_level];

  return (
    <div className="mx-auto max-w-2xl px-4 pt-10 sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-3 lg:grid-rows-[auto_auto_1fr] lg:gap-x-8 lg:px-8 lg:pt-16">
      <div className="lg:col-span-2 lg:border-r lg:border-gray-200 lg:pr-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          {tour.title}
        </h1>
      </div>

      {/* Options */}
      <div className="mt-4 lg:row-span-3 lg:mt-0">
        <h2 className="sr-only">Tour information</h2>
        <p className="text-3xl tracking-tight text-gray-900">${tour.rate}</p>

        {/* Reviews */}
        <div className="mt-6">
          <h3 className="sr-only">Reviews</h3>
          <div className="flex items-center">
            <div className="flex items-center">
              {[0, 1, 2, 3, 4].map((rating) => (
                <StarIcon
                  key={rating}
                  aria-hidden="true"
                  className={classNames(
                    reviews && reviews.average > rating
                      ? "text-gray-900"
                      : "text-gray-200",
                    "h-5 w-5 shrink-0"
                  )}
                />
              ))}
            </div>
            <p className="sr-only">{reviews?.average || 0} out of 5 stars</p>
            <a
              href={reviews?.href || "#"}
              className="ml-3 text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              {reviews?.totalCount || 0} reviews
            </a>
          </div>
        </div>

        <div className="mt-10">
          {/* Tour details */}
          <div className="mt-10">
            <h3 className="text-sm font-medium text-gray-900">Tour Details</h3>

            <div className="mt-4">
              <ul role="list" className="list-disc space-y-2 pl-4 text-sm">
                <li className="text-gray-400">
                  <span className="text-gray-600">
                    Duration: {tour.duration} hours
                  </span>
                </li>
                <li className="text-gray-400">
                  <span className="text-gray-600">
                    Location: {tour.location}
                  </span>
                </li>
                <li className="text-gray-400">
                  <span className="text-gray-600">
                    Difficulty: {difficulty}
                  </span>
                </li>
                <li className="text-gray-400">
                  <span className="text-gray-600">
                    Group Size: Up to {tour.group_size_limit} people
                  </span>
                </li>
                <li className="text-gray-400">
                  <span className="text-gray-600">
                    Weight Limit: {tour.weight_limit} kg
                  </span>
                </li>
                <li className="text-gray-400">
                  <span className="text-gray-600">
                    Available Slots: {tour.slots}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <button
            onClick={() => setIsBookingDialogOpen(true)}
            className="mt-10 flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden"
          >
            Book Now
          </button>
        </div>
      </div>

      <div className="py-10 lg:col-span-2 lg:col-start-1 lg:border-r lg:border-gray-200 lg:pt-6 lg:pr-8 lg:pb-16">
        {/* Description and details */}
        <div>
          <h3 className="sr-only">Description</h3>

          <div className="space-y-6">
            <p className="text-base text-gray-900">{tour.description}</p>
          </div>
        </div>

        <div className="mt-10">
          <h3 className="text-sm font-medium text-gray-900">What's Included</h3>

          <div className="mt-4">
            <ul role="list" className="list-disc space-y-2 pl-4 text-sm">
              {tour.includes && tour.includes.length > 0 ? (
                tour.includes.map((item, index) => (
                  <li key={index} className="text-gray-400">
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-gray-400">
                  <span className="text-gray-600">No items included</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Booking Dialog */}
      <BookingDialog
        tour={tour}
        isOpen={isBookingDialogOpen}
        onClose={() => setIsBookingDialogOpen(false)}
      />
    </div>
  );
}
