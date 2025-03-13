import React from "react";

const Booking = () => {
  const bookings = [
    {
      title: "Mountain Bike Adventure",
      href: "/booking/2",
      category: { name: "Equipment Rental", href: "#" },
      description:
        "High-quality mountain bike rental with optional guided trails. Perfect for exploring scenic mountain paths and experiencing thrilling downhill rides.",
      price: "$35",
      availability: "Bikes Available",
      imageUrl:
        "https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1679&q=80",
      amenities: "Helmet, Lock, Repair Kit",
      details: {
        duration: "24 hours",
        bikeType: "Mountain",
        includes: "Safety Gear",
        imageUrl:
          "https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1679&q=80",
      },
    },
    {
      title: "Kayaking Experience",
      href: "/booking/3",
      category: { name: "Water Sports", href: "#" },
      description:
        "Explore serene lakes and rivers with our premium kayaks. Perfect for beginners and experienced paddlers alike. Includes basic training for newcomers.",
      price: "$45",
      availability: "Limited Spots",
      imageUrl:
        "https://images.unsplash.com/photo-1559523161-0fc0d8b38a7a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1679&q=80",
      amenities: "Life Jacket, Paddle, Dry Bag",
      details: {
        duration: "4 hours",
        kayakType: "Single/Double",
        includes: "Basic Training",
        imageUrl:
          "https://images.unsplash.com/photo-1559523161-0fc0d8b38a7a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1679&q=80",
      },
    },
    {
      title: "Rock Climbing Tour",
      href: "/booking/4",
      category: { name: "Guided Adventure", href: "#" },
      description:
        "Professional guided rock climbing experience for all skill levels. Learn essential techniques while conquering natural rock formations safely.",
      price: "$75",
      availability: "Booking Fast",
      imageUrl:
        "https://images.unsplash.com/photo-1522163182402-834f871fd851?ixlib=rb-1.2.1&auto=format&fit=crop&w=1679&q=80",
      amenities: "All Gear Provided, Expert Guide",
      details: {
        duration: "6 hours",
        difficulty: "Beginner to Advanced",
        includes: "Equipment & Training",
        imageUrl:
          "https://images.unsplash.com/photo-1522163182402-834f871fd851?ixlib=rb-1.2.1&auto=format&fit=crop&w=1679&q=80",
      },
    },
  ];

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
          {bookings.map((booking) => (
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
                    <span className="mx-2">•</span>
                    <span>{booking.amenities}</span>
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

export default Booking;
