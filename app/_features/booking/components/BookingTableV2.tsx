"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BookingTable } from "@/app/_features/booking/types/booking-types";
import { format } from "date-fns";
import {
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
  Mail,
  RefreshCw,
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
import { Badge } from "@/components/ui/badge";
import { TableV2 } from "@/app/_components/common/TableV2";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import UpdateBooking from "./UpdateBooking";

interface BookingTableV2Props {
  bookings: BookingTable[];
  onView?: (booking: BookingTable) => void;
  onEdit?: (booking: BookingTable) => void;
  onDelete?: (booking: BookingTable) => void;
  onSendEmail?: (booking: BookingTable) => void;
  onUpdateStatus?: (booking: BookingTable) => void;
}

export function BookingTableV2({
  bookings,
  onView,
  onEdit,
  onDelete,
  onSendEmail,
  onUpdateStatus,
}: BookingTableV2Props) {
  const [isUpdateBookingDialogOpen, setIsUpdateBookingDialogOpen] =
    useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingTable | null>(
    null
  );

  const columns: ColumnDef<BookingTable>[] = [
    {
      accessorKey: "full_name",
      header: "Customer Name",
    },
    {
      accessorKey: "tour_title",
      header: "Tour",
    },
    {
      accessorKey: "booking_status",
      header: "Booking Status",
      cell: ({ row }) => {
        const bookingStatus = row.getValue("booking_status") as string;

        const getStatusColor = (status: string) => {
          const statusColors: { [key: string]: string } = {
            pending: "bg-yellow-500",
            confirmed: "bg-green-500",
            checked_in: "bg-blue-500",
            cancelled: "bg-red-500",
          };
          return statusColors[status.toLowerCase()] || "bg-gray-500";
        };

        return (
          <Badge
            className={`${getStatusColor(
              bookingStatus
            )} text-white uppercase font-bold`}
          >
            {bookingStatus}
          </Badge>
        );
      },
    },
    {
      accessorKey: "booking_date",
      header: "Booking Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("booking_date"));
        return format(date, "MMMM dd, yyyy");
      },
    },
    {
      accessorKey: "selected_time",
      header: "Selected Time",
      cell: ({ row }) => {
        const time = row.getValue("selected_time");
        if (!time) return "-";
        return format(new Date(`2000-01-01T${time}`), "hh:mm a");
      },
    },
    {
      accessorKey: "slots",
      header: "Slots",
    },
    {
      accessorKey: "total_price",
      header: "Total Price",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("total_price"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
        return formatted;
      },
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => {
        return format(new Date(row.getValue("created_at")), "MMM dd, yyyy");
      },
    },
    {
      id: "actions",
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
                onClick={() => onSendEmail?.(booking)}
                className={`cursor-pointer ${
                  !onSendEmail ? "text-gray-400" : ""
                }`}
                disabled={!onSendEmail}
              >
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {}}
                className="cursor-pointer text-gray-400"
                disabled={true}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Update Status
              </DropdownMenuItem>
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
        data={bookings}
        filterColumn="full_name"
        filterPlaceholder="Filter by customer name..."
      />

      <Dialog
        open={isUpdateBookingDialogOpen}
        onOpenChange={setIsUpdateBookingDialogOpen}
      >
        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[800px] lg:max-w-[1500px] max-h-[95vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Update Booking</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <UpdateBooking
              bookingId={selectedBooking.booking_id}
              manageToken={selectedBooking.manage_token}
              onClose={() => setIsUpdateBookingDialogOpen(false)}
              onUpdate={async (updatedBooking) => {
                // await onUpdateStatus?.(updatedBooking);
                // setIsUpdateBookingDialogOpen(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
