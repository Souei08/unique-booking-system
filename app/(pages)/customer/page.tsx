import React from "react";

import { getAllTours } from "@/app/_features/tours/actions/getTours";

const CustomerPage = async () => {
  const tours = await getAllTours();

  // Transform tours data to match the expected booking format
  const bookings = tours.map((tour: any) => ({
    title: tour.title,
    href: `/booking/${tour.id}`,
    category: {
      name: tour.category || "Adventure Tour",
      href: "#",
    },
    description: tour.description,
    price: `$${tour.rate}`,
    availability: "Available",
    imageUrl:
      tour?.image ||
      "https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1679&q=80",
    amenities: tour.amenities?.join(", ") || "Equipment Included",
    details: {
      duration: `${tour.duration} hours`,
      includes: tour.includes || "Basic Equipment",
      imageUrl: tour?.image || "",
    },
  }));

  return (
    <div className="relative bg-gray-50 px-6 pt-16 pb-20 lg:px-8 lg:pt-24 lg:pb-28">
      <div className="absolute inset-0">
        <div className="h-1/3 bg-white sm:h-2/3" />
      </div>
      <div className="relative mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Available Tours & Rentals
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-xl text-gray-500 sm:mt-4">
            Discover exciting tours and quality equipment rentals for your
            adventure
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-lg gap-5 lg:max-w-none lg:grid-cols-3">
          {bookings.map((booking: any) => (
            <div
              key={booking.title}
              className="flex flex-col overflow-hidden rounded-lg shadow-lg"
            >
              <div className="shrink-0">
                <img
                  alt={booking.title}
                  src={booking.imageUrl}
                  className="h-48 w-full object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between bg-white p-6">
                <div className="flex-1">
                  <p className="text-sm font-medium text-indigo-600">
                    <a href={booking.category.href} className="hover:underline">
                      {booking.category.name}
                    </a>
                  </p>
                  <a href={booking.href} className="mt-2 block">
                    <p className="text-xl font-semibold text-gray-900">
                      {booking.title}
                    </p>
                    <p className="mt-3 text-base text-gray-500">
                      {booking.description}
                    </p>
                  </a>
                </div>
                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-gray-900">
                      {booking.price}
                      <span className="text-sm text-gray-500">/person</span>
                    </p>
                    <p className="text-sm font-medium text-green-600">
                      {booking.availability}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <span>{booking.details.duration}</span>
                    {/* <span className="mx-2">•</span> */}
                    {/* <span>{booking.amenities}</span> */}
                  </div>
                  <div className="mt-4">
                    <a
                      href={booking.href}
                      className="block w-full rounded-md bg-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-500"
                    >
                      Book Now
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerPage;
