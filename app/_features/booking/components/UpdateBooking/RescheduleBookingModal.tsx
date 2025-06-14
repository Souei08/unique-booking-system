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
import { getLocalTimeZone, parseDate } from "@internationalized/date";
import { RenderCalendar } from "@/app/_components/calendar-v2/RenderCalendar";
import { getTourSchedule } from "@/app/_features/tours/api/tour-schedule/client/getTourSchedule";
import { DateValue } from "@internationalized/date";
import { getRemainingSlots } from "@/app/_features/booking/api/get-booking/getRemainingSlots";
import { Badge } from "@/components/ui/badge";
import { getFullyBookedDatesFromList } from "@/app/_features/booking/api/get-booking/getFullyBookedDatesFromList";
import { CalendarDays, Clock, RefreshCw } from "lucide-react";

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

      const times = tourSchedules
        .filter((schedule) => schedule.weekday.toLowerCase() === weekday)
        .flatMap((schedule) => JSON.parse(schedule.available_time));

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

    const monthNum = new Date(`${month} 1, ${year}`).getMonth();
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
        const formatted = localDate.toISOString().split("T")[0];
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
      <DialogContent className="max-w-[95vw] sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-2xl font-bold text-strong flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Reschedule Booking
          </DialogTitle>
          <p className="text-sm text-gray-500">
            Select a new date and time for this booking. Make sure to check the
            available slots.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Selection */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-strong flex items-center gap-2">
                  <CalendarDays className="w-5 h-5" />
                  Select Date
                </h3>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="w-full max-w-md mx-auto">
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

            {/* Time Selection */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-strong flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Select Time
                </h3>
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
                  >
                    {availableTimes.map((timeSlot, index) => {
                      const timeDate = new Date(
                        `${selectedDate?.toString()}T${timeSlot.start_time}`
                      );
                      const formattedTime = format(timeDate, "h:mm a");

                      return (
                        <div
                          key={index}
                          className={cn(
                            "flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent cursor-pointer transition-colors",
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
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                      <Clock className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {selectedDate
                        ? "No Available Times"
                        : "Select a Date First"}
                    </h3>
                    <p className="text-gray-500">
                      {selectedDate
                        ? "There are no available time slots for this date."
                        : "Please select a date to view available time slots."}
                    </p>
                  </div>
                )}
              </div>
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
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Rescheduling...
                </>
              ) : (
                "Reschedule"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RescheduleBookingModal;
