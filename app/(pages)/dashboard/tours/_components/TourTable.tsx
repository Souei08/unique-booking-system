"use client";
import Table from "@/app/_components/common/tables";
import type { Tour } from "@/app/_lib/types/tours";
import { useRouter } from "next/navigation";
import { TourActions } from "./TourActions";

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
      title="Tours"
      description="View and manage all available tours"
      isCollapsible={true}
      buttonText="Add Tour"
      handleAdd={actions.handleAddTour}
      handleEdit={actions.handleEditTour}
      handleSchedule={actions.handleScheduleTour}
    />
  );
}
