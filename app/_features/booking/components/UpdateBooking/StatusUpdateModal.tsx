"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, Info } from "lucide-react";
import { updateBookingStatus } from "../../api/UpdateBookingStatus";
import { updateManualPaymentStatus } from "../../api/update-booking/updateManualPaymentStatus";
import { BookingTable } from "../../types/booking-types";
import { showSuccessToast, showErrorToast } from "@/utils/toastUtils";

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingTable | null;
  onSuccess: () => void;
}

const BOOKING_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
  { value: "no_show", label: "No Show" },
  { value: "rescheduled", label: "Rescheduled" },
];

const PAYMENT_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunding", label: "Refunding" },
  { value: "refunded", label: "Refunded" },
  { value: "partial_refund", label: "Partial Refund" },
];

export function StatusUpdateModal({
  isOpen,
  onClose,
  booking,
  onSuccess,
}: StatusUpdateModalProps) {
  const [bookingStatus, setBookingStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Set initial values when booking changes
  useEffect(() => {
    if (booking) {
      setBookingStatus(booking.booking_status || "");
      setPaymentStatus(booking.payment_status || "");
      // setAdminNotes(""); // Commented out with admin notes section
    }
  }, [booking]);

  const handleSubmit = async () => {
    if (!booking) return;

    setIsLoading(true);
    setError("");

    try {
      // Update booking status if changed
      if (bookingStatus !== booking.booking_status) {
        await updateBookingStatus(booking.booking_id, bookingStatus);
      }

      // Update payment status if changed
      if (paymentStatus !== booking.payment_status) {
        await updateManualPaymentStatus({
          bookingId: booking.booking_id,
          paymentStatus,
          // adminNotes: adminNotes.trim() || undefined, // Commented out with admin notes section
        });
      }

      showSuccessToast("Status updated successfully");
      onSuccess();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update status";
      setError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setBookingStatus(booking?.booking_status || "");
    setPaymentStatus(booking?.payment_status || "");
    // setAdminNotes(""); // Commented out with admin notes section
    setError("");
    onClose();
  };

  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Booking Status</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Booking Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium text-sm text-gray-900 mb-2">Booking Details</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>ID:</strong> {booking.reference_number}</p>
              <p><strong>Customer:</strong> {booking.full_name}</p>
              <p><strong>Tour:</strong> {booking.tour_title}</p>
              <p><strong>Date:</strong> {new Date(booking.booking_date).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Current Status */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium text-sm text-blue-900 mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Current Status
            </h4>
            <div className="text-sm space-y-1">
              <p><strong>Booking:</strong> {booking.booking_status}</p>
              <p><strong>Payment:</strong> {booking.payment_status}</p>
            </div>
          </div>

          {/* Booking Status Update */}
          <div className="space-y-2">
            <Label htmlFor="booking-status">Booking Status</Label>
            <Select value={bookingStatus} onValueChange={setBookingStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select booking status" />
              </SelectTrigger>
              <SelectContent>
                {BOOKING_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Status Update */}
          <div className="space-y-2">
            <Label htmlFor="payment-status">Payment Status</Label>
            <Select value={paymentStatus} onValueChange={setPaymentStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment status" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Admin Notes - Commented out for now */}
          {/* <div className="space-y-2">
            <Label htmlFor="admin-notes">Admin Notes (Optional)</Label>
            <Textarea
              id="admin-notes"
              placeholder="Add notes about the status change..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-gray-500">
              These notes will be stored with the payment record for reference.
            </p>
          </div> */}

          {/* Warning for manual payment status changes */}
          {paymentStatus !== booking.payment_status && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Manual Payment Status Update:</strong> This will override the automatic payment status. 
                Use this only when there are payment issues that need manual resolution, such as:
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Payment processed but status not updated automatically</li>
                  <li>Stripe webhook failures</li>
                  <li>Manual payment verification needed</li>
                  <li>Payment disputes or chargebacks</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 