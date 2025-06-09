import { cva } from "class-variance-authority";

export const paymentStatuses = [
  "pending", // Awaiting payment
  "paid", // Successfully paid
  "failed", // Payment failed
  "refunding", // Refund requested or initiated
  "refunded", // Refund completed
  "partial_refund", // Partially refunded
  "cancelled", // Payment voided/cancelled before success
] as const;

export const bookingStatuses = [
  "pending", // Booking created, payment may not be complete
  "confirmed", // Payment successful, booking confirmed
  "checked_in", // Customer has arrived for the tour
  "cancelled", // Manually cancelled
  "rescheduled", // Rescheduled to a different date
  "refunded", // Fully refunded
  "partially_refunded", // Partially refunded
  "completed", // Tour ended and user attended
  "no_show", // Tour ended and user did not attend
] as const;

export type PaymentStatus = (typeof paymentStatuses)[number];
export type BookingStatus = (typeof bookingStatuses)[number];

export const statusBadgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        // Payment status variants
        payment_pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
        payment_paid: "bg-green-100 text-green-800 border-green-200",
        payment_failed: "bg-red-100 text-red-800 border-red-200",
        payment_refunding: "bg-blue-100 text-blue-800 border-blue-200",
        payment_refunded: "bg-purple-100 text-purple-800 border-purple-200",
        payment_partial_refund:
          "bg-orange-100 text-orange-800 border-orange-200",
        payment_cancelled: "bg-gray-100 text-gray-800 border-gray-200",

        // Booking status variants
        booking_pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
        booking_confirmed: "bg-green-100 text-green-800 border-green-200",
        booking_checked_in: "bg-blue-100 text-blue-800 border-blue-200",
        booking_cancelled: "bg-red-100 text-red-800 border-red-200",
        booking_rescheduled: "bg-purple-100 text-purple-800 border-purple-200",
        booking_refunded: "bg-orange-100 text-orange-800 border-orange-200",
        booking_partially_refunded:
          "bg-orange-100 text-orange-800 border-orange-200",
        booking_completed: "bg-green-100 text-green-800 border-green-200",
        booking_no_show: "bg-gray-100 text-gray-800 border-gray-200",
      },
    },
    defaultVariants: {
      variant: "payment_pending",
    },
  }
);

export const getPaymentStatusVariant = (status: PaymentStatus) => {
  return `payment_${status}` as const;
};

export const getBookingStatusVariant = (status: BookingStatus) => {
  return `booking_${status}` as const;
};
