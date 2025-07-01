import React from "react";
import { getAllTours } from "@/app/_features/tours/api/getAllTours";
import { ClockIcon, UsersIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/20/solid";
import Image from "next/image";
import CustomerHeader from "@/app/_features/customer/CustomerHeader";

interface ToursPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
  }>;
}

const ToursPage = async ({ searchParams }: ToursPageProps) => {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const pageSize = parseInt(params.pageSize || "12");
  const search = params.search || null;

  const tours = await getAllTours();

  // Filter tours based on search and status
  let filteredTours = tours;

  if (search) {
    filteredTours = filteredTours.filter(
      (tour) =>
        tour.title.toLowerCase().includes(search.toLowerCase()) ||
        tour.description.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Note: Status filtering removed as Tour type doesn't have a status property

  // Calculate pagination
  const totalCount = filteredTours.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTours = filteredTours.slice(startIndex, endIndex);

  // Transform tours data to match the expected booking format
  const bookings = paginatedTours.map((tour: any) => ({
    title: tour.title,
    href: `/tours/${tour.id}`,
    category: tour.category || "Adventure Tour",
    description: tour.description,
    price: tour.rate,
    groupSize: `${tour.group_size_limit} people`,
    imageUrl: tour?.images
      ? JSON.parse(tour.images)[0]?.url
      : "https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1679&q=80",
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <a
              href={`/tours?page=${Math.max(1, page - 1)}${search ? `&search=${search}` : ""}`}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                page <= 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-strong hover:text-brand"
              }`}
              onClick={(e) => page <= 1 && e.preventDefault()}
            >
              Previous
            </a>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <a
                  key={pageNum}
                  href={`/tours?page=${pageNum}${search ? `&search=${search}` : ""}`}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    page === pageNum
                      ? "bg-brand text-white"
                      : "text-strong hover:text-brand"
                  }`}
                >
                  {pageNum}
                </a>
              );
            })}

            <a
              href={`/tours?page=${Math.min(totalPages, page + 1)}${search ? `&search=${search}` : ""}`}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                page >= totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-strong hover:text-brand"
              }`}
              onClick={(e) => page >= totalPages && e.preventDefault()}
            >
              Next
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToursPage;
