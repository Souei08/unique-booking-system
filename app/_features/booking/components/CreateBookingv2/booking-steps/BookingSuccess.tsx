import React, { useEffect, useState } from "react";
import { CheckCircle2, Copy, Mail, Calendar, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tour } from "@/app/_features/tours/tour-types";
import { DateValue, getLocalTimeZone } from "@internationalized/date";
import { formatToDateString } from "@/app/_lib/utils/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { getOneBooking } from "@/app/_features/booking/api/get-booking/getOneBooking";
import { BookingTable } from "@/app/_features/booking/types/booking-types";
import { formatTime } from "@/app/_lib/utils/formatTime";
import { format } from "date-fns";

interface BookingSuccessProps {
  selectedTour: Tour;
  selectedDate: DateValue;
  selectedTime: string;
  bookingId: string;
  onClose: () => void;
  isAdmin?: boolean;
}

const BookingSuccess = ({
  selectedTour,
  selectedDate,
  selectedTime,
  bookingId,
  onClose,
  isAdmin = false,
}: BookingSuccessProps) => {
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingDetails, setBookingDetails] = useState<BookingTable | null>(
    null
  );

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const booking = await getOneBooking(bookingId, null);

        if (!booking) {
          console.error("No booking found with ID:", bookingId);
          return;
        }

        setBookingDetails(booking);
        if (booking.payment_link) {
          setPaymentLink(booking.payment_link);
        }
      } catch (error) {
        console.error("Error fetching booking details:", error);
        toast.error("Failed to fetch booking details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const getSuccessMessage = () => {
    if (isAdmin) {
      return "Booking has been successfully created. A confirmation has been sent to the customer's email.";
    }
    return "Thank you for booking with us. Your reservation has been successfully processed and a confirmation has been sent to your email.";
  };

  return (
    <motion.div
      className="max-w-3xl mx-auto px-4 py-8 sm:py-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Success Header */}
      <motion.div
        className="text-center space-y-6 mb-12"
        variants={itemVariants}
      >
        <div className="flex justify-center">
          <motion.div
            className="rounded-full bg-green-100 p-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            <CheckCircle2 className="w-16 h-16 text-green-600" />
          </motion.div>
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-strong">
            Booking Created !
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {getSuccessMessage()}
          </p>
        </div>
      </motion.div>

      {/* Booking Details */}
      <motion.div
        className="bg-card rounded-2xl border shadow-lg p-6 sm:p-8 mb-8"
        variants={itemVariants}
      >
        <h3 className="text-xl font-semibold text-strong mb-6">
          Booking Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex items-start space-x-4">
            <div className="bg-primary/10 p-2 rounded-lg">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tour</p>
              <p className="font-medium text-strong">{selectedTour.title}</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date</p>
              <p className="font-medium text-strong">
                {format(
                  selectedDate.toDate(getLocalTimeZone()),
                  "MMMM d, yyyy"
                )}
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Time</p>
              <p className="font-medium text-strong">
                {formatTime(selectedTime)}
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Confirmation Sent To
              </p>
              <p className="font-medium text-strong">
                {bookingDetails?.email || "Loading..."}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Payment Link Section */}
      {isLoading ? (
        <motion.div
          className="animate-pulse bg-card rounded-2xl border p-6 sm:p-8 mb-8"
          variants={itemVariants}
        >
          <div className="h-8 bg-muted rounded-lg mb-4 w-1/3"></div>
          <div className="h-24 bg-muted rounded-lg"></div>
        </motion.div>
      ) : paymentLink ? (
        <motion.div
          className="bg-card rounded-2xl border shadow-lg p-6 sm:p-8 mb-8"
          variants={itemVariants}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-strong">
                Payment Link
              </h3>
              <span className="text-sm text-muted-foreground">
                Share with customer
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              A payment link has been generated for this booking. The customer
              can use this link to complete their payment securely.
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={paymentLink}
                  readOnly
                  className="w-full px-4 py-3 bg-background border rounded-xl text-sm pr-24 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(paymentLink);
                    toast.success("Payment link copied to clipboard");
                  }}
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-primary/10"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </motion.div>
  );
};

export default BookingSuccess;
