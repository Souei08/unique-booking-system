"use client";

import { useState } from "react";
import { StarIcon } from "@heroicons/react/20/solid";
import { Tour } from "@/app/_features/tours/tour-types";
import CustomerHeader from "@/app/_features/customer/CustomerHeader";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import CreateBookingv2 from "@/app/_features/booking/components/CreateBookingv2/CreateBookingv2";

// Mock reviews data
const reviews = {
  href: "#",
  average: 4.8,
  totalCount: 117,
  featured: [
    {
      id: 1,
      title: "An unforgettable experience",
      rating: 5,
      content: `
        <p>The Mountain Adventure Tour exceeded all my expectations. The guides were knowledgeable and friendly, and the views were absolutely breathtaking. I highly recommend this tour to anyone looking for an adventure.</p>
      `,
      author: "Mark Edwards",
      avatarSrc:
        "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixqx=oilqXxSqey&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
      id: 2,
      title: "Perfect for nature lovers",
      rating: 4,
      content: `
        <p>As someone who loves nature and hiking, this tour was perfect for me. The trails were well-maintained, and the guides were very informative about the local flora and fauna. The only reason I'm giving it 4 stars instead of 5 is that I wish it had been longer!</p>
      `,
      author: "Blake Reid",
      avatarSrc:
        "https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.5&w=256&h=256&q=80",
    },
    {
      id: 3,
      title: "Great for beginners",
      rating: 5,
      content: `
        <p>I was a bit nervous about going on a mountain tour as I'm not an experienced hiker, but the guides made me feel comfortable and safe throughout the entire journey. The pace was perfect, and I never felt overwhelmed. I'll definitely be booking another tour soon!</p>
      `,
      author: "Ben Russel",
      avatarSrc:
        "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
  ],
};

// Mock related tours
const relatedTours = [
  {
    id: "2",
    title: "Beach Paradise Tour",
    description: "Relax on pristine beaches and enjoy crystal clear waters.",
    category: "Beach",
    duration: 3,
    rate: 199,
    imageSrc:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1473&q=80",
  },
  {
    id: "3",
    title: "City Explorer Tour",
    description: "Discover the hidden gems of the city with our expert guides.",
    category: "Urban",
    duration: 2,
    rate: 149,
    imageSrc:
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
  },
  {
    id: "4",
    title: "Wildlife Safari Tour",
    description: "Get up close with exotic wildlife in their natural habitat.",
    category: "Wildlife",
    duration: 5,
    rate: 399,
    imageSrc:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1468&q=80",
  },
  {
    id: "5",
    title: "Desert Adventure Tour",
    description: "Experience the magic of the desert with our guided tour.",
    category: "Desert",
    duration: 4,
    rate: 249,
    imageSrc:
      "https://images.unsplash.com/photo-1509316785289-025f5b846b35?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1476&q=80",
  },
];

// Mock tour images
const tourImages = [
  {
    src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    alt: "Mountain landscape with snow-capped peaks.",
  },
  {
    src: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1473&q=80",
    alt: "Hikers on a mountain trail.",
  },
  {
    src: "https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    alt: "Scenic mountain view with lake.",
  },
  {
    src: "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80",
    alt: "Mountain peak at sunset.",
  },
];

interface TourDetailsClientProps {
  tour: Tour;
}

export default function TourDetailsClient({ tour }: TourDetailsClientProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);

  return (
    <div className="bg-white">
      <CustomerHeader />
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
                  className="mr-2 text-small font-medium text-strong"
                >
                  Tours
                </a>
                <svg
                  fill="currentColor"
                  width={16}
                  height={20}
                  viewBox="0 0 16 20"
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
                  className="mr-2 text-small font-medium text-strong"
                >
                  {tour.category
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (char) => char.toUpperCase())}
                </a>
                <svg
                  fill="currentColor"
                  width={16}
                  height={20}
                  viewBox="0 0 16 20"
                  aria-hidden="true"
                  className="h-5 w-4 text-gray-300"
                >
                  <path d="M5.697 4.34L8.98 16.532h1.327L7.025 4.341H5.697z" />
                </svg>
              </div>
            </li>
            <li className="text-small">
              <a
                href="#"
                aria-current="page"
                className="font-medium text-strong hover:text-weak"
              >
                {tour.title}
              </a>
            </li>
          </ol>
        </nav>

        {/* Image gallery */}
        <div className="mx-auto mt-6 max-w-2xl sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-3 lg:gap-x-8 lg:px-8">
          <img
            alt={tourImages[selectedImage].alt}
            src={tourImages[selectedImage].src}
            className="hidden aspect-3/4 size-full rounded-lg object-cover lg:block"
          />
          <div className="hidden lg:grid lg:grid-cols-1 lg:gap-y-8">
            {tourImages.slice(1, 3).map((image, index) => (
              <img
                key={index}
                alt={image.alt}
                src={image.src}
                className="aspect-3/2 size-full rounded-lg object-cover"
              />
            ))}
          </div>
          <img
            alt={tourImages[3].alt}
            src={tourImages[3].src}
            className="aspect-4/5 size-full object-cover sm:rounded-lg lg:aspect-3/4"
          />
        </div>

        {/* Tour info */}
        <div className="mx-auto max-w-2xl px-4 pt-10 sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-3 lg:grid-rows-[auto_auto_1fr] lg:gap-x-8 lg:px-8 lg:pt-16">
          <div className="lg:col-span-2 lg:border-r lg:border-gray-200 lg:pr-8">
            <h1 className="text-2xl font-bold tracking-tight text-strong sm:text-3xl">
              {tour.title}
            </h1>
            <div className="mt-2 flex items-center">
              <span className="text-small text-strong">
                {tour.category
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (char) => char.toUpperCase())}{" "}
                • {tour.duration} Hours
              </span>
            </div>
          </div>

          {/* Options */}
          <div className="mt-4 lg:row-span-3 lg:mt-0">
            <h2 className="sr-only">Tour information</h2>
            <p
              className="text-h2
            font-bold tracking-tight text-strong"
            >
              ${tour.rate}
            </p>

            {/* Reviews */}
            <div className="mt-6">
              <h3 className="sr-only">Reviews</h3>
              <div className="flex items-center">
                <div className="flex items-center">
                  {[0, 1, 2, 3, 4].map((rating) => (
                    <StarIcon
                      key={rating}
                      aria-hidden="true"
                      className={
                        reviews.average > rating
                          ? "text-strong size-5 shrink-0"
                          : "text-gray-200 size-5 shrink-0"
                      }
                    />
                  ))}
                </div>
                <p className="sr-only">{reviews.average} out of 5 stars</p>
                <a
                  href={reviews.href}
                  className="ml-3 text-small font-medium text-indigo-600 hover:text-indigo-500"
                >
                  {reviews.totalCount} reviews
                </a>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-small text-strong">Group size:</span>
                  <span className="ml-2 text-small font-medium text-strong">
                    Max {tour.group_size_limit} people
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-small text-strong">
                    Available slots:
                  </span>
                  <span className="ml-2 text-small font-medium text-strong">
                    {tour.slots}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center">
                <span className="text-small text-strong">Languages:</span>
                <div className="ml-2 flex flex-wrap gap-1">
                  {tour.languages.map((language) => (
                    <span
                      key={language}
                      className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex flex-col">
                <span className="text-body font-medium text-strong mb-2">
                  Meeting point:
                </span>
                <span className="text-small text-strong">
                  {tour.meeting_point_address}
                </span>
              </div>
            </div>

            <div className="mt-2">
              <div className="flex flex-col">
                <span className="text-body font-medium text-strong mb-2">
                  Drop-off point:
                </span>
                <span className="text-small text-strong">
                  {tour.dropoff_point_address}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsBookingDialogOpen(true)}
              className="mt-10 flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden"
            >
              Book this tour
            </button>
          </div>

          <div className="py-10 lg:col-span-2 lg:col-start-1 lg:border-r lg:border-gray-200 lg:pt-6 lg:pr-8 lg:pb-16">
            {/* Description and details */}
            <div>
              <h3 className="text-body-lg font-bold text-strong">
                Description
              </h3>

              <div className="mt-4 space-y-6">
                <p className="text-base text-strong">{tour.description}</p>
              </div>
            </div>

            <div className="mt-10">
              <h3 className="text-body-lg font-bold text-strong">
                Trip Highlights
              </h3>

              <div className="mt-4">
                <ul role="list" className="list-disc space-y-2 pl-4 text-small">
                  {tour.trip_highlights.map((highlight) => (
                    <li key={highlight} className="text-weak">
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-10">
              <h3 className="text-body-lg font-bold text-strong">
                What's Included
              </h3>

              <div className="mt-4">
                <ul role="list" className="list-disc space-y-2 pl-4 text-small">
                  {tour.includes.map((item) => (
                    <li key={item} className="text-weak">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* <section aria-labelledby="things-to-know-heading" className="mt-10">
              <h2
                id="things-to-know-heading"
                className="text-body-lg font-bold text-strong"
              >
                Things to Know
              </h2>

              <div className="mt-4 space-y-6">
                <p className="text-small text-weak">{tour.things_to_know}</p>
              </div>
            </section> */}

            <section aria-labelledby="faq-heading" className="mt-10">
              <h2
                id="faq-heading"
                className="text-body-lg font-bold text-strong"
              >
                Frequently Asked Questions
              </h2>

              <div className="mt-4 space-y-6">
                <dl className="space-y-4">
                  {typeof tour.faq === "string"
                    ? JSON.parse(tour.faq).map(
                        (question: string, index: number) => (
                          <div
                            key={index}
                            className="border-b border-gray-200 pb-4"
                          >
                            <dt className="text-body font-medium text-strong mb-2">
                              {JSON.parse(question).question}
                            </dt>
                            <dd className="mt-1 text-smallall text-weak">
                              {JSON.parse(question).answer}
                            </dd>
                          </div>
                        )
                      )
                    : tour.faq.map((question: string, index: number) => (
                        <div
                          key={index}
                          className="border-b border-gray-200 pb-4"
                        >
                          <dt className="text-small font-medium text-strong">
                            {question}
                          </dt>
                        </div>
                      ))}
                </dl>
              </div>
            </section>
          </div>

          <div className="lg:col-span-2 lg:border-r lg:border-gray-200 lg:pr-8">
            {/* Reviews */}
            <section
              aria-labelledby="reviews-heading"
              className="border-t border-gray-200 pt-10 lg:pt-16"
            >
              <h2
                id="reviews-heading"
                className="text-body-lg font-bold text-strong"
              >
                Customer Reviews
              </h2>

              <div className="mt-4 space-y-10">
                {reviews.featured.map((review) => (
                  <div key={review.id} className="flex flex-col sm:flex-row">
                    <div className="order-2 mt-6 sm:mt-0 sm:ml-16">
                      <h3 className="text-small font-medium text-strong">
                        {review.title}
                      </h3>
                      <p className="sr-only">{review.rating} out of 5 stars</p>

                      <div
                        dangerouslySetInnerHTML={{ __html: review.content }}
                        className="mt-3 space-y-6 text-small text-weak"
                      />
                    </div>

                    <div className="order-1 flex items-center sm:flex-col sm:items-start">
                      <img
                        alt={`${review.author}.`}
                        src={review.avatarSrc}
                        className="size-12 rounded-full"
                      />

                      <div className="ml-4 sm:mt-4 sm:ml-0">
                        <p className="text-small font-medium text-strong">
                          {review.author}
                        </p>
                        <div className="mt-2 flex items-center">
                          {[0, 1, 2, 3, 4].map((rating) => (
                            <StarIcon
                              key={rating}
                              aria-hidden="true"
                              className={
                                review.rating > rating
                                  ? "text-strong size-5 shrink-0"
                                  : "text-gray-200 size-5 shrink-0"
                              }
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
        <section aria-labelledby="related-tours-heading" className="bg-white">
          <div className="mx-auto max-w-2xl px-4 py-24 sm:px-6 lg:max-w-7xl lg:px-8">
            <h2
              id="related-tours-heading"
              className="text-xl font-bold tracking-tight text-strong"
            >
              You might also like
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
              {relatedTours.map((relatedTour) => (
                <div key={relatedTour.id} className="group relative">
                  <img
                    alt={relatedTour.title}
                    src={relatedTour.imageSrc}
                    className="aspect-square w-full rounded-md bg-gray-200 object-cover group-hover:opacity-75 lg:aspect-auto lg:h-80"
                  />
                  <div className="mt-4 flex justify-between">
                    <div>
                      <h3 className="text-small text-gray-700">
                        <a href={`/tours/${relatedTour.id}`}>
                          <span
                            aria-hidden="true"
                            className="absolute inset-0"
                          />
                          {relatedTour.title}
                        </a>
                      </h3>
                      <p className="mt-1 text-small text-strong">
                        {relatedTour.duration} Hours
                      </p>
                    </div>
                    <p className="text-small font-medium text-strong">
                      ${relatedTour.rate}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[800px] lg:max-w-[1500px] max-h-[95vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Book Your Tour</DialogTitle>
          </DialogHeader>
          <CreateBookingv2
            customerSelectedTour={tour}
            onClose={() => setIsBookingDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
