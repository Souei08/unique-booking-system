"use client";
import Table from "@/app/_components/common/tables";
import { useRouter } from "next/navigation";
import { TourActions } from "./TourActions";

import { Tour } from "@/app/_features/tours/types/TourTypes";

interface TourTableProps {
  tours: Tour[];
  columns: any[];
}

export function TourTable({ tours, columns }: TourTableProps) {
  const router = useRouter();

  // Use the TourActions component hooks instead of destructuring the component
  const actions = TourActions({
    onAddTour: () => {
      router.refresh();
    },
    onEditTour: () => {
      router.refresh();
    },
    onScheduleTour: () => {
      router.refresh();
    },
  });

  return (
    <Table<Tour>
      data={tours}
      columns={columns}
      isCollapsible={true}
      title="Tours"
      description="View and manage all available tours"
      buttonText="Create a new tour"
      handleEdit={actions.handleEditTour}
      handleSchedule={actions.handleScheduleTour}
      handleAdd={actions.handleAddTour}
    />
  );
}
