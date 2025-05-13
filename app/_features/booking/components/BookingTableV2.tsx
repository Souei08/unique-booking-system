"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BookingTable } from "@/app/_features/booking/types/booking-types";
import { format } from "date-fns";
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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

interface BookingTableV2Props {
  bookings: BookingTable[];
  onView?: (booking: BookingTable) => void;
  onEdit?: (booking: BookingTable) => void;
  onDelete?: (booking: BookingTable) => void;
}

export function BookingTableV2({
  bookings,
  onView,
  onEdit,
  onDelete,
}: BookingTableV2Props) {
  const columns: ColumnDef<BookingTable>[] = [
    {
      accessorKey: "customer",
      header: "Customer Name",
    },
    {
      accessorKey: "tour_title",
      header: "Tour",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      accessorKey: "booking_date",
      header: "Booking Date",
      cell: ({ row }) => {
        return format(new Date(row.getValue("booking_date")), "MMM dd, yyyy");
      },
    },
    {
      accessorKey: "selected_time",
      header: "Selected Time",
      // cell: ({ row }) => {
      //   return format(new Date(row.getValue("selected_time")), "HH:mm");
      // },
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
                onClick={() => onView?.(booking)}
                className="cursor-pointer"
              >
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onEdit?.(booking)}
                className="cursor-pointer"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete?.(booking)}
                className="cursor-pointer text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <TableV2
      columns={columns}
      data={bookings}
      filterColumn="customer"
      filterPlaceholder="Filter by customer name..."
    />
  );
}
