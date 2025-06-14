import React from "react";

// Types
import { Tour } from "@/app/_features/tours/tour-types";
import { SlotDetail } from "@/app/_features/booking/types/booking-types";

// Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarDate,
  DateValue,
  getLocalTimeZone,
  today,
  parseDate,
} from "@internationalized/date";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { formatTime } from "@/app/_lib/utils/formatTime";

import { Badge } from "@/components/ui/badge";

import { Clock } from "lucide-react";

import Image from "next/image";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { getTourSchedule } from "@/app/_features/tours/api/tour-schedule/client/getTourSchedule";
import { getRemainingSlots } from "@/app/_features/booking/api/get-booking/getRemainingSlots";
import { RenderCalendar } from "@/app/_components/calendar-v2/RenderCalendar";
import { getFullyBookedDatesFromList } from "../../../api/get-booking/getFullyBookedDatesFromList";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export type Weekday =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export const allWeekdays: Weekday[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface TourSchedule {
  weekday: string;
  available_time: string;
}

interface TimeSlot {
  start_time: string;
  remainingSlots: number;
}

const TourTimeAndDate = ({
  selectedTour,
  handleNext,
  selectedDate,
  selectedTime,
  setSelectedDate,
  setSelectedTime,
  numberOfPeople,
  setNumberOfPeople,
  customSlotTypes,
  setSlotDetails,
  slotDetails,
}: {
  selectedTour: Tour;
  handleNext: () => void;
  selectedDate: DateValue;
  selectedTime: string;
  setSelectedDate: (date: DateValue) => void;
  setSelectedTime: (time: string) => void;
  numberOfPeople: number;
  setNumberOfPeople: (numberOfPeople: number) => void;
  customSlotTypes: any[] | null;
  setSlotDetails: React.Dispatch<React.SetStateAction<SlotDetail[]>>;
  slotDetails: SlotDetail[];
}) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(
    null
  );

  const [tourSchedules, setTourSchedules] = useState<TourSchedule[]>([]);
  const [availableWeekdays, setAvailableWeekdays] = useState<
    { day: string; isActive: boolean }[]
  >([]);

  const [availableTimes, setAvailableTimes] = useState<TimeSlot[]>([]);
  const [fullyBookedDates, setFullyBookedDates] = useState<string[]>([]);

  // Add state for slot type counts
  const [slotTypeCounts, setSlotTypeCounts] = useState<Record<string, number>>(
    () => {
      if (customSlotTypes) {
        return customSlotTypes.reduce(
          (acc, type) => ({
            ...acc,
            [type.name]: 0,
          }),
          {}
        );
      }
      return {};
    }
  );

  // Update total number of people when slot type counts change
  useEffect(() => {
    if (customSlotTypes) {
      const total = Object.values(slotTypeCounts).reduce(
        (sum, count) => sum + count,
        0
      );
      setNumberOfPeople(total);
    }
  }, [slotTypeCounts, customSlotTypes]);

  // Handle slot type count changes
  const handleSlotTypeCountChange = (typeName: string, newCount: number) => {
    if (newCount < 0) return;

    const maxSlots = selectedTimeSlot
      ? selectedTimeSlot.remainingSlots
      : selectedTour.group_size_limit;
    const currentTotal = Object.values(slotTypeCounts).reduce(
      (sum, count) => sum + count,
      0
    );
    const otherTypesTotal = currentTotal - (slotTypeCounts[typeName] || 0);

    if (newCount + otherTypesTotal > maxSlots) {
      newCount = maxSlots - otherTypesTotal;
    }

    setSlotTypeCounts((prev) => ({
      ...prev,
      [typeName]: newCount,
    }));

    // Only update slot details if we have custom slot types
    if (customSlotTypes && customSlotTypes.length > 0) {
      const newSlotDetails: SlotDetail[] = [];
      Object.entries(slotTypeCounts).forEach(([type, count]) => {
        // Add the new count for the current type
        const typeCount = type === typeName ? newCount : count;
        // Add slots for this type
        for (let i = 0; i < typeCount; i++) {
          const slotType = customSlotTypes.find((t) => t.name === type);
          if (slotType) {
            newSlotDetails.push({
              type: type,
              price: slotType.price,
            });
          }
        }
      });

      setSlotDetails(newSlotDetails);
    }
  };

  // Parse images from string to array
  const tourImages = JSON.parse(selectedTour.images) as { url: string }[];

  // Fetch tour schedules when component mounts
  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      try {
        const schedules = await getTourSchedule(selectedTour.id);

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

    fetchSchedules();
  }, [selectedTour.id]);

  // Get available times for selected date
  const getAvailableTimesForDate = async () => {
    if (!selectedDate) return [];
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
            selectedTour.id,
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
          setSelectedTime("");
          setSelectedTimeSlot(null);
        } else {
          setSelectedTimeSlot(currentTimeSlot);
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

  // Handle time selection
  const handleTimeSelection = (time: string) => {
    setSelectedTime(time);
    const timeSlot = availableTimes.find((slot) => slot.start_time === time);
    setSelectedTimeSlot(timeSlot || null);

    // Reset number of people if it exceeds available slots
    if (timeSlot && numberOfPeople > timeSlot.remainingSlots) {
      setNumberOfPeople(timeSlot.remainingSlots);
    }
  };

  const handleClickBooking = () => {
    handleNext();
  };

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
      selectedTour.id,
      availableDates
    );
    setFullyBookedDates(fullyBookedDates);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-12 max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-12">
      {/* Right side - Calendar and Available Times */}
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 md:top-8 md:self-start order-first md:order-last">
        <Card className="rounded-xl sm:rounded-2xl lg:rounded-3xl border bg-card shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-strong sm:text-xl lg:text-2xl font-bold">
              Select Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-4 sm:py-6 lg:py-10">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 border-b-2 border-primary"></div>
              </div>
            ) : (
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
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl sm:rounded-2xl lg:rounded-3xl border bg-card shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-strong sm:text-xl lg:text-2xl font-bold">
              Available Times
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingTimeSlots ? (
              <div className="flex items-center justify-center py-4 sm:py-6 lg:py-10">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 border-b-2 border-primary"></div>
              </div>
            ) : availableTimes.length > 0 ? (
              <RadioGroup
                value={selectedTime}
                onValueChange={handleTimeSelection}
                className="grid gap-2 sm:gap-3"
              >
                {availableTimes.map((timeSlot, index) => {
                  const formattedTime = formatTime(timeSlot.start_time);

                  return (
                    <div
                      key={index}
                      className={cn(
                        "group relative overflow-hidden rounded-lg sm:rounded-xl border bg-background transition-all duration-200",
                        selectedTime === timeSlot.start_time
                          ? "border-brand bg-brand/5"
                          : "hover:border-brand/50",
                        timeSlot.remainingSlots === 0 &&
                          "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <RadioGroupItem
                        value={timeSlot.start_time}
                        id={`time-${index}`}
                        className="peer absolute opacity-0"
                        disabled={timeSlot.remainingSlots === 0}
                      />
                      <Label
                        htmlFor={`time-${index}`}
                        className="flex cursor-pointer items-center justify-between p-3 sm:p-4"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div
                            className={cn(
                              "flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full border-2 transition-colors",
                              selectedTime === timeSlot.start_time
                                ? "border-brand bg-brand"
                                : "border-brand/20 bg-brand/5 group-hover:border-brand/40"
                            )}
                          >
                            {selectedTime === timeSlot.start_time && (
                              <div className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-white" />
                            )}
                          </div>
                          <p className="text-base sm:text-lg font-semibold text-foreground">
                            {formattedTime}
                          </p>
                        </div>
                        <Badge
                          variant={
                            timeSlot.remainingSlots > 0
                              ? "default"
                              : "destructive"
                          }
                          className={cn(
                            "text-xs font-medium",
                            timeSlot.remainingSlots > 0
                              ? "bg-brand/10 text-brand hover:bg-brand/20"
                              : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                          )}
                        >
                          {timeSlot.remainingSlots} slots left
                        </Badge>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg sm:rounded-xl border border-dashed p-4 sm:p-6 lg:p-8 text-center">
                <div className="rounded-full bg-muted p-2 sm:p-3">
                  <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-muted-foreground" />
                </div>
                <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-semibold text-foreground">
                  No available times
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                  There are no available time slots for this date. Please select
                  another date.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedTime && (
          <Card className="rounded-xl sm:rounded-2xl lg:rounded-3xl border bg-card shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg text-strong sm:text-xl lg:text-2xl font-bold">
                {customSlotTypes ? "Select Slots" : "Number of People"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {customSlotTypes ? (
                  <div className="space-y-4 sm:space-y-6">
                    {customSlotTypes.map((type) => (
                      <div
                        key={type.name}
                        className="rounded-lg sm:rounded-xl border bg-background p-3 sm:p-4 transition-all duration-200 hover:border-brand/50"
                      >
                        <div className="mb-3 sm:mb-4">
                          <h4 className="text-base sm:text-lg font-semibold text-foreground">
                            {type.name}
                          </h4>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            ${type.price} per person
                          </p>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              handleSlotTypeCountChange(
                                type.name,
                                (slotTypeCounts[type.name] || 0) - 1
                              )
                            }
                            className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg border bg-background text-lg sm:text-xl font-semibold text-foreground transition-colors hover:bg-brand/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={(slotTypeCounts[type.name] || 0) <= 0}
                          >
                            -
                          </button>
                          <div className="flex-1">
                            <Input
                              type="number"
                              min={0}
                              max={
                                selectedTimeSlot
                                  ? selectedTimeSlot.remainingSlots
                                  : selectedTour.group_size_limit
                              }
                              value={slotTypeCounts[type.name] || ""}
                              onChange={(e) => {
                                const value =
                                  e.target.value === ""
                                    ? 0
                                    : parseInt(e.target.value);
                                handleSlotTypeCountChange(type.name, value);
                              }}
                              className="h-8 sm:h-10 text-center text-base sm:text-lg font-medium"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleSlotTypeCountChange(
                                type.name,
                                (slotTypeCounts[type.name] || 0) + 1
                              )
                            }
                            className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg border bg-background text-lg sm:text-xl font-semibold text-foreground transition-colors hover:bg-brand/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={
                              (slotTypeCounts[type.name] || 0) >=
                              (selectedTimeSlot
                                ? selectedTimeSlot.remainingSlots
                                : selectedTour.group_size_limit)
                            }
                          >
                            +
                          </button>
                        </div>
                        <div className="mt-2 sm:mt-3 flex items-center justify-between rounded-lg bg-brand/5 p-2 sm:p-3">
                          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                            Total for {type.name}
                          </p>
                          <p className="text-sm sm:text-base font-semibold text-brand">
                            ${(slotTypeCounts[type.name] || 0) * type.price}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div className="mt-4 sm:mt-6 rounded-lg sm:rounded-xl border bg-brand/5 p-4 sm:p-6">
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm sm:text-base font-medium text-foreground">
                            Total People
                          </p>
                          <p className="text-base sm:text-lg font-semibold text-brand">
                            {numberOfPeople}
                          </p>
                        </div>
                        <div className="h-px bg-border" />
                        <div className="flex items-center justify-between">
                          <p className="text-sm sm:text-base font-medium text-foreground">
                            Total Amount
                          </p>
                          <p className="text-base sm:text-lg font-semibold text-brand">
                            $
                            {slotDetails.reduce(
                              (sum, slot) => sum + slot.price,
                              0
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (numberOfPeople > 1) {
                          setNumberOfPeople(numberOfPeople - 1);
                        }
                      }}
                      className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg border bg-background text-lg sm:text-xl font-semibold text-foreground transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={numberOfPeople <= 1}
                    >
                      -
                    </button>
                    <div className="flex-1">
                      <Input
                        type="number"
                        min={1}
                        max={
                          selectedTimeSlot
                            ? selectedTimeSlot.remainingSlots
                            : selectedTour.group_size_limit
                        }
                        value={numberOfPeople || ""}
                        onChange={(e) => {
                          const value =
                            e.target.value === ""
                              ? ""
                              : parseInt(e.target.value);

                          if (value === "") {
                            setNumberOfPeople(0);
                            return;
                          }

                          const maxValue = selectedTimeSlot
                            ? selectedTimeSlot.remainingSlots
                            : selectedTour.group_size_limit;

                          if (!isNaN(value)) {
                            if (value >= 1 && value <= maxValue) {
                              setNumberOfPeople(value);
                            } else if (value > maxValue) {
                              setNumberOfPeople(maxValue);
                            } else if (value < 1) {
                              setNumberOfPeople(1);
                            }
                          }
                        }}
                        onBlur={(e) => {
                          const value = parseInt(e.target.value);
                          if (isNaN(value) || value < 1) {
                            setNumberOfPeople(1);
                          }
                        }}
                        className="h-8 sm:h-10 text-center text-sm sm:text-base"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const maxValue = selectedTimeSlot
                          ? selectedTimeSlot.remainingSlots
                          : selectedTour.group_size_limit;
                        if (numberOfPeople < maxValue) {
                          setNumberOfPeople(numberOfPeople + 1);
                        }
                      }}
                      className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg border bg-background text-lg sm:text-xl font-semibold text-foreground transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={
                        numberOfPeople >=
                        (selectedTimeSlot
                          ? selectedTimeSlot.remainingSlots
                          : selectedTour.group_size_limit)
                      }
                    >
                      +
                    </button>
                  </div>
                )}
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {selectedTimeSlot
                    ? `${selectedTimeSlot.remainingSlots} slots available for this time`
                    : `Maximum ${selectedTour.group_size_limit} people per booking`}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-none shadow-xl">
          <CardContent className="pt-3 sm:pt-4">
            <button
              type="button"
              className={cn(
                "w-full rounded-lg sm:rounded-xl lg:rounded-2xl px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 text-sm sm:text-base lg:text-lg font-semibold text-primary-foreground focus:ring-4 focus:ring-primary focus:ring-offset-4 focus:outline-none transition-all duration-300",
                !selectedTime || !numberOfPeople
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-brand hover:bg-brand/90"
              )}
              disabled={!selectedTime || !numberOfPeople}
              onClick={handleClickBooking}
            >
              Continue to Booking
            </button>
            {(!selectedTime || !numberOfPeople) && (
              <p className="mt-2 text-sm text-muted-foreground text-center">
                {!selectedTime
                  ? "Please select a date and time to continue"
                  : "Please select the number of people to continue"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Left side - Tour Details */}
      <div className="md:col-span-2 space-y-4 sm:space-y-6 lg:space-y-12 order-last md:order-first">
        {/* Price and Key Info */}
        <div className="rounded-xl sm:rounded-2xl lg:rounded-3xl border bg-card p-3 sm:p-6 lg:p-10 shadow-xl">
          {/* Tour Images */}
          <div className="space-y-3 sm:space-y-4 lg:space-y-6 mb-4 sm:mb-6 lg:mb-10">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl">
              <Image
                src={tourImages[selectedImage].url}
                alt={selectedTour.title}
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
            {tourImages.length > 1 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                {tourImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "group relative aspect-[16/9] overflow-hidden rounded-lg sm:rounded-xl lg:rounded-2xl transition-all duration-300",
                      selectedImage === index
                        ? "ring-2 sm:ring-3 ring-primary ring-offset-2 sm:ring-offset-4"
                        : "hover:opacity-90"
                    )}
                  >
                    <Image
                      src={image.url}
                      alt={`${selectedTour.title} - Image ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title and Category */}
          <div className="mb-4 sm:mb-6 lg:mb-10">
            <h1 className="text-xl sm:text-2xl lg:text-5xl font-bold tracking-tight text-strong">
              {selectedTour.title}
            </h1>
            <div className="mt-3 sm:mt-4 lg:mt-6 flex flex-wrap items-center gap-2 sm:gap-4">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 sm:px-4 lg:px-5 py-1 sm:py-1.5 lg:py-2 text-xs sm:text-sm font-semibold text-primary">
                {selectedTour.category
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (char) => char.toUpperCase())}
              </span>
              <span className="inline-flex items-center rounded-full bg-secondary/10 px-2.5 sm:px-4 lg:px-5 py-1 sm:py-1.5 lg:py-2 text-xs sm:text-sm font-semibold text-secondary-foreground">
                <Clock className="mr-1 sm:mr-1.5 lg:mr-2 h-3 sm:h-3.5 lg:h-4 w-3 sm:w-3.5 lg:w-4" />
                {selectedTour.duration} Hours
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 sm:gap-0">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-strong">
                $
                {selectedTour.custom_slot_types &&
                selectedTour.custom_slot_types !== "[]"
                  ? Math.min(
                      ...JSON.parse(selectedTour.custom_slot_types).map(
                        (type: any) => type.price
                      )
                    )
                  : selectedTour.rate}
              </h2>
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                {selectedTour.custom_slot_types &&
                selectedTour.custom_slot_types !== "[]"
                  ? "starting from"
                  : "per person"}
              </span>
            </div>
          </div>

          <div className="mt-4 sm:mt-6 lg:mt-10 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-10">
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">
                Group Size
              </h3>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg font-semibold text-strong">
                Max {selectedTour.group_size_limit} people
              </p>
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">
                Languages
              </h3>
              <div className="mt-1 sm:mt-2 flex flex-wrap gap-1.5 sm:gap-2">
                {selectedTour.languages.map((language) => (
                  <span
                    key={language}
                    className="inline-flex items-center rounded-full bg-secondary/10 px-2 sm:px-3 lg:px-4 py-0.5 sm:py-1 lg:py-1.5 text-xs sm:text-sm font-medium text-secondary-foreground"
                  >
                    {language}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 sm:mt-6 lg:mt-10 space-y-4 sm:space-y-6 lg:space-y-8">
            <div className="flex items-start space-x-2 sm:space-x-3 lg:space-x-5">
              <div className="rounded-full bg-primary/10 p-1.5 sm:p-2 lg:p-3">
                <svg
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-6 lg:w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Meeting Point
                </h3>
                <p className="mt-0.5 sm:mt-1 text-sm sm:text-base lg:text-lg font-medium text-strong">
                  {selectedTour.meeting_point_address}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-2 sm:space-x-3 lg:space-x-5">
              <div className="rounded-full bg-primary/10 p-1.5 sm:p-2 lg:p-3">
                <svg
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-6 lg:w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Drop-off Point
                </h3>
                <p className="mt-0.5 sm:mt-1 text-sm sm:text-base lg:text-lg font-medium text-strong">
                  {selectedTour.dropoff_point_address}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Description and Details */}
        <div className="space-y-4 sm:space-y-6 lg:space-y-12">
          <section className="rounded-xl sm:rounded-2xl lg:rounded-3xl border bg-card p-3 sm:p-6 lg:p-8 shadow-lg">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-strong mb-3 sm:mb-4 lg:mb-8">
              Description
            </h3>
            <div>
              <p className="text-sm sm:text-base lg:text-lg leading-relaxed text-muted-foreground">
                {selectedTour.description}
              </p>
            </div>
          </section>

          <section className="rounded-xl sm:rounded-2xl lg:rounded-3xl border bg-card p-3 sm:p-6 lg:p-8 shadow-lg">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-strong mb-3 sm:mb-4 lg:mb-8">
              Trip Highlights
            </h3>
            <div>
              <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                {selectedTour.trip_highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="flex items-start space-x-2 sm:space-x-3 lg:space-x-4"
                  >
                    <div className="mt-1 rounded-full bg-primary/10 p-1 sm:p-1.5">
                      <svg
                        className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-sm sm:text-base lg:text-lg text-muted-foreground">
                      {highlight}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="rounded-xl sm:rounded-2xl lg:rounded-3xl border bg-card p-3 sm:p-6 lg:p-8 shadow-lg">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-strong mb-3 sm:mb-4 lg:mb-8">
              What's Included
            </h3>
            <div>
              <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                {selectedTour.includes.map((item) => (
                  <li
                    key={item}
                    className="flex items-start space-x-2 sm:space-x-3 lg:space-x-4"
                  >
                    <div className="mt-1 rounded-full bg-primary/10 p-1 sm:p-1.5">
                      <svg
                        className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-sm sm:text-base lg:text-lg text-muted-foreground">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="rounded-xl sm:rounded-2xl lg:rounded-3xl border bg-card p-3 sm:p-6 lg:p-8 shadow-lg">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-strong mb-3 sm:mb-4 lg:mb-8">
              Things to Know
            </h3>
            <div>
              <p className="text-sm sm:text-base lg:text-lg leading-relaxed text-muted-foreground">
                {selectedTour.things_to_know}
              </p>
            </div>
          </section>

          <section className="rounded-xl sm:rounded-2xl lg:rounded-3xl border bg-card p-3 sm:p-6 lg:p-8 shadow-lg">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-strong mb-3 sm:mb-4 lg:mb-8">
              Frequently Asked Questions
            </h3>
            <div>
              <Accordion
                type="single"
                collapsible
                className="space-y-2 sm:space-y-3 lg:space-y-4"
              >
                {selectedTour.faq.map((faq: string, index: number) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border-b last:border-0"
                  >
                    <AccordionTrigger className="text-base sm:text-lg lg:text-xl font-semibold text-strong hover:no-underline">
                      {JSON.parse(faq).question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm sm:text-base lg:text-lg text-muted-foreground">
                      {JSON.parse(faq).answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TourTimeAndDate;
