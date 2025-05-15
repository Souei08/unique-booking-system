import React from "react";

// Types
import { Tour } from "@/app/_features/tours/tour-types";

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

import { Badge } from "@/components/ui/badge";

import { Clock } from "lucide-react";

import Image from "next/image";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { getTourSchedule } from "@/app/_features/tours/api/tour-schedule/client/getTourSchedule";
import { RenderCalendar } from "@/app/_components/calendar-v2/RenderCalendar";

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

const TourTimeAndDate = ({
  selectedTour,
  handleNext,
  selectedDate,
  selectedTime,
  setSelectedDate,
  setSelectedTime,
  numberOfPeople,
  setNumberOfPeople,
}: {
  selectedTour: Tour;
  handleNext: () => void;
  selectedDate: DateValue;
  selectedTime: string;
  setSelectedDate: (date: DateValue) => void;
  setSelectedTime: (time: string) => void;
  numberOfPeople: number;
  setNumberOfPeople: (numberOfPeople: number) => void;
}) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(false);

  const [tourSchedules, setTourSchedules] = useState<TourSchedule[]>([]);
  const [availableWeekdays, setAvailableWeekdays] = useState<
    { day: string; isActive: boolean }[]
  >([]);

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
  const getAvailableTimesForDate = () => {
    if (!selectedDate) return [];
    const weekday = format(
      selectedDate.toDate(getLocalTimeZone()),
      "EEEE"
    ).toLowerCase();

    // Filter schedules and ensure we're comparing lowercase weekdays
    return tourSchedules.filter(
      (schedule) => schedule.weekday.toLowerCase() === weekday
    );
  };

  const availableTimes = getAvailableTimesForDate();

  const handleClickBooking = () => {
    handleNext();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left side - Tour Details */}
      <div className="md:col-span-2">
        {/* Tour Images */}
        <div className="mb-6">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
            <Image
              src={tourImages[selectedImage].url}
              alt={selectedTour.title}
              fill
              className="object-cover"
              priority
            />
          </div>
          {tourImages.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-2">
              {tourImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={cn(
                    "relative aspect-[16/9] overflow-hidden rounded-lg",
                    selectedImage === index && "ring-2 ring-primary"
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
          )}
        </div>

        <div className="lg:col-span-2  lg:pr-8">
          <h1 className="text-2xl font-bold tracking-tight text-strong sm:text-3xl">
            {selectedTour.title}
          </h1>
          <div className="mt-2 flex items-center">
            <span className="text-small text-strong">
              {selectedTour.category
                .replace(/_/g, " ")
                .replace(/\b\w/g, (char) => char.toUpperCase())}{" "}
              • {selectedTour.duration} Hours
            </span>
          </div>
        </div>

        {/* Options */}
        <div className="mt-4 lg:row-span-3 lg:mt-0">
          <h2 className="sr-only">Tour information</h2>
          <p
            className="text-h2
            font-bold tracking-tight text-strong"
          >
            ${selectedTour.rate}
          </p>

          <div className="mt-6">
            <div className="flex items-center">
              <span className="text-small text-strong">Group size:</span>
              <span className="ml-2 text-small font-medium text-strong">
                Max {selectedTour.group_size_limit} people
              </span>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center">
              <span className="text-small text-strong">Languages:</span>
              <div className="ml-2 flex flex-wrap gap-1">
                {selectedTour.languages.map((language) => (
                  <span
                    key={language}
                    className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800"
                  >
                    {language}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex flex-col">
              <span className="text-body font-medium text-strong mb-2">
                Meeting point:
              </span>
              <span className="text-small text-strong">
                {selectedTour.meeting_point_address}
              </span>
            </div>
          </div>

          <div className="mt-2">
            <div className="flex flex-col">
              <span className="text-body font-medium text-strong mb-2">
                Drop-off point:
              </span>
              <span className="text-small text-strong">
                {selectedTour.dropoff_point_address}
              </span>
            </div>
          </div>
        </div>

        <div className="py-10 lg:col-span-2 lg:col-start-1  lg:pt-6 lg:pr-8 lg:pb-16">
          {/* Description and details */}
          <div>
            <h3 className="text-body-lg font-bold text-strong">Description</h3>

            <div className="mt-4 space-y-6">
              <p className="text-base text-strong">
                {selectedTour.description}
              </p>
            </div>
          </div>

          <div className="mt-10">
            <h3 className="text-body-lg font-bold text-strong">
              Trip Highlights
            </h3>

            <div className="mt-4">
              <ul role="list" className="list-disc space-y-2 pl-4 text-small">
                {selectedTour.trip_highlights.map((highlight) => (
                  <li key={highlight} className="text-weak">
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10">
            <h3 className="text-body-lg font-bold text-strong">
              What's Included
            </h3>

            <div className="mt-4">
              <ul role="list" className="list-disc space-y-2 pl-4 text-small">
                {selectedTour.includes.map((item) => (
                  <li key={item} className="text-weak">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <section aria-labelledby="things-to-know-heading" className="mt-10">
            <h2
              id="things-to-know-heading"
              className="text-body-lg font-bold text-strong"
            >
              Things to Know
            </h2>

            <div className="mt-4 space-y-6">
              <p className="text-small text-weak">
                {selectedTour.things_to_know}
              </p>
            </div>
          </section>

          <section aria-labelledby="faq-heading" className="mt-10">
            <h2 id="faq-heading" className="text-body-lg font-bold text-strong">
              Frequently Asked Questions
            </h2>

            <div className="mt-4 space-y-6">
              <dl className="space-y-4">
                {typeof selectedTour.faq === "string"
                  ? JSON.parse(selectedTour.faq).map(
                      (question: string, index: number) => (
                        <div
                          key={index}
                          className="border-b border-gray-200 pb-4"
                        >
                          <dt className="text-body font-medium text-strong mb-2">
                            {JSON.parse(question).question}
                          </dt>
                          <dd className="mt-1 text-smallall text-weak">
                            {JSON.parse(question).answer}
                          </dd>
                        </div>
                      )
                    )
                  : selectedTour.faq.map((question: string, index: number) => (
                      <div
                        key={index}
                        className="border-b border-gray-200 pb-4"
                      >
                        <dt className="text-small font-medium text-strong">
                          {question}
                        </dt>
                      </div>
                    ))}
              </dl>
            </div>
          </section>
        </div>
      </div>

      {/* Right side - Calendar and Available Times */}
      <div className="space-y-6  md:top-6 md:self-start">
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-semibold">Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <RenderCalendar
                daysofWeek={
                  availableWeekdays.length > 0
                    ? availableWeekdays
                    : allWeekdays.map((day) => ({ day, isActive: true }))
                }
                setSelectedDate={setSelectedDate}
              />
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Available Times
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : availableTimes.length > 0 ? (
              <RadioGroup
                value={selectedTime}
                onValueChange={setSelectedTime}
                className="grid gap-3"
              >
                {availableTimes.map((schedule, scheduleIndex) => (
                  <React.Fragment key={scheduleIndex}>
                    {JSON.parse(schedule.available_time).map(
                      (time: { start_time: string }, timeIndex: number) => {
                        // Parse the time string and format it
                        const timeDate = new Date(
                          `${selectedDate.toString()}T${time.start_time}`
                        );
                        const formattedTime = format(timeDate, "h:mm a");

                        return (
                          <div
                            key={`${scheduleIndex}-${timeIndex}`}
                            className={cn(
                              "flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent cursor-pointer",
                              selectedTime === time.start_time &&
                                "border-primary bg-accent"
                            )}
                          >
                            <RadioGroupItem
                              value={time.start_time}
                              id={`time-${scheduleIndex}-${timeIndex}`}
                              className="border-primary"
                            />
                            <Label
                              htmlFor={`time-${scheduleIndex}-${timeIndex}`}
                              className="flex w-full cursor-pointer items-center justify-between"
                            >
                              <span className="font-medium">
                                {formattedTime}
                              </span>
                            </Label>
                          </div>
                        );
                      }
                    )}
                  </React.Fragment>
                ))}
              </RadioGroup>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No available times for this date
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Number of People
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Input
                type="number"
                min={1}
                max={selectedTour.group_size_limit}
                value={numberOfPeople}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value >= 1 && value <= selectedTour.group_size_limit) {
                    setNumberOfPeople(value);
                  }
                }}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Maximum {selectedTour.group_size_limit} people per booking
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardContent className="pt-6">
            <button
              type="button"
              className="w-full rounded-md bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!selectedTime || !numberOfPeople}
              onClick={handleClickBooking}
            >
              Continue to Booking
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TourTimeAndDate;
