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
  const { handleAddTour, handleEditTour, handleScheduleTour } = TourActions({
    onAddTour: () => {
      router.refresh(); // Refresh the page to get updated data
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
      handleEdit={handleEditTour}
      handleSchedule={handleScheduleTour}
    />
  );
}
