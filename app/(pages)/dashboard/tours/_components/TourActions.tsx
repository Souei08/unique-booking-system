"use client";

import { useState } from "react";

import CreateTourForm from "@/app/_components/forms/tours/CreateTour";

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
    openModal(<AddTourForm onSuccess={onAddTour} />, "Add New Tour");
  };

  const handleEditTour = (tour: Tour) => {
    openModal(<CreateTourForm />, "Edit Tour");
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

// Form Components
const AddTourForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { closeModal } = useModal();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Add your tour creation logic here
      onSuccess();
      closeModal();
    } catch (error) {
      console.error("Error creating tour:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-1">Name</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
      {/* Add other form fields */}
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={closeModal}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Add Tour
        </button>
      </div>
    </form>
  );
};

// Similar components for EditTourForm and ScheduleTourForm...
