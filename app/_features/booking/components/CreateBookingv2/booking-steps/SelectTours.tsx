import React, { useEffect, useState } from "react";
import { getAllToursClient } from "../../../../tours/api/client/getAllToursClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-3 sm:gap-4">
        {tours?.map((tour: Tour) => {
          const images = tour.images ? JSON.parse(tour.images) : [];
          const featuredImage =
            images.find((img: any) => img.isFeature)?.url || images[0]?.url;

          return (
            <Card
              key={tour.id}
              className="hover:shadow-md transition-shadow duration-200 overflow-hidden h-full flex flex-col pt-0"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={
                    featuredImage ||
                    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1473&q=80"
                  }
                  alt={tour.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-sm font-semibold line-clamp-2">
                  {tour.title}
                </CardTitle>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 min-h-[3rem] max-h-[4.5rem] flex-1">
                  {tour.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-3 flex-1 flex flex-col">
                <Button
                  className="w-full text-xs py-1.5 mt-auto"
                  onClick={() => {
                    setSelectedTour(tour);
                    handleNext();
                  }}
                >
                  Book Now
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SelectTours;
