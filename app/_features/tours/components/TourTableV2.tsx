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
  MapPin,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { TourScheduleV2 } from "../forms/tour-schedule-v2/TourScheduleV2";
import UpsertTourV2Stepped from "../forms/upsert-tour-v2/UpsertTourV2Stepped";

import { TourFilters, TourFilters as TourFiltersType } from "./TourFilters";
import { getAllToursV2 } from "../api/getAllToursV2";

interface TourTableV2Props {
  onView?: (tour: Tour) => void;
}

export function TourTableV2({ onView }: TourTableV2Props) {
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [isTourDialogOpen, setIsTourDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedTourId, setSelectedTourId] = useState<string | null>(null);
  const router = useRouter();

  // Filters state
  const [filters, setFilters] = useState<TourFiltersType>({
    search_query: "",
  });

  // Fetch tours
  useEffect(() => {
    const fetchTours = async () => {
      setIsLoading(true);
      try {
        const res = await getAllToursV2({
          search_query: filters.search_query || null,
          limit_count: pageSize,
          offset_count: (page - 1) * pageSize,
        });
        setTours(res.data);
        setTotalCount(res.total_count);
      } catch (error) {
        console.error("Error fetching tours:", error);
        setTours([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTours();
  }, [page, pageSize, filters]);

  const handleNextPage = () => {
    if (page * pageSize < totalCount) setPage((p) => p + 1);
  };
  const handlePreviousPage = () => {
    setPage((p) => Math.max(1, p - 1));
  };
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleFiltersChange = (newFilters: TourFiltersType) => {
    setPage(1); // Reset to first page when filters change
    setFilters(newFilters);
  };

  const handleSearch = (query: string) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, search_query: query }));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await getAllToursV2({
        search_query: filters.search_query || null,
        limit_count: pageSize,
        offset_count: (page - 1) * pageSize,
      });
      setTours(res.data);
      setTotalCount(res.total_count);
    } catch (error) {
      console.error("Error refreshing tours:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const columns: ColumnDef<Tour>[] = [
    {
      accessorKey: "title",
      header: "Tour Name",
      cell: ({ row }) => {
        const tour = row.original;
        let imageUrl = "";

        // Parse the images field to get the first image
        try {
          const images = JSON.parse(tour.images || "[]");
          if (images.length > 0) {
            imageUrl = images[0].url || images[0];
          }
        } catch (error) {
          // If parsing fails, treat images as a string
          imageUrl = tour.images || "";
        }

        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 rounded-md">
              <AvatarImage
                src={imageUrl}
                alt={tour.title}
                className="object-cover rounded-md"
              />
              <AvatarFallback className="text-xs font-semibold text-strong bg-brand/20 rounded-md">
                <MapPin className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            {tour.title}
          </div>
        );
      },
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
      cell: ({ row }) => {
        const category = row.getValue("category") as string;
        return category
          ? category
              .replace(/_/g, " ")
              .replace(/\b\w/g, (char) => char.toUpperCase())
          : "";
      },
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
    <div className="mt-6">
      {/* Tour Filters */}
      <TourFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        isLoading={isLoading}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        resultCount={totalCount}
      />

      <TableV2
        columns={columns}
        data={tours}
        filterColumn={undefined} // filters handled by TourFilters component
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        onNextPage={handleNextPage}
        onPreviousPage={handlePreviousPage}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        entityName="tours"
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
            onSuccess={() => {
              setIsTourDialogOpen(false);
              handleRefresh(); // Refresh the tours list after successful update
            }}
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
    </div>
  );
}
