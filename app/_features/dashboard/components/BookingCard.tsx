import { Badge } from "@/components/ui/badge";
import { RoleAvatar } from "@/app/_components/common/RoleAvatar";
import Image from "next/image";
import {
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  PlusIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { BookingTable } from "@/app/_features/booking/types/booking-types";
import {
  statusBadgeVariants,
  getBookingStatusVariant,
} from "@/lib/status-badge";

interface BookingCardProps {
  booking: BookingTable;
  variant: "tour" | "booking";
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return (
    date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) +
    " at " +
    date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
};

const capitalizeStatus = (status: string) => {
  return status.toUpperCase().replace(/_/g, " ");
};

export const BookingCard = ({ booking, variant }: BookingCardProps) => {
  const isTourVariant = variant === "tour";

  return (
    <div className="group flex rounded-lg bg-background border border-stroke-weak transition-all duration-200 hover:border-brand/50 hover:bg-fill overflow-hidden relative">
      {/* Content column */}
      <div className="flex-1 p-5 space-y-4">
        {/* Header with title and status */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-text group-hover:text-brand text-base leading-tight flex-1 min-w-0">
              {booking.tour_title}
            </h3>
            <Badge
              className={`${statusBadgeVariants({
                variant: getBookingStatusVariant(booking.booking_status as any),
              })} font-bold text-xs uppercase tracking-wide`}
            >
              {capitalizeStatus(booking.booking_status)}
            </Badge>
          </div>

          {/* Booking details in a 2x2 grid layout */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-tiny text-weak">
                <CalendarIcon className="h-3.5 w-3.5" />
                <span>Date</span>
              </div>
              <div className="text-small font-medium text-text">
                {formatDate(booking.booking_date)}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-tiny text-weak">
                <ClockIcon className="h-3.5 w-3.5" />
                <span>Time</span>
              </div>
              <div className="text-small font-medium text-text">
                {booking.selected_time}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-tiny text-weak">
                <CurrencyDollarIcon className="h-3.5 w-3.5" />
                <span>Price</span>
              </div>
              <div className="text-small font-medium text-text">
                ${booking.amount_paid}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-tiny text-weak">
                <PlusIcon className="h-3.5 w-3.5" />
                <span>Products</span>
              </div>
              <div className="text-small font-medium text-text">
                {booking.booked_products && booking.booked_products.length > 0
                  ? `${booking.booked_products.length} item${booking.booked_products.length !== 1 ? "s" : ""}`
                  : "None"}
              </div>
            </div>
          </div>
        </div>

        {/* Footer with user info and avatar */}
        <div className="pt-3 border-t border-stroke-weak">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <RoleAvatar
                full_name={booking.full_name}
                className="h-10 w-10 ring-2 ring-brand/20"
              />
              <div className="text-left space-y-1">
                <div className="font-medium text-text text-small">
                  {booking.full_name}
                </div>
                <div className="flex items-center gap-1.5 text-tiny text-weak">
                  <UserGroupIcon className="h-3 w-3" />
                  <span>
                    {booking.slots} slot{booking.slots !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-tiny text-weak">
              Booked on {formatDateTime(booking.booking_created_at)}
            </div>
          </div>
        </div>
      </div>

      {/* Featured image column - full height background */}
      {booking.tour_featured_image && (
        <div className="relative w-32 flex-shrink-0">
          <Image
            src={booking.tour_featured_image}
            alt={booking.tour_title}
            fill
            className="object-cover transition-transform duration-200 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />
        </div>
      )}

      {/* Reference number pill - floating on bottom right */}
      <div className="absolute bottom-3 right-3 z-10">
        <div className="bg-brand/90 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full shadow-sm">
          #{booking.reference_number}
        </div>
      </div>
    </div>
  );
};
