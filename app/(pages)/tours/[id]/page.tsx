"use client";

import { Fragment, useState, useEffect } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
  Radio,
  RadioGroup,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { ChevronDownIcon, StarIcon } from "@heroicons/react/20/solid";
import { useParams } from "next/navigation";
import { Tour } from "@/app/_features/tours/types/TourTypes";

// Mock data for the tour details page - aligned with Tour interface
const mockTour: Tour = {
  id: "1",
  title: "Mountain Adventure Tour",
  description:
    "Experience the breathtaking beauty of mountain landscapes with our Mountain Adventure Tour. This tour takes you through some of the most scenic routes, offering panoramic views and unforgettable experiences. Perfect for nature lovers and adventure seekers alike.",
  category: "Adventure",
  duration: 3, // in days
  group_size_limit: 12,
  rate: 299,
  slots: 8,
  meeting_point_address: "123 Mountain View Road, Adventure City",
  dropoff_point_address: "456 Summit Peak, Adventure City",
  languages: ["English", "Spanish", "French"],
  trip_highlights: [
    "Professional mountain guides",
    "All necessary equipment provided",
    "Scenic viewpoints and photo opportunities",
    "Local cuisine included",
    "Small group experience (max 12 people)",
    "Multi-language support",
  ],
  things_to_know:
    "Participants should be in good physical condition and bring appropriate clothing for mountain weather conditions. The tour includes transportation to and from the starting point, all necessary equipment, and meals during the tour.",
  includes: [
    "Professional mountain guides",
    "All necessary equipment",
    "Transportation to and from the starting point",
    "Meals during the tour",
    "First aid kit",
    "Emergency communication devices",
  ],
  faq: [
    "What should I bring? Comfortable hiking boots, weather-appropriate clothing, water bottle, and personal items.",
    "Is this tour suitable for beginners? Yes, this tour is designed for all skill levels with different difficulty options.",
    "What happens in case of bad weather? Tours may be rescheduled or modified based on weather conditions for safety.",
    "Are meals included? Yes, all meals during the tour are included in the price.",
  ],
  created_at: "2023-01-15T10:30:00Z",
};

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

