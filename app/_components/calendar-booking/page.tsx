"use client";

import React, { useEffect, useState } from "react";
import { fetchCalendarSlotSummary } from "@/app/_features/calendar/api/fetchCalendarSlotSummary";
import { getAllBookings } from "@/app/_features/booking/api/get-booking/getAllBookings";
import { getBookingsByTourAndDateTime } from "@/app/_features/booking/api/get-booking/getBookingsByTourAndDateTime";
import {
  BookingTable,
  BookingResponse,
} from "@/app/_features/booking/types/booking-types";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { format } from "date-fns";
import {
  X,
  Plus,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  RefreshCw,
  Filter,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAllTours } from "@/app/_features/tours/api/getAllTours";
import { Tour } from "@/app/_features/tours/tour-types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import QuickBooking from "@/app/_features/booking/components/QuickBooking/QuickBooking";
import { parseDate } from "@internationalized/date";
import { toast } from "sonner";
import { formatTime } from "@/app/_lib/utils/formatTime";
import UpdateBooking from "@/app/_features/booking/components/UpdateBooking/UpdateBooking";
import { CalendarSkeleton } from "./CalendarSkeleton";
import { CalendarCellCard } from "./CalendarCellCard";
import { CalendarFilters } from "./CalendarFilters";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { fetchCalendarSlotSummaryV2 } from "@/app/_features/calendar/api/fetchCalendarSlotSummaryV2";
import { StatusBadge } from "@/components/ui/status-badge";

