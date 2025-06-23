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

  // Pagination & filters
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<BookingFiltersType>({
    status_filter: "all",
    selected_time_filter: "all",
    tour_filter: "all",
    booking_id_filter: "",
    customer_name_filter: "",
  });

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
        user_name_filter: filters.customer_name_filter || null,
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
      if (filters.booking_id_filter) {
        filterParams.booking_id_filter = filters.booking_id_filter;
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
    // This function is called when the search form is submitted
    if (query.trim()) {
      setFilters((prev) => ({
        ...prev,
        customer_name_filter: query.trim(),
      }));
    }
    // The loading state will be cleared when fetchBookings completes
  };

  // Clear filter loading when fetchBookings completes
  useEffect(() => {
    if (!isLoading && isFilterLoading) {
      setIsFilterLoading(false);
    }
  }, [isLoading, isFilterLoading]);

  const handleEmailConfirmation = async (booking: BookingTable) => {
    try {
      await sendBookingConfirmationEmail({
        full_name: booking.full_name,
        email: booking.email,
        booking_date: booking.booking_date,
        selected_time: booking.selected_time,
        slots: booking.slots,
        total_price: booking.amount_paid,
        booking_reference_id: booking.reference_number,
        tour_name: booking.tour_title,
        tour_rate: booking.tour_rate,
        products:
          booking.booked_products?.map((product) => ({
            product_name: product.name,
            product_id: product.product_id || "",
            quantity: product.quantity,
            unit_price: product.unit_price,
          })) || [],
        slot_details: booking.slot_details || [],
        manage_token: booking.manage_token,
        waiver_link: "https://your-waiver-link.com",
        sub_total: booking.original_amount || 0,
        coupon_code: booking.promo_code || "",
        discount_amount: booking.discount_amount || 0,
      });
      // You might want to show a success toast here
    } catch (error) {
      console.error("Error sending confirmation email:", error);
      // You might want to show an error toast here
    }
  };

  const columns: ColumnDef<BookingTable>[] = [
    { accessorKey: "reference_number", header: "Booking ID" },
    { accessorKey: "full_name", header: "Customer Name" },
    { accessorKey: "tour_title", header: "Tour" },
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
      </div>

      {/* Update Booking Dialog */}
      <Dialog
        open={isUpdateBookingDialogOpen}
        onOpenChange={setIsUpdateBookingDialogOpen}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
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
