"use client";

import { useDrawer } from "@/app/context/DrawerContext/useDrawer";
import { useModal } from "@/app/context/ModalContext/useModal";

import UpsertBookingForm from "@/app/_features/booking/forms/upsert-booking";

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
    openModal(<UpsertBookingForm onSubmit={() => {}} />, "Add New Booking");
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
