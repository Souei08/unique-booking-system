import React, { useEffect, useState } from "react";
import { getAllToursClient } from "../../../../tours/api/client/getAllToursClient";
import { Button } from "@/components/ui/button";
import { Tour } from "@/app/_features/tours/tour-types";
import { Clock, DollarSign } from "lucide-react";

const SelectTours = ({
  setSelectedTour,
  handleNext,
}: {
  setSelectedTour: (tourId: Tour) => void;
  handleNext: () => void;
}) => {
  const [tours, setTours] = useState<Tour[]>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true);
      try {
        const fetchedTours = await getAllToursClient();
        setTours(fetchedTours);
      } catch (error) {
        console.error("Error fetching tours:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center space-y-2 px-4 sm:px-0">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Select Your Tour
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          Choose from our curated selection of unforgettable experiences
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
        {tours?.map((tour: Tour) => {
          const images = tour.images ? JSON.parse(tour.images) : [];
          const featuredImage =
            images.find((img: any) => img.isFeature)?.url || images[0]?.url;

          return (
            <div
              key={tour.id}
              className="group relative h-[350px] sm:h-[450px] rounded-xl overflow-hidden bg-card shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{
                  backgroundImage: `url(${
                    featuredImage ||
                    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1473&q=80"
                  })`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div className="space-y-2 sm:space-y-3">
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {tour.title}
                  </h3>
                  <p className="text-white/90 text-xs sm:text-sm leading-relaxed line-clamp-2">
                    {tour.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 text-white/90 text-xs sm:text-sm">
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="font-medium">${tour.rate}</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="font-medium">{tour.duration} hrs</span>
                  </div>
                </div>

                <Button
                  className="w-full bg-white text-black hover:bg-white/90 font-medium transition-colors text-sm sm:text-base py-2 sm:py-2.5"
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
    </div>
  );
};

export default SelectTours;
