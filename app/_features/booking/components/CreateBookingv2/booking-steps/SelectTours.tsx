import React, { useEffect, useState } from "react";

import { getAllToursClient } from "../../../../tours/api/client/getAllToursClient";
import { Button } from "@/components/ui/button";
import { Tour } from "@/app/_features/tours/tour-types";

const SelectTours = ({
  setSelectedTour,
  handleNext,
}: {
  setSelectedTour: (tourId: Tour) => void;
  handleNext: () => void;
}) => {
  const [tours, setTours] = useState<Tour[]>();

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const fetchedTours = await getAllToursClient();
        setTours(fetchedTours);
      } catch (error) {
        console.error("Error fetching tours:", error);
      }
    };

    fetchTours();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {tours?.map((tour: Tour) => {
        const images = tour.images ? JSON.parse(tour.images) : [];
        const featuredImage =
          images.find((img: any) => img.isFeature)?.url || images[0]?.url;

        return (
          <div
            key={tour.id}
            className="relative h-[400px] rounded-lg overflow-hidden group hover:shadow-lg transition-shadow"
            style={{
              backgroundImage: `url(${
                featuredImage ||
                "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1473&q=80"
              })`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
            <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white line-clamp-1">
                  {tour.title}
                </h3>
                <p className="text-white/80 text-sm line-clamp-2">
                  {tour.description}
                </p>
              </div>

              {/* <div className="flex items-center gap-4 text-white text-sm">
                <div className="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-medium">${tour.rate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-medium">{tour.duration} hrs</span>
                </div>
              </div> */}
              <Button
                className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
                onClick={() => {
                  setSelectedTour(tour);
                  handleNext();
                }}
              >
                Book Now
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SelectTours;
