import { getTourById } from "@/app/_features/tours/actions/getOneTour";
import TourDetailsClient from "@/app/_features/tours/components/TourDetailsClient";
import { notFound } from "next/navigation";

export default async function TourDetailsPage({ params }: any) {
  const tourId = params.id;
  const tour = await getTourById(tourId);

  if (!tour) {
    notFound();
  }

  return <TourDetailsClient tour={tour} />;
}
