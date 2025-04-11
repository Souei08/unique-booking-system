"use client";


import UpsertTourForm from "@/app/_features/tours/forms/upsert-tour";

import { useDrawer } from "@/app/context/DrawerContext/useDrawer";
import { useModal } from "@/app/context/ModalContext/useModal";

import type { Tour } from "@/app/_lib/types/tours";
import ScheduleForm from "@/app/_components/forms/schedule/ScheduleForm";

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
    // Map experience levels to difficulty levels
    const difficultyMap = {
      beginner: "easy",
      advanced: "difficult",
      all: "medium",
    } as const;

    const initialData = {
      title: tour.title,
      description: tour.description,
      price: tour.rate,
      duration: tour.duration,
      maxGroupSize: tour.group_size,
      difficulty: difficultyMap[tour.experience_level],
      location: tour.location,
      category: tour.category || "",
      weightLimit: tour.weight_limit,
      includes: tour.includes,
      bookingLink: tour.booking_link,
      slots: tour.slots,
    };

    openModal(
      <UpsertTourForm
        mode="update"
        tourId={tour.id}
        initialData={initialData}
        onSuccess={() => onEditTour(tour)}
      />,
      "Edit Tour"
    );
  };

  const handleScheduleTour = (tour: Tour) => {
    openDrawer(<ScheduleForm tourId={tour.id} />, "Schedule Tour");
  };

  return {
    handleAddTour,
    handleEditTour,
    handleScheduleTour,
  };
}
