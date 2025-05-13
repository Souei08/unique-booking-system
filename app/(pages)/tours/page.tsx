import React from "react";
import { getAllTours } from "@/app/_features/tours/api/getTours";
import { ClockIcon, UsersIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/20/solid";
import Image from "next/image";
import CustomerHeader from "@/app/_features/customer/CustomerHeader";

const ToursPage = async () => {
  const tours = await getAllTours();

  // Transform tours data to match the expected booking format
  const bookings = tours.map((tour: any) => ({
    title: tour.title,
    href: `/tours/${tour.id}`,
    category: tour.category || "Adventure Tour",
    description: tour.description,
    price: tour.rate,
    groupSize: tour.groupSize || "1 to 7",
    imageUrl:
      tour?.image ||
      "https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1679&q=80",
    duration: `${tour.duration} hour${tour.duration > 1 ? "s" : ""}`,
    rating: 5, // You might want to make this dynamic based on actual ratings
  }));

  return (
    <div className="bg-background min-h-screen">
      <CustomerHeader />
      {/* Hero Section */}
      <div className="relative bg-strong py-14 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-h1 font-bold text-white mb-3">
            Available Tours & Rentals
          </h1>
          <p className="text-body-lg text-white/80 mx-auto max-w-2xl">
            Discover exciting tours and quality equipment rentals for your
            adventure
          </p>
        </div>
      </div>

      {/* Tours Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-10 pb-16">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking: any) => (
            <div
              key={booking.title}
              className="group relative flex flex-col overflow-hidden rounded-md bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              {/* Image Container */}
              <div className="relative aspect-[2/1] overflow-hidden">
                <Image
                  alt={booking.title}
                  src={booking.imageUrl}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  width={500}
                  height={300}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand/60 to-transparent" />
                <div className="absolute top-3 left-3 rounded-sm bg-white/90 backdrop-blur-sm px-2 py-1 text-tiny font-medium text-strong">
                  {booking.category}
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-4">
                <h3 className="text-h3 font-bold text-strong mb-2 line-clamp-1">
                  {booking.title}
                </h3>

                <div className="flex items-center gap-4 text-weak mb-3">
                  <div className="flex items-center gap-1.5">
                    <ClockIcon className="w-6 h-6" />
                    <div className="flex flex-col">
                      <span className="text-tiny uppercase tracking-wider">
                        Duration
                      </span>
                      <span className="text-tiny font-bold">
                        {booking.duration}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <UsersIcon className="w-6 h-6" />
                    <div className="flex flex-col">
                      <span className="text-tiny uppercase tracking-wider">
                        Group Size
                      </span>
                      <span className="text-tiny font-bold">
                        {booking.groupSize}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-body text-weak mb-5 line-clamp-2">
                  {booking.description}
                </p>

                <div className="mt-auto space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-stroke-weak">
                    <div className="flex flex-col">
                      <span className="text-tiny uppercase tracking-wider text-weak mb-0.5">
                        Rating
                      </span>
                      <div className="flex gap-0.5 text-brand">
                        {[...Array(booking.rating)].map((_, i) => (
                          <StarIcon key={i} className="w-4 h-4" />
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-tiny uppercase tracking-wider text-weak mb-0.5">
                        from
                      </div>
                      <div className="text-h3 font-bold text-strong">
                        ${booking.price}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={booking.href}
                      className="flex items-center justify-center rounded-sm bg-brand px-3 py-2 text-small font-semibold text-white tracking-wide transition-colors hover:bg-strong"
                    >
                      BOOK NOW
                    </a>
                    <a
                      href={`${booking.href}/details`}
                      className="flex items-center justify-center rounded-sm border border-stroke-weak px-3 py-2 text-small font-semibold text-weak tracking-wide transition-colors hover:border-stroke-strong hover:text-strong"
                    >
                      LEARN MORE
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

export default ToursPage;
