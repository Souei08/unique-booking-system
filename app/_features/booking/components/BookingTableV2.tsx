"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BookingTable } from "@/app/_features/booking/types/booking-types";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Pencil,
  Mail,
  Loader2,
  ChevronLeft,
  ChevronRight,
  User,
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
import { StatusBadge } from "@/components/ui/status-badge";
import { TableV2 } from "@/app/_components/common/TableV2";
import { CardList } from "@/app/_components/common/CardList";
import { BookingCard } from "@/app/_features/dashboard/components/BookingCard";
import { RoleAvatar } from "@/app/_components/common/RoleAvatar";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import UpdateBooking from "@/app/_features/booking/components/UpdateBooking/UpdateBooking";
import { sendBookingConfirmationEmail } from "../api/email-booking/send-confirmation-email";
import { getAllBookings } from "@/app/_features/booking/api/get-booking/getAllBookings";
import {
  BookingFilters,
  BookingFilters as BookingFiltersType,
} from "./BookingFilters";
import { getAllTours } from "@/app/_features/tours/api/getAllTours";
import { BookingTableSkeleton } from "./BookingTableSkeleton";
import { BookingCardSkeleton } from "./BookingCardSkeleton";

export function BookingTableV2() {
  const [bookings, setBookings] = useState<BookingTable[]>([]);
  const [tours, setTours] = useState<Array<{ id: string; title: string }>>([]);
  const [isUpdateBookingDialogOpen, setIsUpdateBookingDialogOpen] =
    useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingTable | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTours, setIsLoadingTours] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Pagination & filters
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<BookingFiltersType>({
    status_filter: "all",
    selected_time_filter: "all",
    tour_filter: "all",
    search_query: "",
  });

  // Update page size when view mode changes
  useEffect(() => {
    setPageSize(viewMode === "cards" ? 5 : 10);
    setPage(1); // Reset to first page when changing view mode
  }, [viewMode]);

  // Fetch tours for filter dropdown
  useEffect(() => {
    const fetchTours = async () => {
      setIsLoadingTours(true);
      try {
        const toursData = await getAllTours();
        setTours(toursData.map((tour) => ({ id: tour.id, title: tour.title })));
      } catch (error) {
        console.error("Error fetching tours:", error);
      } finally {
        setIsLoadingTours(false);
      }
    };
    fetchTours();
  }, []);

  const fetchBookings = async (pageNum = 1) => {
    setIsLoading(true);
    try {
      const offset = (pageNum - 1) * pageSize;

      // Prepare filter parameters
      const filterParams: any = {
        search_query: filters.search_query || null,
        limit_count: pageSize,
        offset_count: offset,
      };

      // Add filters if they have values
      if (filters.status_filter && filters.status_filter !== "all") {
        filterParams.status_filter = filters.status_filter;
      }
      if (filters.tour_filter && filters.tour_filter !== "all") {
        filterParams.tour_filter = filters.tour_filter;
      }
      if (filters.search_query) {
        filterParams.search_query = filters.search_query;
      }

      const data = await getAllBookings(filterParams);

      const total = data.length > 0 ? data[0].total_count || 0 : 0;

      const updated = data.map((booking) => ({
        ...booking,
        id: booking.booking_id,
        created_at: booking.booking_created_at,
      }));

      setBookings(updated);
      setTotalCount(total);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(page);
  }, [page, filters]);

  const handleNext = () => {
    if (page * pageSize < totalCount) {
      setPage((p) => p + 1);
    }
  };

  const handlePrevious = () => {
    setPage((p) => Math.max(p - 1, 1));
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleFiltersChange = (newFilters: BookingFiltersType) => {
    setIsFilterLoading(true);
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
    // The loading state will be cleared when fetchBookings completes
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchBookings(page);
    } catch (error) {
      console.error("Error refreshing bookings:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSearch = (query: string) => {
    setIsFilterLoading(true);
    setPage(1); // Reset to first page when searching
    // Update the filters state with the search query
    setFilters((prev) => ({
      ...prev,
      search_query: query.trim(),
    }));
    // The loading state will be cleared when fetchBookings completes
  };

  // Clear filter loading when fetchBookings completes
  useEffect(() => {
    if (!isLoading && isFilterLoading) {
      setIsFilterLoading(false);
    }
  }, [isLoading, isFilterLoading]);

  const handleEmailConfirmation = async (booking: BookingTable) => {
    // try {
    //   await sendBookingConfirmationEmail({
    //     full_name: booking.full_name,
    //     email: booking.email,
    //     booking_date: booking.booking_date,
    //     selected_time: booking.selected_time,
    //     slots: booking.slots,
    //     total_price: booking.amount_paid,
    //     booking_reference_id: booking.reference_number,
    //     tour_name: booking.tour_title,
    //     tour_rate: booking.tour_rate,
    //     products:
    //       booking.booked_products?.map((product) => ({
    //         product_name: product.name,
    //         product_id: product.product_id || "",
    //         quantity: product.quantity,
    //         unit_price: product.unit_price,
    //       })) || [],
    //     slot_details: booking.slot_details || [],
    //     manage_token: booking.manage_token,
    //     waiver_link: "https://your-waiver-link.com",
    //     sub_total: booking.original_amount || 0,
    //     coupon_code: booking.promo_code || "",
    //     discount_amount: booking.discount_amount || 0,
    //     manage_link: booking.manage_link,
    //   });
    //   // You might want to show a success toast here
    // } catch (error) {
    //   console.error("Error sending confirmation email:", error);
    //   // You might want to show an error toast here
    // }
  };

  const columns: ColumnDef<BookingTable>[] = [
    { accessorKey: "reference_number", header: "Booking ID" },
    {
      accessorKey: "full_name",
      header: "Customer Name",
      cell: ({ row }) => {
        const fullName = row.getValue("full_name") as string;
        return (
          <div className="flex items-center gap-2">
            <RoleAvatar full_name={fullName} className="h-8 w-8" />
            {fullName}
          </div>
        );
      },
    },
    {
      accessorKey: "tour_title",
      header: "Booked Tour",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
            {row.original.tour_featured_image ? (
              <img
                src={row.original.tour_featured_image}
                alt={row.original.tour_title}
                className="h-full w-full object-cover"
              />
            ) : (
              <MapPin className="h-4 w-4 text-gray-500" />
            )}
          </div>
          {row.getValue("tour_title")}
        </div>
      ),
    },
    {
      accessorKey: "booking_status",
      header: "Booking Status",
      cell: ({ row }) => (
        <StatusBadge
          status={(row.getValue("booking_status") as any) || "pending"}
          type="booking"
        />
      ),
    },
    {
      accessorKey: "booking_date",
      header: "Booking Date",
      cell: ({ row }) =>
        format(new Date(row.getValue("booking_date")), "MMMM dd, yyyy"),
    },
    {
      accessorKey: "selected_time",
      header: "Selected Time",
      cell: ({ row }) => {
        const time = row.getValue("selected_time");
        return time ? format(new Date(`2000-01-01T${time}`), "hh:mm a") : "-";
      },
    },
    { accessorKey: "slots", header: "Slots" },
    {
      accessorKey: "amount_paid",
      header: "Total Price",
      cell: ({ row }) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(parseFloat(row.getValue("amount_paid"))),
    },
    {
      accessorKey: "created_at",
      header: "Date Created",
      cell: ({ row }) =>
        format(new Date(row.getValue("created_at")), "MMM dd, yyyy"),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const booking = row.original;

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
              <DropdownMenuItem
                onClick={() => {
                  setSelectedBooking(booking);
                  setIsUpdateBookingDialogOpen(true);
                }}
                className="cursor-pointer"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Update Booking
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleEmailConfirmation(booking)}
                className="cursor-pointer"
              >
                <Mail className="mr-2 h-4 w-4" />
                Send Confirmation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Show loading skeleton when initially loading or when filters are being applied
  if ((isLoading && bookings.length === 0) || isFilterLoading) {
    if (viewMode === "cards") {
      return (
        <div className="mt-7">
          <BookingFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            tours={tours}
            isLoading={isLoadingTours || isFilterLoading}
            onSearch={handleSearch}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            viewMode={viewMode}
            onViewChange={setViewMode}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <BookingCardSkeleton key={index} />
            ))}
          </div>
        </div>
      );
    }
    return <BookingTableSkeleton />;
  }

  return (
    <div className="mt-7">
      {/* Enhanced Filters with Search and Refresh */}
      <BookingFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        tours={tours}
        isLoading={isLoadingTours || isFilterLoading}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        viewMode={viewMode}
        onViewChange={setViewMode}
      />

      {/* Loading overlay for table when refreshing */}
      <div className="relative">
        {isRefreshing && (
          <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-lg">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Refreshing bookings...</span>
            </div>
          </div>
        )}

        {viewMode === "table" ? (
          <TableV2
            columns={columns}
            data={bookings}
            filterColumn={undefined} // filters handled here instead
            // Pagination props
            totalCount={totalCount}
            page={page}
            pageSize={pageSize}
            onNextPage={handleNext}
            onPreviousPage={handlePrevious}
            onPageChange={handlePageChange}
            isLoading={isLoading || isFilterLoading}
            entityName="bookings"
          />
        ) : (
          <CardList
            data={bookings}
            renderCard={(booking, index) => (
              <div
                key={booking.booking_id || index}
                className="relative cursor-pointer group"
                onClick={() => {
                  setSelectedBooking(booking);
                  setIsUpdateBookingDialogOpen(true);
                }}
              >
                <BookingCard booking={booking} variant="booking" />
                {/* Floating action button */}
                <div className="absolute top-3 right-3 z-20">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBooking(booking);
                          setIsUpdateBookingDialogOpen(true);
                        }}
                        className="cursor-pointer"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Update Booking
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEmailConfirmation(booking);
                        }}
                        className="cursor-pointer"
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Send Confirmation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )}
            totalCount={totalCount}
            page={page}
            pageSize={pageSize}
            onNextPage={handleNext}
            onPreviousPage={handlePrevious}
            onPageChange={handlePageChange}
            isLoading={isLoading || isFilterLoading}
            entityName="bookings"
          />
        )}
      </div>

      {/* Update Booking Dialog */}
      <Dialog
        open={isUpdateBookingDialogOpen}
        onOpenChange={setIsUpdateBookingDialogOpen}
      >
        <DialogContent
          disableCloseOnOutside={true}
          showCloseButton={false}
          className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[800px] lg:max-w-[1200px] max-h-[95vh] overflow-y-auto p-4 sm:p-6"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Update Booking</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <UpdateBooking
              bookingId={selectedBooking.booking_id}
              manageToken={selectedBooking.manage_token}
              onClose={() => {
                setIsUpdateBookingDialogOpen(false);
                setSelectedBooking(null);
                // Refresh the bookings after update
                fetchBookings(page);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
