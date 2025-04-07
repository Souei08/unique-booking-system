"use client";

// Mock data for related tours - replace with actual data from the API
const relatedTours = [
  {
    id: 1,
    name: "Mountain Adventure",
    href: "#",
    imageSrc:
      "https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1679&q=80",
    imageAlt: "Mountain adventure tour",
    price: "$120",
    location: "Rocky Mountains",
  },
  {
    id: 2,
    name: "Beach Explorer",
    href: "#",
    imageSrc:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1679&q=80",
    imageAlt: "Beach explorer tour",
    price: "$90",
    location: "Coastal Area",
  },
  {
    id: 3,
    name: "Forest Trek",
    href: "#",
    imageSrc:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1679&q=80",
    imageAlt: "Forest trek tour",
    price: "$75",
    location: "National Park",
  },
  {
    id: 4,
    name: "Desert Safari",
    href: "#",
    imageSrc:
      "https://images.unsplash.com/photo-1509316785289-025f5b846b35?ixlib=rb-1.2.1&auto=format&fit=crop&w=1679&q=80",
    imageAlt: "Desert safari tour",
    price: "$110",
    location: "Desert Region",
  },
];

export function RelatedTours() {
  return (
    <section aria-labelledby="related-tours-heading" className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <h2
          id="related-tours-heading"
          className="text-xl font-bold tracking-tight text-gray-900"
        >
          You may also like
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {relatedTours && relatedTours.length > 0 ? (
            relatedTours.map((tour) => (
              <div key={tour.id} className="group relative">
                <img
                  alt={tour.imageAlt}
                  src={tour.imageSrc}
                  className="aspect-square w-full rounded-md bg-gray-200 object-cover group-hover:opacity-75 lg:aspect-auto lg:h-80"
                />
                <div className="mt-4 flex justify-between">
                  <div>
                    <h3 className="text-sm text-gray-700">
                      <a href={tour.href}>
                        <span aria-hidden="true" className="absolute inset-0" />
                        {tour.name}
                      </a>
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {tour.location}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {tour.price}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-6">
              <p className="text-gray-500">No related tours available.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