function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export default function TourDetailsPage() {
  const params = useParams();
  const tourId = params.id as string;

  const [tour, setTour] = useState<Tour>(mockTour);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real application, you would fetch the tour data from an API
    // For now, we'll use the mock data
    const fetchTour = async () => {
      try {
        // Simulate API call
        // const response = await fetch(`/api/tours/${tourId}`)
        // const data = await response.json()
        // setTour(data)

        // Using mock data for now
        setTour(mockTour);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching tour:", error);
        setIsLoading(false);
      }
    };

    fetchTour();
  }, [tourId]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white">
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
                  className="mr-2 text-sm font-medium text-gray-900"
                >
                  {tour.category}
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
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {tour.title}
            </h1>
            <div className="mt-2 flex items-center">
              <span className="text-sm text-gray-500">
                {tour.category} • {tour.duration} Days
              </span>
            </div>
          </div>

          {/* Options */}
          <div className="mt-4 lg:row-span-3 lg:mt-0">
            <h2 className="sr-only">Tour information</h2>
            <p className="text-3xl tracking-tight text-gray-900">
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
                      className={classNames(
                        reviews.average > rating
                          ? "text-gray-900"
                          : "text-gray-200",
                        "size-5 shrink-0"
                      )}
                    />
                  ))}
                </div>
                <p className="sr-only">{reviews.average} out of 5 stars</p>
                <a
                  href={reviews.href}
                  className="ml-3 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  {reviews.totalCount} reviews
                </a>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm text-gray-500">Group size:</span>
                  <span className="ml-2 text-sm font-medium text-gray-900">
                    Max {tour.group_size_limit} people
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500">
                    Available slots:
                  </span>
                  <span className="ml-2 text-sm font-medium text-gray-900">
                    {tour.slots}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center">
                <span className="text-sm text-gray-500">Languages:</span>
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
              <div className="flex items-center">
                <span className="text-sm text-gray-500">Meeting point:</span>
                <span className="ml-2 text-sm text-gray-900">
                  {tour.meeting_point_address}
                </span>
              </div>
            </div>

            <div className="mt-2">
              <div className="flex items-center">
                <span className="text-sm text-gray-500">Drop-off point:</span>
                <span className="ml-2 text-sm text-gray-900">
                  {tour.dropoff_point_address}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="mt-10 flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden"
            >
              Book this tour
            </button>
          </div>

          <div className="py-10 lg:col-span-2 lg:col-start-1 lg:border-r lg:border-gray-200 lg:pt-6 lg:pr-8 lg:pb-16">
            {/* Description and details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900">Description</h3>

              <div className="mt-4 space-y-6">
                <p className="text-base text-gray-900">{tour.description}</p>
              </div>
            </div>

            <div className="mt-10">
              <h3 className="text-lg font-medium text-gray-900">
                Trip Highlights
              </h3>

              <div className="mt-4">
                <ul role="list" className="list-disc space-y-2 pl-4 text-sm">
                  {tour.trip_highlights.map((highlight) => (
                    <li key={highlight} className="text-gray-600">
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-10">
              <h3 className="text-lg font-medium text-gray-900">
                What's Included
              </h3>

              <div className="mt-4">
                <ul role="list" className="list-disc space-y-2 pl-4 text-sm">
                  {tour.includes.map((item) => (
                    <li key={item} className="text-gray-600">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <section aria-labelledby="things-to-know-heading" className="mt-10">
              <h2
                id="things-to-know-heading"
                className="text-lg font-medium text-gray-900"
              >
                Things to Know
              </h2>

              <div className="mt-4 space-y-6">
                <p className="text-sm text-gray-600">{tour.things_to_know}</p>
              </div>
            </section>

            <section aria-labelledby="faq-heading" className="mt-10">
              <h2
                id="faq-heading"
                className="text-lg font-medium text-gray-900"
              >
                Frequently Asked Questions
              </h2>

              <div className="mt-4 space-y-6">
                <dl className="space-y-4">
                  {tour.faq.map((question, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4">
                      <dt className="text-sm font-medium text-gray-900">
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
                className="text-lg font-medium text-gray-900"
              >
                Customer Reviews
              </h2>

              <div className="mt-4 space-y-10">
                {reviews.featured.map((review) => (
                  <div key={review.id} className="flex flex-col sm:flex-row">
                    <div className="order-2 mt-6 sm:mt-0 sm:ml-16">
                      <h3 className="text-sm font-medium text-gray-900">
                        {review.title}
                      </h3>
                      <p className="sr-only">{review.rating} out of 5 stars</p>

                      <div
                        dangerouslySetInnerHTML={{ __html: review.content }}
                        className="mt-3 space-y-6 text-sm text-gray-600"
                      />
                    </div>

                    <div className="order-1 flex items-center sm:flex-col sm:items-start">
                      <img
                        alt={`${review.author}.`}
                        src={review.avatarSrc}
                        className="size-12 rounded-full"
                      />

                      <div className="ml-4 sm:mt-4 sm:ml-0">
                        <p className="text-sm font-medium text-gray-900">
                          {review.author}
                        </p>
                        <div className="mt-2 flex items-center">
                          {[0, 1, 2, 3, 4].map((rating) => (
                            <StarIcon
                              key={rating}
                              aria-hidden="true"
                              className={classNames(
                                review.rating > rating
                                  ? "text-gray-900"
                                  : "text-gray-200",
                                "size-5 shrink-0"
                              )}
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
              className="text-xl font-bold tracking-tight text-gray-900"
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
                      <h3 className="text-sm text-gray-700">
                        <a href={`/tours/${relatedTour.id}`}>
                          <span
                            aria-hidden="true"
                            className="absolute inset-0"
                          />
                          {relatedTour.title}
                        </a>
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {relatedTour.duration} Days
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      ${relatedTour.rate}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
