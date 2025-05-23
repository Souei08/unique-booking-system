import React from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tour } from "@/app/_features/tours/tour-types";
import { DateValue } from "@internationalized/date";
import { formatToDateString } from "@/app/_lib/utils/utils";

interface BookingSuccessProps {
  selectedTour: Tour;
  selectedDate: DateValue;
  selectedTime: string;
  customerEmail: string;
  onClose: () => void;
}

const BookingSuccess = ({
  selectedTour,
  selectedDate,
  selectedTime,
  customerEmail,
  onClose,
}: BookingSuccessProps) => {
  return (
    <div className="max-w-2xl mx-auto text-center space-y-8 py-12">
      <div className="flex justify-center">
        <div className="rounded-full bg-green-100 p-3">
          <CheckCircle2 className="w-16 h-16 text-green-600" />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">
          Booking Confirmed!
        </h2>
        <p className="text-lg text-muted-foreground">
          Thank you for booking with us. Your reservation has been successfully
          processed.
        </p>
      </div>

      <div className="bg-muted/50 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-left">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Tour</p>
            <p className="font-medium">{selectedTour.title}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Date</p>
            <p className="font-medium">{formatToDateString(selectedDate)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Time</p>
            <p className="font-medium">{selectedTime}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Confirmation Sent To
            </p>
            <p className="font-medium">{customerEmail}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          A detailed confirmation has been sent to your email address. Please
          check your inbox.
        </p>
        <Button onClick={onClose} className="w-full sm:w-auto">
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default BookingSuccess;
