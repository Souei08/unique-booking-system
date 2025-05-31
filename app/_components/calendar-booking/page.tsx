"use client";

import React, { useEffect, useState } from "react";
import { fetchCalendarSlotSummary } from "@/app/_features/calendar/api/fetchCalendarSlotSummary";
import { getAllBookings } from "@/app/_features/booking/api/getAllBookings";
import { BookingTable } from "@/app/_features/booking/types/booking-types";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { format } from "date-fns";
import { X, Plus, UserPlus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateBookingv2 from "@/app/_features/booking/components/CreateBookingv2/CreateBookingv2";
import AdminCreateBooking from "@/app/_features/booking/components/AdminCreateBooking/AdminCreateBooking";
import { getAllTours } from "@/app/_features/tours/api/getAllTours";
import { Tour } from "@/app/_features/tours/tour-types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface Slot {
  tour_type: string;
  date: string;
  slot_time?: string;
  booked: number | string;
  available: number;
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
  const [slots, setSlots] = useState<Slot[]>([]);
  const [monthMatrix, setMonthMatrix] = useState<(string | null)[][]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [bookings, setBookings] = useState<BookingTable[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateBookingOpen, setIsCreateBookingOpen] = useState(false);
  const [isAdminBookingOpen, setIsAdminBookingOpen] = useState(false);
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [selectedTour, setSelectedTour] = useState<string>("All");
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);

  useEffect(() => {
    async function loadTours() {
      try {
        const data = await getAllTours();
        setTours(data);
      } catch (error) {
        console.error("Error loading tours:", error);
      }
    }
    loadTours();
  }, []);

  const tourOptions = [
    "All",
    ...Array.from(new Set(tours.map((tour) => tour.title))),
  ];

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data: Slot[] = await fetchCalendarSlotSummary({
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
    }
    load();
  }, [month, year, selectedTour, onlyAvailable]);

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

  const getDateBookings = (dateKey: string) => {
    return bookings.filter((booking) => {
      const bookingDate = new Date(booking.booking_date)
        .toISOString()
        .split("T")[0];
      return bookingDate === dateKey;
    });
  };

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

  const handleDateClick = (dateKey: string | null) => {
    if (dateKey) {
      setSelectedDate(dateKey);
      setIsDrawerOpen(true);
    }
  };

  const handleCreateBooking = () => {
    setIsCreateBookingOpen(true);
  };

  const handleCloseCreateBooking = () => {
    setIsCreateBookingOpen(false);
    // Refresh bookings after creating a new one
    loadBookings();
  };

  const handleAdminBooking = () => {
    setIsAdminBookingOpen(true);
  };

  const handleCloseAdminBooking = () => {
    setIsAdminBookingOpen(false);
    loadBookings();
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

  return (
    <div className="w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      {/* Filters Section */}
      <div className="bg-background rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
          <div className="w-full sm:flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-strong mb-1">
              Month
            </label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevMonth}
                className="h-10 w-10 shrink-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-background text-sm focus:ring-2 focus:ring-brand focus:border-brand transition-all"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString("default", {
                      month: "long",
                    })}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextMonth}
                className="h-10 w-10 shrink-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="w-full sm:flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-strong mb-1">
              Year
            </label>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-background text-sm focus:ring-2 focus:ring-brand focus:border-brand transition-all"
            >
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-strong mb-1">
              Tour Type
            </label>
            <select
              value={selectedTour}
              onChange={(e) => setSelectedTour(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-background text-sm focus:ring-2 focus:ring-brand focus:border-brand transition-all"
            >
              {tourOptions.map((tour) => (
                <option key={tour} value={tour}>
                  {tour}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center mt-2 sm:mt-6">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={() => setOnlyAvailable(!onlyAvailable)}
                className="sr-only peer"
              />

              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
              <span className="ml-3 text-sm font-medium text-strong">
                Show only available
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-background rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6 overflow-x-auto">
        <div className="grid grid-cols-7 gap-2 sm:gap-3 md:gap-4 min-w-[600px]">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div
              key={d}
              className="text-center py-2 sm:py-3 font-semibold text-weak bg-fill rounded-lg text-xs sm:text-sm"
            >
              {d}
            </div>
          ))}

          {isLoading
            ? // Skeleton loading state
              Array.from({ length: 35 }).map((_, i) => (
                <div
                  key={i}
                  className="min-h-[100px] sm:min-h-[120px] md:min-h-[140px] p-2 sm:p-3 rounded-lg border border-gray-200 bg-background animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="space-y-2">
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))
            : monthMatrix.flat().map((dateKey, i) => (
                <div
                  key={i}
                  onClick={() => handleDateClick(dateKey)}
                  className={`min-h-[100px] sm:min-h-[120px] md:min-h-[140px] p-2 sm:p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-all bg-background cursor-pointer ${
                    dateKey
                      ? "hover:shadow-md"
                      : "opacity-0 pointer-events-none"
                  }`}
                >
                  {dateKey ? (
                    <>
                      <div
                        className={`font-semibold mb-1 sm:mb-2 text-xs sm:text-sm ${
                          isPastDate(dateKey) ? "text-gray-500" : "text-strong"
                        }`}
                      >
                        {new Date(dateKey).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                        {isPastDate(dateKey) && (
                          <span className="ml-1 text-[10px] font-normal text-gray-400">
                            (Past)
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 sm:space-y-2">
                        {getDaySlots(dateKey).length > 0 ? (
                          getDaySlots(dateKey).map((slot, idx) => (
                            <div
                              key={idx}
                              className={`p-1.5 sm:p-2 rounded-lg border transition-all ${
                                isFullyBooked(slot)
                                  ? "bg-red-50 border-red-200"
                                  : isPartiallyBooked(slot)
                                  ? "bg-amber-50 border-amber-200"
                                  : isPastDate(dateKey)
                                  ? "bg-gray-50 border-gray-200"
                                  : "bg-fill border-gray-200"
                              } hover:shadow-sm`}
                            >
                              {slot.slot_time && (
                                <div className="font-medium text-strong text-xs sm:text-sm mb-0.5 sm:mb-1 flex flex-col gap-1">
                                  <span className="truncate">
                                    {slot.slot_time}
                                  </span>
                                  <span className="text-[10px] sm:text-xs text-gray-600 truncate">
                                    {slot.tour_type}
                                  </span>
                                  <div className="flex flex-wrap gap-1">
                                    {isFullyBooked(slot) && (
                                      <span className="text-[10px] sm:text-xs font-medium text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                        Fully Booked
                                      </span>
                                    )}
                                    {isPartiallyBooked(slot) && (
                                      <span className="text-[10px] sm:text-xs font-medium text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                        Partially Booked
                                      </span>
                                    )}
                                    {isPastDate(dateKey) && (
                                      <span className="text-[10px] sm:text-xs font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                        Past Date
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                              <div className="flex flex-col justify-between text-[10px] sm:text-xs text-weak">
                                <span className="flex items-center">
                                  <span
                                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1 ${
                                      isFullyBooked(slot)
                                        ? "bg-red-500"
                                        : isPastDate(dateKey)
                                        ? "bg-gray-400"
                                        : "bg-emerald-500"
                                    }`}
                                  ></span>
                                  <span
                                    className={
                                      isFullyBooked(slot)
                                        ? "text-red-600 font-medium"
                                        : isPastDate(dateKey)
                                        ? "text-gray-500"
                                        : "text-emerald-600"
                                    }
                                  >
                                    Booked: {slot.booked}
                                  </span>
                                </span>
                                <span className="flex items-center">
                                  <span
                                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1 ${
                                      isFullyBooked(slot)
                                        ? "bg-red-300"
                                        : isPastDate(dateKey)
                                        ? "bg-gray-300"
                                        : "bg-blue-400"
                                    }`}
                                  ></span>
                                  <span
                                    className={
                                      isFullyBooked(slot)
                                        ? "text-red-500"
                                        : isPastDate(dateKey)
                                        ? "text-gray-500"
                                        : "text-blue-600"
                                    }
                                  >
                                    Available: {slot.available}
                                  </span>
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-[11px] sm:text-xs text-gray-400 italic">
                            No bookings
                          </div>
                        )}
                      </div>
                    </>
                  ) : null}
                </div>
              ))}
        </div>
      </div>

      {/* Booking Details Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="h-screen">
          <div className="flex flex-col h-full">
            <DrawerHeader className="border-b flex flex-row items-center justify-between p-4">
              <DrawerTitle>
                Bookings for{" "}
                {selectedDate && format(new Date(selectedDate), "MMMM d, yyyy")}
              </DrawerTitle>
              <DrawerClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DrawerClose>
            </DrawerHeader>
            <div className="flex-1 overflow-y-auto p-4">
              {/* {selectedDate && !isPastDate(selectedDate) && (
                <div className="flex gap-2 mb-4">
                  <Button
                    onClick={handleAdminBooking}
                    className="flex items-center gap-2"
                    variant="outline"
                  >
                    <UserPlus className="h-4 w-4" />
                    Admin Booking
                  </Button>
                  <Button
                    onClick={handleCreateBooking}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Booking
                  </Button>
                </div>
              )} */}
              <div className="space-y-4">
                {selectedDate && getDateBookings(selectedDate).length > 0 ? (
                  getDateBookings(selectedDate).map((booking) => (
                    <div
                      key={booking.booking_id}
                      className="p-4 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {booking.full_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {booking.tour_title}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              booking.booking_status === "confirmed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {booking.booking_status}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Time</p>
                          <p className="font-medium">{booking.selected_time}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Slots</p>
                          <p className="font-medium">{booking.slots} people</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total Price</p>
                          <p className="font-medium">${booking.total_price}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Payment Status</p>
                          <p className="font-medium">
                            {booking.payment_status}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                    <p>No bookings for this date</p>
                    <p className="text-sm mt-1">
                      {selectedDate && isPastDate(selectedDate)
                        ? "Cannot create bookings for past dates"
                        : "Select another date to view bookings"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Create Booking Modal */}
      {isCreateBookingOpen && (
        <Dialog
          open={isCreateBookingOpen}
          onOpenChange={setIsCreateBookingOpen}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Booking</DialogTitle>
              <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogClose>
            </DialogHeader>
            <CreateBookingv2
              onClose={handleCloseCreateBooking}
              customerSelectedTour={undefined}
              initialDate={selectedDate ? new Date(selectedDate) : undefined}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Admin Create Booking Modal */}
      {isAdminBookingOpen && (
        <Dialog open={isAdminBookingOpen} onOpenChange={setIsAdminBookingOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Admin Booking</DialogTitle>
              <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogClose>
            </DialogHeader>
            <AdminCreateBooking
              onClose={handleCloseAdminBooking}
              initialDate={selectedDate ? new Date(selectedDate) : undefined}
              tours={tours}
              onSuccess={loadBookings}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CalendarBookingPage;
