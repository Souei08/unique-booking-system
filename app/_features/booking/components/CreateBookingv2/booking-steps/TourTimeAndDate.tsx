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

import { Clock, MapPin, Navigation } from "lucide-react";

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4 lg:gap-8 ">
      {/* Right side - Calendar and Available Times */}
      <div className="space-y-4 md:top-6 md:self-start order-first md:order-last">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0066cc]"></div>
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
            title="Select Date"
          />
        )}

        {selectedDate && (
          <Card className="rounded-xl border bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-strong">
                Available Times
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTimeSlots ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0066cc]"></div>
                </div>
              ) : availableTimes.length > 0 ? (
                <RadioGroup
                  value={selectedTime}
                  onValueChange={handleTimeSelection}
                  className="grid gap-2"
                >
                  {availableTimes.map((timeSlot, index) => {
                    const formattedTime = formatTime(timeSlot.start_time);

                    return (
                      <div
                        key={index}
                        className={cn(
                          "group relative overflow-hidden rounded-lg border bg-white transition-all duration-200",
                          selectedTime === timeSlot.start_time
                            ? "border-[#0066cc] bg-[#f0f9ff]"
                            : "border-gray-200 hover:border-[#0066cc]/50",
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
                          className="flex cursor-pointer items-center justify-between p-4"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "flex h-4 w-4 items-center justify-center rounded-full border-2 transition-colors",
                                selectedTime === timeSlot.start_time
                                  ? "border-[#0066cc] bg-[#0066cc]"
                                  : "border-gray-300 group-hover:border-[#0066cc]/60"
                              )}
                            >
                              {selectedTime === timeSlot.start_time && (
                                <div className="h-1.5 w-1.5 rounded-full bg-white" />
                              )}
                            </div>
                            <p className="text-base font-semibold text-[#1a1a1a]">
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
                                ? "bg-[#dcfce7] text-[#166534] border border-[#166534]/20"
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
                <div className="flex flex-col items-center justify-center rounded-lg  p-6 text-center">
                  <Clock className="h-5 w-5 text-gray-400 mb-3" />
                  <h3 className="text-sm font-medium text-[#1a1a1a] mb-1">
                    No available times
                  </h3>
                  <p className="text-xs text-[#666666]">
                    Please select another date
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {selectedTime && (
          <Card className="rounded-xl border bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-strong">
                {customSlotTypes ? "Select Slots" : "Number of participants"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customSlotTypes ? (
                  <div className="space-y-4">
                    {customSlotTypes.map((type) => (
                      <div
                        key={type.name}
                        className="rounded-lg border border-gray-200 bg-white p-4 transition-all duration-200 hover:border-[#0066cc]/50"
                      >
                        <div className="mb-3">
                          <h4 className="text-base font-semibold text-[#1a1a1a] capitalize">
                            {type.name}
                          </h4>
                          <p className="text-sm text-[#666666]">
                            ${type.price} per person
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleSlotTypeCountChange(
                                type.name,
                                (slotTypeCounts[type.name] || 0) - 1
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 bg-white text-base font-semibold text-[#1a1a1a] transition-colors hover:bg-[#f0f9ff] disabled:opacity-50 disabled:cursor-not-allowed"
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
                              className="h-8 text-center text-base  border-gray-300"
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
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 bg-white text-base font-semibold text-[#1a1a1a] transition-colors hover:bg-[#f0f9ff] disabled:opacity-50 disabled:cursor-not-allowed"
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
                        {/* <div className="mt-2 flex items-center justify-between rounded-md bg-[#f0f9ff] p-2">
                          <p className="text-sm  text-[#666666] capitalize">
                            Total for {type.name}
                          </p>
                          <p className="text-sm font-semibold text-[#0066cc]">
                            ${(slotTypeCounts[type.name] || 0) * type.price}
                          </p>
                        </div> */}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (numberOfPeople > 1) {
                          setNumberOfPeople(numberOfPeople - 1);
                        }
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 bg-white text-base font-semibold text-[#1a1a1a] transition-colors hover:bg-[#f0f9ff] disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className="h-8 text-center text-base border-gray-300"
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
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 bg-white text-base font-semibold text-[#1a1a1a] transition-colors hover:bg-[#f0f9ff] disabled:opacity-50 disabled:cursor-not-allowed"
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
                <p className="text-sm text-[#666666] text-center">
                  {selectedTimeSlot
                    ? `${selectedTimeSlot.remainingSlots} slots available for this time`
                    : `Maximum ${selectedTour.group_size_limit} people per booking`}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="rounded-xl border bg-white shadow-sm">
          <CardContent className="pt-4">
            <button
              type="button"
              className={cn(
                "w-full rounded-lg px-6 py-3 text-base font-semibold text-white focus:ring-2 focus:ring-[#0066cc] focus:ring-offset-2 focus:outline-none transition-all duration-300",
                !selectedTime || !numberOfPeople
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#0066cc] hover:bg-[#0052a3]"
              )}
              disabled={!selectedTime || !numberOfPeople}
              onClick={handleClickBooking}
            >
              Continue to Booking
            </button>
            {(!selectedTime || !numberOfPeople) && (
              <p className="mt-2 text-sm text-[#666666] text-center">
                {!selectedTime
                  ? "Please select a date and time to continue"
                  : "Please select the number of people to continue"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Left side - Tour Details */}
      <div className="md:col-span-2 space-y-2 sm:space-y-4 lg:space-y-8 order-last md:order-first">
        {/* Tour Details Card */}
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          {/* Hero Image Section */}
          <div className="relative">
            <div className="aspect-[16/9] w-full overflow-hidden">
              <Image
                src={tourImages[selectedImage].url}
                alt={selectedTour.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>
            {tourImages.length > 1 && (
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex gap-2 overflow-x-auto">
                  {tourImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={cn(
                        "flex-shrink-0 relative aspect-[4/3] w-16 overflow-hidden rounded-lg border-2 transition-all",
                        selectedImage === index
                          ? "border-white shadow-lg"
                          : "border-white/60 hover:border-white/90"
                      )}
                    >
                      <Image
                        src={image.url}
                        alt={`${selectedTour.title} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-6 space-y-6">
            {/* Title & Price */}
            <div className="border-b border-gray-100 pb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedTour.title}
              </h1>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-700 font-medium">
                    {selectedTour.duration} Hours
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    $
                    {selectedTour.custom_slot_types &&
                    selectedTour.custom_slot_types !== "[]"
                      ? Math.min(
                          ...JSON.parse(selectedTour.custom_slot_types).map(
                            (type: any) => type.price
                          )
                        )
                      : selectedTour.rate}
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedTour.custom_slot_types &&
                    selectedTour.custom_slot_types !== "[]"
                      ? "starting from"
                      : "per person"}
                  </div>
                </div>
              </div>

              {/* Key Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Meeting Point */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <h3 className="text-sm font-semibold text-gray-900">
                      Meeting Point
                    </h3>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {selectedTour.meeting_point_address}
                  </p>
                </div>

                {/* Drop-off Point */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Navigation className="h-4 w-4 text-green-600" />
                    <h3 className="text-sm font-semibold text-gray-900">
                      Drop-off Point
                    </h3>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {selectedTour.dropoff_point_address}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                About this tour
              </h2>
              <p className="text-gray-700 leading-relaxed text-base">
                {selectedTour.description}
              </p>
            </div>

            {/* Languages */}
            <div className="mb-8  pb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Languages
              </h2>
              <div className="flex flex-wrap gap-2">
                {selectedTour.languages.map((language) => (
                  <span
                    key={language}
                    className="capitalize inline-flex items-center rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 border border-blue-200"
                  >
                    {language}
                  </span>
                ))}
              </div>
            </div>

            {/* Trip Highlights */}
            {selectedTour.trip_highlights &&
              selectedTour.trip_highlights.length > 0 && (
                <div className="mb-8  pb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Trip Highlights
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedTour.trip_highlights.map((highlight, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="mt-1.5 h-2 w-2 rounded-full bg-blue-600 flex-shrink-0" />
                        <span className="text-gray-700 text-sm leading-relaxed">
                          {highlight}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* What's Included */}
            {selectedTour.includes && selectedTour.includes.length > 0 && (
              <div className="mb-8  pb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  What's Included
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedTour.includes.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="mt-1.5 h-2 w-2 rounded-full bg-green-600 flex-shrink-0" />
                      <span className="text-gray-700 text-sm leading-relaxed">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <Accordion type="single" collapsible className="space-y-3">
                {selectedTour.faq.map((faq: string, index: number) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border border-gray-200 rounded-lg"
                  >
                    <AccordionTrigger className="text-sm font-medium text-gray-900 hover:no-underline px-4 py-3 hover:bg-gray-50">
                      {JSON.parse(faq).question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-gray-700 px-4 pb-3 leading-relaxed">
                      {JSON.parse(faq).answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourTimeAndDate;
