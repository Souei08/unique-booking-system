"use client";

import { StarIcon } from "@heroicons/react/20/solid";

// Mock reviews data - replace with actual reviews from the API
const reviews = {
  featured: [
    {
      id: 1,
      title: "Amazing experience!",
      rating: 5,
      content: `
        <p>This tour exceeded all my expectations. The guide was knowledgeable and the scenery was breathtaking. Highly recommend!</p>
      `,
      author: "John Smith",
      avatarSrc:
        "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixqx=oilqXxSqey&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
      id: 2,
      title: "Great adventure",
      rating: 4,
      content: `
        <p>The tour was well-organized and the equipment was top quality. The only reason I'm giving 4 stars is because it was a bit challenging for beginners.</p>
      `,
      author: "Sarah Johnson",
      avatarSrc:
        "https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.5&w=256&h=256&q=80",
    },
    {
      id: 3,
      title: "Perfect for families",
      rating: 5,
      content: `
        <p>My kids had a blast! The tour was family-friendly and the guides were patient with the little ones.</p>
      `,
      author: "Michael Brown",
      avatarSrc:
        "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
  ],
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export function TourReviews() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-10 sm:px-6 lg:max-w-7xl lg:gap-x-8 lg:px-8 lg:pt-16">
      {/* Reviews */}
      <section
        aria-labelledby="reviews-heading"
        className="border-t border-gray-200 pt-10 lg:pt-16"
      >
        <h2 id="reviews-heading" className="sr-only">
          Reviews
        </h2>

        <div className="space-y-10">
          {reviews && reviews.featured && reviews.featured.length > 0 ? (
            reviews.featured.map((review) => (
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
                    className="h-12 w-12 rounded-full"
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
                            "h-5 w-5 shrink-0"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">No reviews available yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
