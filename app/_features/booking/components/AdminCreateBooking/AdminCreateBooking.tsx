"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateValue, parseDate } from "@internationalized/date";
import { createTourBookingv2 } from "../../api/CreateTourBookingv2";
import { Tour } from "@/app/_features/tours/tour-types";
import { formatToDateString } from "@/app/_lib/utils/utils";
import { RenderCalendar } from "@/app/_components/calendar-v2/RenderCalendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminCreateBookingProps {
  onClose: () => void;
  initialDate?: Date;
  tours: Tour[];
  onSuccess: () => void;
}

const AdminCreateBooking: React.FC<AdminCreateBookingProps> = ({
  onClose,
  initialDate,
  tours,
  onSuccess,
}) => {
  const [selectedTour, setSelectedTour] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<DateValue | undefined>(
    initialDate ? parseDate(initialDate.toISOString().split("T")[0]) : undefined
  );
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [numberOfPeople, setNumberOfPeople] = useState<number>(1);
  const [customerInfo, setCustomerInfo] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTour || !selectedDate || !selectedTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const tour = tours.find((t) => t.id === selectedTour);
      if (!tour) throw new Error("Tour not found");

      const bookingData = {
        first_name: customerInfo.first_name,
        last_name: customerInfo.last_name,
        email: customerInfo.email,
        phone_number: customerInfo.phone_number,
        tour_id: selectedTour,
        booking_date: formatToDateString(selectedDate) || "",
        selected_time: selectedTime,
        slots: numberOfPeople,
        total_price: tour.rate * numberOfPeople,
        payment_method: "admin",
        payment_id: "admin_" + Date.now(),
      };

      await createTourBookingv2(bookingData);
      toast.success("Booking created successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Booking Error:", error);
      toast.error("Failed to create booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMonthChange = (month: string, year: string) => {
    // You can implement any month change logic here if needed
    console.log(`Month changed to ${month} ${year}`);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Create Admin Booking</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tour Selection */}
        <div className="space-y-2">
          <Label htmlFor="tour">Select Tour</Label>
          <Select value={selectedTour} onValueChange={setSelectedTour}>
            <SelectTrigger>
              <SelectValue placeholder="Select a tour" />
            </SelectTrigger>
            <SelectContent>
              {tours.map((tour) => (
                <SelectItem key={tour.id} value={tour.id}>
                  {tour.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Selection */}
        <Card className="rounded-xl border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <RenderCalendar
              daysofWeek={[
                { day: "Monday", isActive: true },
                { day: "Tuesday", isActive: true },
                { day: "Wednesday", isActive: true },
                { day: "Thursday", isActive: true },
                { day: "Friday", isActive: true },
                { day: "Saturday", isActive: true },
                { day: "Sunday", isActive: true },
              ]}
              setSelectedDate={setSelectedDate}
              onMonthChange={handleMonthChange}
            />
          </CardContent>
        </Card>

        {/* Time Selection */}
        <div className="space-y-2">
          <Label htmlFor="time">Select Time</Label>
          <Select value={selectedTime} onValueChange={setSelectedTime}>
            <SelectTrigger>
              <SelectValue placeholder="Select a time" />
            </SelectTrigger>
            <SelectContent>
              {[
                "09:00",
                "10:00",
                "11:00",
                "13:00",
                "14:00",
                "15:00",
                "16:00",
              ].map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Number of People */}
        <div className="space-y-2">
          <Label htmlFor="people">Number of People</Label>
          <Input
            id="people"
            type="number"
            min="1"
            value={numberOfPeople}
            onChange={(e) => setNumberOfPeople(parseInt(e.target.value))}
          />
        </div>

        {/* Customer Information */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={customerInfo.first_name}
              onChange={(e) =>
                setCustomerInfo((prev) => ({
                  ...prev,
                  first_name: e.target.value,
                }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={customerInfo.last_name}
              onChange={(e) =>
                setCustomerInfo((prev) => ({
                  ...prev,
                  last_name: e.target.value,
                }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={customerInfo.email}
              onChange={(e) =>
                setCustomerInfo((prev) => ({ ...prev, email: e.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={customerInfo.phone_number}
              onChange={(e) =>
                setCustomerInfo((prev) => ({
                  ...prev,
                  phone_number: e.target.value,
                }))
              }
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Booking"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminCreateBooking;