interface Slot {
  tour_type: string;
  date: string;
  slot_time?: string;
  booked: number | string;
  available: number;
  added: number;
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function generateMonthMatrix(year: number, month: number): (string | null)[][] {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const totalDays = lastDay.getDate();

  const startDayIndex = firstDay.getDay();

  const matrix: (string | null)[][] = [];
  let week: (string | null)[] = new Array(7).fill(null);
  let currentDay = 1;

  // Fill the first week with nulls for days before the 1st of the month
  for (let i = 0; i < startDayIndex; i++) {
    week[i] = null;
  }

  // Fill the first week with actual dates
  for (let i = startDayIndex; i < 7 && currentDay <= totalDays; i++) {
    const date = new Date(year, month - 1, currentDay);
    week[i] = formatDateKey(date);
    currentDay++;
  }
  matrix.push(week);

  // Fill the remaining weeks
  while (currentDay <= totalDays) {
    week = new Array(7).fill(null);
    for (let i = 0; i < 7 && currentDay <= totalDays; i++) {
      const date = new Date(year, month - 1, currentDay);
      week[i] = formatDateKey(date);
      currentDay++;
    }
    matrix.push(week);
  }

  return matrix;
}

const CalendarBookingPage: React.FC = () => {
  const [bookings, setBookings] = useState<BookingTable[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [selectedSlotBookings, setSelectedSlotBookings] = useState<
    BookingResponse[]
  >([]);

  const [slots, setSlots] = useState<Slot[]>([]);
  const [monthMatrix, setMonthMatrix] = useState<(string | null)[][]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [selectedTour, setSelectedTour] = useState<string>("");
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);

  const [selectedTourForBooking, setSelectedTourForBooking] =
    useState<Tour | null>(null);
  const [selectedTimeForBooking, setSelectedTimeForBooking] =
    useState<string>("");

  const [isCreateBookingOpen, setIsCreateBookingOpen] = useState(false);

  const [isUpdateBookingDialogOpen, setIsUpdateBookingDialogOpen] =
    useState<boolean>(false);
  const [selectedBookingToUpdate, setSelectedBookingToUpdate] =
    useState<BookingResponse | null>(null);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  // Add a state to track if tours have been loaded
  const [toursLoaded, setToursLoaded] = useState(false);

  const fetchSlotBookings = async (
    tourTitle: string,
    date: string,
    time: string
  ) => {
    setIsLoadingBookings(true);
    try {
      const bookings = await getBookingsByTourAndDateTime({
        tourTitle,
        date,
        time,
      });
      setSelectedSlotBookings(bookings);
    } catch (error) {
      console.error("Error fetching slot bookings:", error);
      toast.error("Failed to fetch bookings for this slot");
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const fetchSlotSummary = async () => {
    setIsLoading(true);

    try {
      const data: Slot[] = await fetchCalendarSlotSummaryV2({
        month,
        year,
        tourTitle: selectedTour === "All" ? null : selectedTour,
        onlyAvailable,
      });
      setSlots(data);
    } catch (error) {
      console.error("Error loading calendar data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // First useEffect: Load tours and set default tour
  useEffect(() => {
    async function loadTours() {
      try {
        const data = await getAllTours();
        setTours(data);
        // Set the first tour as default if available
        if (data.length > 0) {
          setSelectedTour(data[0].title);
        }
        setToursLoaded(true);
      } catch (error) {
        console.error("Error loading tours:", error);
        setToursLoaded(true); // Set to true even on error to prevent infinite loading
      }
    }
    loadTours();
  }, []);

  const tourOptions = [
    "All",
    ...Array.from(new Set(tours.map((tour) => tour.title))),
  ];

  // Second useEffect: Load calendar data only after tours are loaded and selectedTour is set
  useEffect(() => {
    // Only fetch calendar data if tours are loaded and selectedTour is set
    if (!toursLoaded || !selectedTour) return;

    fetchSlotSummary();
  }, [month, year, selectedTour, onlyAvailable, toursLoaded]);

  useEffect(() => {
    const matrix = generateMonthMatrix(year, month);
    setMonthMatrix(matrix);
  }, [month, year]);

  useEffect(() => {
    async function loadBookings() {
      try {
        const data = await getAllBookings();
        setBookings(data);
      } catch (error) {
        console.error("Error loading bookings:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadBookings();
  }, []);

  const getDaySlots = (dateKey: string) => {
    return slots.filter((s) => {
      const normalized = new Date(s.date).toISOString().split("T")[0];
      return normalized === dateKey;
    });
  };

  // const getDateBookings = (dateKey: string) => {
  //   return bookings.filter((booking) => {
  //     const bookingDate = new Date(booking.booking_date);
  //     const selectedDate = new Date(dateKey);

  //     return (
  //       bookingDate.getFullYear() === selectedDate.getFullYear() &&
  //       bookingDate.getMonth() === selectedDate.getMonth() &&
  //       bookingDate.getDate() === selectedDate.getDate()
  //     );
  //   });
  // };

  const isFullyBooked = (slot: Slot) => {
    return typeof slot.booked === "number" && slot.available === 0;
  };

  const isPartiallyBooked = (slot: Slot) => {
    return (
      typeof slot.booked === "number" && slot.booked > 0 && slot.available > 0
    );
  };

  const isPastDate = (dateKey: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateKey);
    return date < today;
  };

  // const isDateFullyBooked = (dateKey: string): boolean => {
  //   const daySlots = getDaySlots(dateKey);
  //   if (daySlots.length === 0) return false;

  //   // Check if all slots for the selected tour type are fully booked
  //   const selectedTourSlots =
  //     selectedTour === "All"
  //       ? daySlots
  //       : daySlots.filter((slot) => slot.tour_type === selectedTour);

  //   if (selectedTourSlots.length === 0) return false;

  //   return selectedTourSlots.every(
  //     (slot) => typeof slot.booked === "number" && slot.available === 0
  //   );
  // };

  const handleDateCardClick = async (
    dateKey: string | null,
    time: string,
    tour: string
  ) => {
    if (dateKey) {
      setSelectedDate(dateKey);
      setSelectedTimeForBooking(time);

      const selectedTour = tours.find((t) => t.title === tour) || null;
      setSelectedTourForBooking(selectedTour);
      setIsDrawerOpen(true);

      // Fetch bookings for the selected slot
      if (selectedTour) {
        await fetchSlotBookings(tour, dateKey, time);
      }
    }
  };

  const handleCloseCreateBooking = async () => {
    setIsCreateBookingOpen(false);

    fetchSlotSummary();
    fetchSlotBookings(
      selectedTourForBooking?.title || "",
      selectedDate || "",
      selectedTimeForBooking || ""
    );
    // Only refresh bookings and calendar data after creating a new one
    // await Promise.all([loadBookings(), loadCalendarData()]);

    // // Refresh selected slot bookings if we have the necessary data
    // if (selectedTourForBooking && selectedDate && selectedTimeForBooking) {
    //   await fetchSlotBookings(
    //     selectedTourForBooking.title,
    //     selectedDate,
    //     selectedTimeForBooking
    //   );
    // }
  };

  // const loadCalendarData = async () => {
  //   setIsLoading(true);
  //   try {
  //     const data: Slot[] = await fetchCalendarSlotSummary({
  //       month,
  //       year,
  //       tourTitle: selectedTour === "All" ? null : selectedTour,
  //       onlyAvailable,
  //     });
  //     setSlots(data);
  //   } catch (error) {
  //     console.error("Error loading calendar data:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([loadBookings(), fetchSlotSummary()]);
      toast.success("Calendar refreshed successfully");
    } catch (error) {
      console.error("Error refreshing calendar:", error);
      toast.error("Failed to refresh calendar");
    } finally {
      setIsRefreshing(false);
    }
  };

  const loadBookings = async () => {
    try {
      const data = await getAllBookings();
      setBookings(data);
    } catch (error) {
      console.error("Error loading bookings:", error);
    }
  };

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const toggleDateExpansion = (dateKey: string) => {
    setExpandedDates((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dateKey)) {
        newSet.delete(dateKey);
      } else {
        newSet.add(dateKey);
      }
      return newSet;
    });
  };

  // New: handle filter changes from popover
  const handleFiltersChange = (filters: {
    month: number;
    year: number;
    selectedTour: string;
    onlyAvailable: boolean;
  }) => {
    setMonth(filters.month);
    setYear(filters.year);
    setSelectedTour(filters.selectedTour);
    setOnlyAvailable(filters.onlyAvailable);
  };

  return (
    <div className="w-full mx-auto mt-15">
      {/* Calendar Header (now in CalendarFilters) */}
      <CalendarFilters
        month={month}
        year={year}
        selectedTour={selectedTour}
        onlyAvailable={onlyAvailable}
        isLoading={isLoading}
        tourOptions={tourOptions}
        tours={tours}
        onFiltersChange={handleFiltersChange}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />

      {/* Calendar Grid */}
      <div className="border border-stroke-strong rounded-lg bg-background overflow-x-auto">
        <div className="grid grid-cols-7 gap-px">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div
              key={d}
              className="text-center py-3 font-semibold text-base text-weak bg-fill"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-stroke-weak">
          {isLoading ? (
            <CalendarSkeleton />
          ) : (
            monthMatrix.map((week, weekIdx) =>
              week.map((dateKey, i) => (
                <div
                  key={weekIdx + "-" + i}
                  className="bg-background min-h-[160px] h-full w-full"
                >
                  {dateKey ? (
                    <CalendarCellCard
                      dateKey={dateKey}
                      isPastDate={isPastDate}
                      getDaySlots={getDaySlots}
                      expandedDates={expandedDates}
                      toggleDateExpansion={toggleDateExpansion}
                      handleDateCardClick={handleDateCardClick}
                      formatTime={formatTime}
                      isFullyBooked={isFullyBooked}
                      isPartiallyBooked={isPartiallyBooked}
                    />
                  ) : null}
                </div>
              ))
            )
          )}
        </div>
      </div>

      {/* Booking Details Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="h-screen max-w-[85vw] sm:max-w-[55vw] md:max-w-[45vw] lg:max-w-[40vw] xl:max-w-[35vw]">
          <div className="flex flex-col h-full">
            <DrawerHeader className="border-b border-stroke-strong flex flex-row items-center justify-between pb-3">
              <div className="space-y-1">
                <DrawerTitle className="text-lg sm:text-xl font-semibold text-strong">
                  Booking Details
                </DrawerTitle>
                {selectedTourForBooking && (
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-weak font-medium">
                      {selectedTourForBooking.title}
                    </p>
                  </div>
                )}
              </div>
              <DrawerClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-fill data-[state=open]:text-weak">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DrawerClose>
            </DrawerHeader>
            <div className="flex-1 overflow-y-auto p-4">
              {/* Tour Details Section */}
              {selectedTourForBooking && (
                <div className="mb-4 bg-background rounded-lg border border-stroke-weak overflow-hidden">
                  {/* Full width image at the top */}
                  <div className="w-full h-32 relative">
                    <img
                      src={
                        JSON.parse(selectedTourForBooking.images).find(
                          (image: any) => image.isFeature
                        ).url
                      }
                      alt={selectedTourForBooking.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content below the image */}
                  <div className="p-3">
                    <h3 className="text-base font-semibold mb-2 text-strong">
                      {selectedTourForBooking.title}
                    </h3>
                    <div className="space-y-1 text-xs text-weak mb-3">
                      <p className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {selectedDate &&
                          format(new Date(selectedDate), "MMM d, yyyy")}
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {formatTime(selectedTimeForBooking)}
                      </p>
                    </div>

                    {/* Slot summary moved to bookings section */}
                  </div>
                </div>
              )}

              {/* Bookings Section */}
              {selectedDate && (
                <div>
                  {/* Slot Summary (moved here) */}
                  {(() => {
                    const currentSlot = slots.find(
                      (slot) =>
                        slot.date === selectedDate &&
                        slot.slot_time === selectedTimeForBooking &&
                        slot.tour_type === selectedTourForBooking?.title
                    );

                    const totalBooked =
                      typeof currentSlot?.booked === "number"
                        ? currentSlot.booked + currentSlot.added
                        : 0;
                    const totalAvailable = currentSlot?.available || 0;
                    const totalCapacity = totalBooked + totalAvailable;

                    return (
                      <div className="grid grid-cols-2 gap-2 pt-2 pb-4 border-b border-stroke-weak mb-4">
                        <div className="text-center">
                          <div className="text-sm font-bold text-strong mb-1">
                            {totalAvailable}
                          </div>
                          <div className="text-xs text-weak uppercase tracking-wide">
                            Remaining Slots
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-bold text-strong mb-1">
                            {totalBooked}
                          </div>
                          <div className="text-xs text-weak uppercase tracking-wide">
                            Total Booked
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-semibold text-strong mb-1">
                        Current Bookings
                      </h3>
                      <p className="text-xs text-weak">
                        Manage bookings for this time slot
                      </p>
                    </div>
                    {/* <div className="text-right">
                      <div className="text-lg font-bold text-strong">
                        {(() => {
                          const currentSlot = slots.find(
                            (slot) =>
                              slot.date === selectedDate &&
                              slot.slot_time === selectedTimeForBooking &&
                              slot.tour_type === selectedTourForBooking?.title
                          );
                          return currentSlot?.available || 0;
                        })()}
                      </div>
                      <div className="text-xs text-weak uppercase tracking-wide">
                        {(() => {
                          const currentSlot = slots.find(
                            (slot) =>
                              slot.date === selectedDate &&
                              slot.slot_time === selectedTimeForBooking &&
                              slot.tour_type === selectedTourForBooking?.title
                          );
                          const totalAvailable = currentSlot?.available || 0;
                          return totalAvailable === 1 ? "Booking" : "Bookings";
                        })()}
                      </div>
                    </div> */}
                  </div>

                  <div className="space-y-3">
                    {isLoadingBookings ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-strong mb-1">
                              Loading bookings...
                            </p>
                            <p className="text-xs text-weak">
                              Please wait while we fetch the data
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : selectedSlotBookings.length > 0 ? (
                      selectedSlotBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="group bg-background rounded-lg border border-stroke-weak hover:border-stroke-strong hover:shadow-sm transition-all duration-200 cursor-pointer overflow-hidden p-4"
                          onClick={() => {
                            setSelectedBookingToUpdate(booking);
                            setIsUpdateBookingDialogOpen(true);
                          }}
                        >
                          {/* Top Row: Customer Name & Amount Due */}
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-base font-semibold text-strong truncate">
                              {booking.users.full_name || "Walk-Up Customer"}
                            </div>
                            {/* Amount Due Badge */}
                            <div>
                              <StatusBadge
                                status={
                                  booking.status as
                                    | "pending"
                                    | "paid"
                                    | "failed"
                                    | "refunding"
                                }
                                className="text-xs"
                                type="booking"
                              />
                            </div>
                          </div>

                          {/* Subtitle: Number of people */}
                          <div className="text-xs text-weak mb-2">
                            {booking.slots}{" "}
                            {booking.slots === 1 ? "Adult" : "Adults"}
                          </div>

                          {/* Booking Type & Date/Time Row */}
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm flex items-center gap-1">
                              {/* <span className="text-yellow-600">
                                <svg
                                  width="16"
                                  height="16"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 12H9v-2h2v2zm0-4H9V6h2v4z" />
                                </svg>
                              </span> */}
                              {booking.tours.title || "General Admission"}
                            </span>
                          </div>

                          {/* Status Badge + Date/Time */}
                          <div className="flex items-center gap-2 mb-1">
                            {/* Status Badge */}
                            {/* <StatusBadge
                              status={
                                booking.status as
                                  | "pending"
                                  | "paid"
                                  | "failed"
                                  | "refunding"
                              }
                              className="text-xs"
                              type="booking"
                            /> */}
                            <span className="text-xs text-strong">
                              {format(
                                new Date(booking.booking_date),
                                "EEEE, MMMM do yyyy @ h:mmaaa"
                              )}
                            </span>
                          </div>

                          {/* Meta Info */}
                          <div className="text-xs text-weak mt-2">
                            {format(
                              new Date(booking.created_at),
                              "M/d/yy @ h:mmaaa"
                            )}{" "}
                            by {booking.users.full_name || "System"}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-12 h-12 bg-fill rounded-full flex items-center justify-center mb-4">
                          <UserPlus className="h-6 w-6 text-weak" />
                        </div>
                        <h4 className="text-base font-semibold text-strong mb-2">
                          No bookings found
                        </h4>
                        <p className="text-xs text-weak max-w-sm leading-relaxed">
                          {selectedDate && isPastDate(selectedDate)
                            ? "This date has passed and cannot accept new bookings."
                            : "There are no bookings for this time slot yet. You can create the first booking using the button below."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Create Booking Button */}
              {selectedDate &&
                !isPastDate(selectedDate) &&
                slots.find(
                  (slot) =>
                    slot.date === selectedDate &&
                    slot.slot_time === selectedTimeForBooking &&
                    slot.tour_type === selectedTourForBooking?.title &&
                    slot.available > 0
                ) && (
                  <div className="mt-4">
                    <div
                      className="bg-background rounded-lg shadow-sm border border-stroke-strong p-3 hover:shadow-md transition-all cursor-pointer group"
                      onClick={() => setIsCreateBookingOpen(true)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-brand/10 p-2 rounded-lg group-hover:bg-brand/20 transition-colors">
                          <Plus className="h-4 w-4 text-brand" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm group-hover:text-brand transition-colors text-strong">
                            Create New Booking
                          </h3>
                          <p className="text-xs text-weak">
                            Click to create a new booking for this date and tour
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Create Booking Modal */}
      {isCreateBookingOpen &&
        selectedTourForBooking &&
        selectedDate &&
        selectedTimeForBooking && (
          <Dialog
            open={isCreateBookingOpen}
            onOpenChange={setIsCreateBookingOpen}
          >
            <DialogContent className="bg-neutral max-w-[98vw] sm:max-w-[95vw] md:max-w-[1200px] lg:max-w-[1200px] xl:max-w-[1200px] max-h-[95vh] overflow-y-auto p-0">
              <DialogHeader className="sr-only">
                <DialogTitle>Direct Booking</DialogTitle>
              </DialogHeader>
              <QuickBooking
                onClose={handleCloseCreateBooking}
                selectedTour={selectedTourForBooking}
                selectedDate={parseDate(selectedDate)}
                selectedTime={selectedTimeForBooking}
                onSuccess={() => {
                  // Refresh calendar data and selected slot bookings
                  fetchSlotSummary();
                  if (
                    selectedTourForBooking &&
                    selectedDate &&
                    selectedTimeForBooking
                  ) {
                    fetchSlotBookings(
                      selectedTourForBooking.title,
                      selectedDate,
                      selectedTimeForBooking
                    );
                  }
                }}
              />
            </DialogContent>
          </Dialog>
        )}

      <Dialog
        open={isUpdateBookingDialogOpen}
        onOpenChange={setIsUpdateBookingDialogOpen}
      >
        <DialogContent
          className="bg-neutral max-w-[98vw] sm:max-w-[95vw] md:max-w-[1200px] lg:max-w-[1200px] xl:max-w-[1200px] max-h-[95vh] overflow-y-auto p-6"
          showCloseButton={false}
          // disableCloseOnOutside={true}
          // showCloseConfirmation={true}
          // // onCloseConfirmCallback={() => {
          // //   setIsUpdateBookingDialogOpen(false);
          // //   setSelectedBookingToUpdate(null);
          // // }}
          // closeConfirmationTitle="Cancel Booking?"
          // closeConfirmationDescription="Are you sure you want to cancel this booking? All entered information will be lost."
          // closeConfirmationType="error"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Update Booking</DialogTitle>
          </DialogHeader>
          {selectedBookingToUpdate && (
            <UpdateBooking
              bookingId={selectedBookingToUpdate.id}
              manageToken={selectedBookingToUpdate.manage_token}
              onClose={() => {
                setIsUpdateBookingDialogOpen(false);
                setSelectedBookingToUpdate(null);
              }}
              onSuccess={() => {
                // Only refresh selected slot bookings
                if (
                  selectedTourForBooking &&
                  selectedDate &&
                  selectedTimeForBooking
                ) {
                  fetchSlotBookings(
                    selectedTourForBooking.title,
                    selectedDate,
                    selectedTimeForBooking
                  );
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarBookingPage;
