"use client";

import UpsertTourForm from "@/app/_features/tours/forms/upsert-tour";

import { useDrawer } from "@/app/context/DrawerContext/useDrawer";
import { useModal } from "@/app/context/ModalContext/useModal";

import { Tour } from "@/app/_features/tours/types/TourTypes";

import TourSchedule from "@/app/_features/tours/forms/tour-schedule";
import { UpsertTourData } from "@/app/_features/tours/forms/upsert-tour/schema";

// Map Tour to UpsertTourData
const mapTourToFormData = (tour: Tour): UpsertTourData => {
  return {
    title: tour.title,
    description: tour.description,
    price: tour.rate,
    duration: tour.duration,
    maxGroupSize: tour.group_size_limit,
    languages: tour.languages,
    tripHighlights: tour.trip_highlights,
    thingToKnow: tour.things_to_know,
    faq: tour.faq,
    meetingPointAddress: tour.meeting_point_address,
    dropoffPointAddress: tour.dropoff_point_address,
    includes: tour.includes,
    category: tour.category as any,
    slots: tour.slots,
  };
};

interface TourActionsProps {
  onAddTour: () => void;
  onEditTour: (tour: Tour) => void;
  onScheduleTour: (tour: Tour) => void;
}

export function TourActions({
  onAddTour,
  onEditTour,
  onScheduleTour,
}: TourActionsProps) {
  const { openModal } = useModal();
  const { openDrawer } = useDrawer();

  const handleAddTour = () => {
    openModal(
      <UpsertTourForm mode="create" onSuccess={onAddTour} />,
      "Add New Tour"
    );
  };

  const handleEditTour = (tour: Tour) => {
    openModal(
      <UpsertTourForm
        mode="update"
        tourId={tour.id}
        initialData={mapTourToFormData(tour)}
        onSuccess={() => onEditTour(tour)}
      />,
      "Edit Tour"
    );
  };

  const handleScheduleTour = (tour: Tour) => {
    openDrawer(<TourSchedule tourId={tour.id} />, "Schedule Tour");
  };

  return {
    handleAddTour,
    handleEditTour,
    handleScheduleTour,
  };
}
