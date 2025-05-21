import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { getLocalTimeZone, parseDate, today } from "@internationalized/date";
import { RenderCalendar } from "@/app/_components/calendar-v2/RenderCalendar";
import { getTourSchedule } from "@/app/_features/tours/api/tour-schedule/client/getTourSchedule";
import { DateValue } from "@internationalized/date";
import { getRemainingSlots } from "@/app/_features/booking/api/getRemainingSlots";
import { Badge } from "@/components/ui/badge";
import { getFullyBookedDatesFromList } from "@/app/_features/booking/api/getFullyBookedDatesFromList";

interface TimeSlot {
  start_time: string;
  remainingSlots: number;
}

interface RescheduleBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReschedule: (newDate: string, newTime: string) => Promise<void>;
  currentDate?: string;
  currentTime?: string;
  tourId: string;
}

const RescheduleBookingModal: React.FC<RescheduleBookingModalProps> = ({
  isOpen,
  onClose,
  onReschedule,
  currentDate,
  currentTime,
  tourId,
}) => {
  const [selectedDate, setSelectedDate] = useState<DateValue | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [tourSchedules, setTourSchedules] = useState<any[]>([]);
  const [availableWeekdays, setAvailableWeekdays] = useState<
    { day: string; isActive: boolean }[]
  >([]);
  const [availableTimes, setAvailableTimes] = useState<TimeSlot[]>([]);
  const [fullyBookedDates, setFullyBookedDates] = useState<string[]>([]);

  const allWeekdays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Initialize selected values when component mounts or when currentDate/currentTime changes
  useEffect(() => {
    if (currentDate) {
      try {
        const parsedDate = parseDate(currentDate);
        setSelectedDate(parsedDate);
      } catch (error) {
        console.error("Error parsing date:", error);
        setSelectedDate(null);
      }
    }
    if (currentTime) {
      setSelectedTime(currentTime);
    }
  }, [currentDate, currentTime]);

  // Reset selected values when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (currentDate) {
        try {
          const parsedDate = parseDate(currentDate);
          setSelectedDate(parsedDate);
        } catch (error) {
          console.error("Error parsing date:", error);
          setSelectedDate(null);
        }
      }
      if (currentTime) {
        setSelectedTime(currentTime);
      }
    } else {
      // Reset values when modal closes
      setSelectedDate(null);
      setSelectedTime(null);
      setAvailableTimes([]);
      setFullyBookedDates([]);
    }
  }, [isOpen, currentDate, currentTime]);

  // Fetch tour schedules when component mounts
  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      try {
        const schedules = await getTourSchedule(tourId);

        const activeWeekdays = new Set(
          schedules.map((schedule) => schedule.weekday)
        );

        // Create the daysOfWeek array with active status
        const daysOfWeek = allWeekdays.map((day) => ({
          day,
          isActive: activeWeekdays.has(day),
        }));

        setAvailableWeekdays(daysOfWeek);
        setTourSchedules(schedules);
      } catch (error) {
        console.error("Error fetching schedules:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchSchedules();
    }
  }, [tourId, isOpen]);

  // Get available times for selected date
  const getAvailableTimesForDate = async () => {
    if (!selectedDate) return;
    setLoadingTimeSlots(true);

    try {
      const weekday = format(
        selectedDate.toDate(getLocalTimeZone()),
        "EEEE"
      ).toLowerCase();

      // Filter schedules and ensure we're comparing lowercase weekdays
      const times = tourSchedules
        .filter((schedule) => schedule.weekday.toLowerCase() === weekday)
        .flatMap((schedule) => JSON.parse(schedule.available_time));

      // Get remaining slots for each time
      const timesWithSlots = await Promise.all(
        times.map(async (time: { start_time: string }) => {
          const remainingSlots = await getRemainingSlots(
            tourId,
            selectedDate.toString(),
            time.start_time
          );
          return {
            start_time: time.start_time,
            remainingSlots,
          };
        })
      );

      setAvailableTimes(timesWithSlots);

      // Reset selected time if current selection has no slots
      if (selectedTime) {
        const currentTimeSlot = timesWithSlots.find(
          (slot) => slot.start_time === selectedTime
        );
        if (!currentTimeSlot || currentTimeSlot.remainingSlots === 0) {
          setSelectedTime(null);
        }
      }
    } catch (error) {
      console.error("Error fetching available times:", error);
    } finally {
      setLoadingTimeSlots(false);
    }
  };

  // Update available times when date changes
  useEffect(() => {
    if (selectedDate) {
      getAvailableTimesForDate();
    }
  }, [selectedDate]);

  function getAvailableDatesByWeekday(
    month: string,
    year: string,
    activeDaysOfWeek: { day: string; isActive: boolean }[]
  ): string[] {
    const activeWeekdays = activeDaysOfWeek
      .filter((d) => d.isActive)
      .map((d) => d.day.toLowerCase());

    const monthNum = new Date(`${month} 1, ${year}`).getMonth(); // 0-indexed
    const yearNum = parseInt(year);

    const dates: string[] = [];
    const date = new Date(yearNum, monthNum, 1);

    while (date.getMonth() === monthNum) {
      const dayName = date
        .toLocaleDateString("en-US", { weekday: "long" })
        .toLowerCase();

      if (activeWeekdays.includes(dayName)) {
        const localDate = new Date(
          date.getTime() - date.getTimezoneOffset() * 60000
        );
        const formatted = localDate.toISOString().split("T")[0]; // 'YYYY-MM-DD'
        dates.push(formatted);
      }

      date.setDate(date.getDate() + 1);
    }

    return dates;
  }

  const handleMonthChange = async (month: string, year: string) => {
    const availableDates = getAvailableDatesByWeekday(
      month,
      year,
      availableWeekdays
    );

    const fullyBookedDates = await getFullyBookedDatesFromList(
      tourId,
      availableDates
    );
    setFullyBookedDates(fullyBookedDates);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      toast.error("Please select both date and time");
      return;
    }

    setIsLoading(true);
    try {
      const formattedDate = selectedDate.toString();
      await onReschedule(formattedDate, selectedTime);
      toast.success("Booking rescheduled successfully");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to reschedule booking");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            Reschedule Booking
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Calendar */}
          <div className="bg-background rounded-lg border border-stroke-weak">
            <div className="px-6 py-4 border-b border-stroke-weak">
              <h2 className="text-h2 font-medium text-strong">Select Date</h2>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="w-full max-w-[400px] mx-auto">
                  <RenderCalendar
                    daysofWeek={
                      availableWeekdays.length > 0
                        ? availableWeekdays
                        : allWeekdays.map((day) => ({ day, isActive: true }))
                    }
                    setSelectedDate={setSelectedDate}
                    onMonthChange={handleMonthChange}
                    disabledDates={fullyBookedDates}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Available Times */}
          <div className="bg-background rounded-lg border border-stroke-weak">
            <div className="px-6 py-4 border-b border-stroke-weak">
              <h2 className="text-h2 font-medium text-strong">
                Available Times
              </h2>
            </div>
            <div className="p-6">
              {loadingTimeSlots ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : availableTimes.length > 0 ? (
                <RadioGroup
                  value={selectedTime || ""}
                  onValueChange={setSelectedTime}
                  className="grid gap-2"
                >
                  {availableTimes.map((timeSlot, index) => {
                    // Parse the time string and format it
                    const timeDate = new Date(
                      `${selectedDate?.toString()}T${timeSlot.start_time}`
                    );
                    const formattedTime = format(timeDate, "h:mm a");

                    return (
                      <div
                        key={index}
                        className={cn(
                          "flex items-center space-x-3 rounded-lg border p-3 hover:bg-accent cursor-pointer transition-colors",
                          selectedTime === timeSlot.start_time &&
                            "border-primary bg-accent",
                          timeSlot.remainingSlots === 0 &&
                            "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <RadioGroupItem
                          value={timeSlot.start_time}
                          id={`time-${index}`}
                          className="border-primary"
                          disabled={timeSlot.remainingSlots === 0}
                        />
                        <Label
                          htmlFor={`time-${index}`}
                          className="flex w-full cursor-pointer items-center justify-between"
                        >
                          <span className="font-medium">{formattedTime}</span>
                          <Badge
                            variant={
                              timeSlot.remainingSlots > 0
                                ? "default"
                                : "destructive"
                            }
                          >
                            {timeSlot.remainingSlots} slots left
                          </Badge>
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  {selectedDate
                    ? "No available times for this date"
                    : "Please select a date first"}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !selectedDate || !selectedTime}
              className="w-full sm:w-auto"
            >
              {isLoading ? "Rescheduling..." : "Reschedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RescheduleBookingModal;
