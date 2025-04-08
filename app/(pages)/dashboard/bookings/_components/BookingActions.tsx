"use client";

import { useDrawer } from "@/app/context/DrawerContext/useDrawer";
import { useModal } from "@/app/context/ModalContext/useModal";

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

  const handleAddBooking = () => {
    openModal("", "Add New Booking");
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
