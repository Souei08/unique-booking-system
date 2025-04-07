"use client";

import { Tour } from "@/app/_lib/types/tours";
import { TourHeader } from "./TourHeader";
import { TourGallery } from "./TourGallery";
import { TourInfo } from "./TourInfo";
import { TourReviews } from "./TourReviews";
import { RelatedTours } from "./RelatedTours";
import { Footer } from "./Footer";

interface TourDetailsProps {
  tour: Tour;
}

export default function TourDetails({ tour }: TourDetailsProps) {
  return (
    <div className="bg-white">
      <TourHeader />

      <main className="pt-10 sm:pt-16">
        <nav aria-label="Breadcrumb">
          <ol
            role="list"
            className="mx-auto flex max-w-2xl items-center space-x-2 px-4 sm:px-6 lg:max-w-7xl lg:px-8"
          >
            <li>
              <div className="flex items-center">
                <a
                  href="/tours"
                  className="mr-2 text-sm font-medium text-gray-900"
                >
                  Tours
                </a>
                <svg
                  width={16}
                  height={20}
                  viewBox="0 0 16 20"
                  fill="currentColor"
                  aria-hidden="true"
                  className="h-5 w-4 text-gray-300"
                >
                  <path d="M5.697 4.34L8.98 16.532h1.327L7.025 4.341H5.697z" />
                </svg>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <a
                  href={`/tours?category=${tour.category}`}
                  className="mr-2 text-sm font-medium text-gray-900"
                >
                  {tour.category}
                </a>
                <svg
                  width={16}
                  height={20}
                  viewBox="0 0 16 20"
                  fill="currentColor"
                  aria-hidden="true"
                  className="h-5 w-4 text-gray-300"
                >
                  <path d="M5.697 4.34L8.98 16.532h1.327L7.025 4.341H5.697z" />
                </svg>
              </div>
            </li>
            <li className="text-sm">
              <a
                href="#"
                aria-current="page"
                className="font-medium text-gray-500 hover:text-gray-600"
              >
                {tour.title}
              </a>
            </li>
          </ol>
        </nav>

        <TourGallery />
        <TourInfo tour={tour} />
        <TourReviews />
        <RelatedTours />
      </main>

      <Footer />
    </div>
  );
}
