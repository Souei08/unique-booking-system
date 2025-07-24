"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Tour } from "@/app/_features/tours/tour-types";
import { format } from "date-fns";
import Image from "next/image";
import {
  MoreHorizontal,
  Pencil,
  Calendar,
  LinkIcon,
  MapPin,
  Settings,
  ImageIcon,
  DollarSign,
  FileText,
  Users,
  MessageSquare,
  Copy,
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
import { useRouter } from "next/navigation";
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
import { TourSectionUpdate, TourSection } from "./TourSectionUpdate";
import { TourStatusBadge } from "./TourStatusBadge";
import { TourStatusUpdateModal } from "./TourStatusUpdateModal";

import { TourFilters, TourFilters as TourFiltersType } from "./TourFilters";
import { getAllToursV2 } from "../api/getAllToursV2";
import { toast } from "sonner";

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
  const [isSectionUpdateOpen, setIsSectionUpdateOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<TourSection | null>(
    null
  );
  const [isStatusUpdateOpen, setIsStatusUpdateOpen] = useState(false);
  const [selectedTourForStatus, setSelectedTourForStatus] = useState<Tour | null>(null);
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
          status: filters.status || null,
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
        status: filters.status || null,
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
          <div className="flex items-center space-x-3">
            <div className="relative h-14 w-14 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
              {imageUrl ? (
                <>
                  <Image
                    src={imageUrl}
                    alt={`${tour.title} tour image`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-200"
                    sizes="200px"
                    priority={true as any}
                    quality={100}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                </>
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                  <div className="w-7 h-7 bg-gray-300 rounded-full flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-gray-500" />
                  </div>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 text-base leading-tight truncate">
                {tour.title}
              </div>
              <div className="text-sm text-gray-600 leading-relaxed mt-1 line-clamp-2 text-ellipsis w-full max-w-s whitespace-pre-line break-words">
                {tour.description || "No description available"}
              </div>
            </div>
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
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return <TourStatusBadge status={status} />;
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
                View Tour
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  const tourLink = `${window.location.origin}/widget?booking_id=${tour.id}`;
                  navigator.clipboard.writeText(tourLink);
                  toast.success("Tour link copied to clipboard!");
                }}
                className="cursor-pointer"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Link to Tour
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  setSelectedTourForStatus(tour);
                  setIsStatusUpdateOpen(true);
                }}
                className="cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" />
                Update Status
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Quick Updates</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => {
                  setSelectedTour(tour);
                  setSelectedSection("basic-info");
                  setIsSectionUpdateOpen(true);
                }}
                className="cursor-pointer"
              >
                <FileText className="mr-2 h-4 w-4" />
                Update Basic Info
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  setSelectedTour(tour);
                  setSelectedSection("tour-details");
                  setIsSectionUpdateOpen(true);
                }}
                className="cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" />
                Update Tour Details
              </DropdownMenuItem>

              

              <DropdownMenuItem
                onClick={() => {
                  setSelectedTour(tour);
                  setSelectedSection("pricing");
                  setIsSectionUpdateOpen(true);
                }}
                className="cursor-pointer"
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Update Pricing
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  setSelectedTour(tour);
                  setSelectedSection("location");
                  setIsSectionUpdateOpen(true);
                }}
                className="cursor-pointer"
              >
                <MapPin className="mr-2 h-4 w-4" />
                Update Location
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  setSelectedTour(tour);
                  setSelectedSection("features");
                  setIsSectionUpdateOpen(true);
                }}
                className="cursor-pointer"
              >
                <Users className="mr-2 h-4 w-4" />
                Update Features
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  setSelectedTour(tour);
                  setSelectedSection("additional-info");
                  setIsSectionUpdateOpen(true);
                }}
                className="cursor-pointer"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Update Additional Info
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  setSelectedTour(tour);
                  setSelectedSection("images");
                  setIsSectionUpdateOpen(true);
                }}
                className="cursor-pointer"
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Update Images
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  setSelectedTour(tour);
                  setSelectedSection("schedule");
                  setIsSectionUpdateOpen(true);
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

      {/* Section Update Dialog */}
      {selectedTour && selectedSection && (
        <TourSectionUpdate
          tour={selectedTour}
          section={selectedSection}
          isOpen={isSectionUpdateOpen}
          onClose={() => {
            setIsSectionUpdateOpen(false);
            setSelectedSection(null);
          }}
          onSuccess={() => {
            handleRefresh(); // Refresh the tours list after successful update
          }}
        />
      )}

      {/* Status Update Dialog */}
      {selectedTourForStatus && (
        <TourStatusUpdateModal
          tour={selectedTourForStatus}
          isOpen={isStatusUpdateOpen}
          onClose={() => {
            setIsStatusUpdateOpen(false);
            setSelectedTourForStatus(null);
          }}
          onSuccess={() => {
            handleRefresh(); // Refresh the tours list after successful update
          }}
        />
      )}
    </div>
  );
}
