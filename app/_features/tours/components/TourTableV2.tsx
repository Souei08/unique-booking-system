"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Tour } from "@/app/_features/tours/tour-types";
import { format } from "date-fns";
import {
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
  Calendar,
  Link,
  LinkIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { TableV2 } from "@/app/_components/common/TableV2";
import { redirect, useRouter } from "next/navigation";
import UpsertTourV2 from "../forms/upsert-tour-v2/UpsertTourV2";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { TourScheduleV2 } from "../forms/tour-schedule-v2/TourScheduleV2";
import UpsertTourV2Stepped from "../forms/upsert-tour-v2/UpsertTourV2Stepped";
interface TourTableV2Props {
  tours: Tour[];
  onView?: (tour: Tour) => void;
}

export function TourTableV2({ tours, onView }: TourTableV2Props) {
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [isTourDialogOpen, setIsTourDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedTourId, setSelectedTourId] = useState<string | null>(null);

  const columns: ColumnDef<Tour>[] = [
    {
      accessorKey: "title",
      header: "Tour",
    },
    {
      accessorKey: "rate",
      header: "Price",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("rate"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
        return formatted;
      },
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "duration",
      header: "Duration",
      cell: ({ row }) => {
        const duration = Number(row.getValue("duration"));
        return `${duration} ${duration === 1 ? "hour" : "hours"}`;
      },
    },
    {
      accessorKey: "group_size_limit",
      header: "Max Group Size",
      cell: ({ row }) => {
        const limit = Number(row.getValue("group_size_limit"));
        return `${limit} ${limit === 1 ? "person" : "people"}`;
      },
    },
    {
      accessorKey: "slots",
      header: "Available Slots",
      cell: ({ row }) => {
        const slots = Number(row.getValue("slots"));
        return slots > 0 ? `${slots} available` : "Fully booked";
      },
    },

    {
      accessorKey: "created_at",
      header: "Date Created",
      cell: ({ row }) => {
        return format(new Date(row.getValue("created_at")), "MMM dd, yyyy");
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const tour = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* <DropdownMenuItem
                onClick={() => {
                  redirect(`/tours/${tour.id}`);
                }}
                className="cursor-pointer"
              >
                <Eye className="mr-2 h-4 w-4" />
                View Tour
              </DropdownMenuItem> */}
              <DropdownMenuItem
                onClick={() => {
                  window.open(`/widget?booking_id=${tour.id}`, "_blank");
                }}
                className="cursor-pointer"
              >
                <LinkIcon className="mr-2 h-4 w-4" />
                View Tour Booking Widget
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  setSelectedTour(tour);
                  setIsTourDialogOpen(true);
                }}
                className="cursor-pointer"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit Tour
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  setSelectedTour(tour);
                  setIsScheduleDialogOpen(true);
                }}
                className="cursor-pointer"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Update Schedule
              </DropdownMenuItem>

              {/* <DropdownMenuSeparator /> */}
              {/* <DropdownMenuItem
                onClick={() => {
                  setSelectedTour(tour);
                  setIsTourDialogOpen(true);
                }}
                className="cursor-pointer text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <>
      <TableV2
        columns={columns}
        data={tours}
        filterColumn="title"
        filterPlaceholder="Filter by tour title..."
      />

      {/* Tour Form Dialog */}
      <Dialog open={isTourDialogOpen} onOpenChange={setIsTourDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[800px] lg:max-w-[1500px] max-h-[95vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="mb-5 text-center items-center border-b border-gray-200 pb-5">
            <DialogTitle className="text-strong text-3xl font-bold">
              {selectedTour ? "Edit Tour" : "Create New Tour"}
            </DialogTitle>
            <DialogDescription className="text-weak text-sm">
              {selectedTour
                ? "Edit the tour details and features"
                : "Create a new tour with all the details and features"}
            </DialogDescription>
          </DialogHeader>

          <UpsertTourV2Stepped
            initialData={selectedTour || undefined}
            onSuccess={() => setIsTourDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog
        open={isScheduleDialogOpen}
        onOpenChange={setIsScheduleDialogOpen}
      >
        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[800px] lg:max-w-[1500px] max-h-[95vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Update Schedule</DialogTitle>
          </DialogHeader>
          {selectedTour && <TourScheduleV2 selectedTour={selectedTour} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
