import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import {
  statusBadgeVariants,
  getPaymentStatusVariant,
  getBookingStatusVariant,
} from "@/lib/status-badge";
import type { PaymentStatus, BookingStatus } from "@/lib/status-badge";

interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  asChild?: boolean;
  status: PaymentStatus | BookingStatus;
  type: "payment" | "booking";
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, status, type, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "span";
    const variant =
      type === "payment"
        ? getPaymentStatusVariant(status as PaymentStatus)
        : getBookingStatusVariant(status as BookingStatus);

    return (
      <Comp
        ref={ref}
        className={cn(statusBadgeVariants({ variant }), "font-bold", className)}
        {...props}
      >
        {status.replace(/_/g, " ").toUpperCase()}
      </Comp>
    );
  }
);

StatusBadge.displayName = "StatusBadge";

export { StatusBadge };
