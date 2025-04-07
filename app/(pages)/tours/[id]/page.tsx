"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getTour } from "@/app/actions/tours/actions";
import { Tour } from "@/app/_lib/types/tours";
import TourDetails from "./_components/TourDetails";
import LoadingTourDetails from "./loading";
import TourNotFound from "./not-found";

export default function TourDetailsPage() {
  const params = useParams();
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTour = async () => {
      try {
        if (params.id) {
          const tourData = await getTour(params.id as string);
          setTour(tourData);
        }
      } catch (error) {
        console.error("Error fetching tour:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTour();
  }, [params.id]);

  if (loading) {
    return <LoadingTourDetails />;
  }

  if (!tour) {
    return <TourNotFound />;
  }

  return <TourDetails tour={tour} />;
}
