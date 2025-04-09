"use client";

import { useDrawer } from "@/app/context/DrawerContext/useDrawer";
import { useModal } from "@/app/context/ModalContext/useModal";

import UpsertBookingForm from "@/app/_components/forms/booking/UpsertBookingForm";

interface BookingActionsProps {
  onAddBooking: () => void;
  onEditBooking: () => void;
  onScheduleBooking: () => void;
}

export function BookingActions({
  onAddBooking,
  onEditBooking,
  onScheduleBooking,
}: BookingActionsProps) {
  const { openModal } = useModal();
  const { openDrawer } = useDrawer();

  const tours = [
    {
      id: "1",
      name: "Tour 1",
      description: "Tour 1 description",
      rate: 100,
    },
    {
      id: "2",
      name: "Tour 2",
      description: "Tour 2 description",
      rate: 200,
    },
    {
      id: "3",
      name: "Tour 3",
      description: "Tour 3 description",
      rate: 300,
    },
  ];

  const handleAddBooking = () => {
    openModal(
      <UpsertBookingForm
        schedules={[
          {
            id: "1",
            date: "2024-04-01",
            start_time: "09:00",
            available_spots: 5,
          },
          // ... more schedules
        ]}
      />,
      "Add New Booking"
    );
  };

  const handleEditBooking = () => {
    openModal("", "Edit Booking");
  };

  const handleScheduleBooking = () => {
    openDrawer("", "Schedule Booking");
  };

  return {
    handleAddBooking,
    handleEditBooking,
    handleScheduleBooking,
  };
}
