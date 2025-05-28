"use client";

import React, { useEffect, useState } from "react";
import { fetchCalendarSlotSummary } from "@/app/_features/calendar/api/fetchCalendarSlotSummary";

interface Slot {
  tour_type: string;
  date: string;
  slot_time?: string;
  booked: number | string;
  available: number;
}

function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0]; // yyyy-mm-dd
}

function generateMonthMatrix(year: number, month: number): (string | null)[][] {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const totalDays = lastDay.getDate();

  const startDayIndex = firstDay.getDay();

  const matrix: (string | null)[][] = [];
  let week: (string | null)[] = new Array(7).fill(null);
  let currentDay = 1;

  for (let i = startDayIndex; i < 7 && currentDay <= totalDays; i++) {
    const date = new Date(year, month - 1, currentDay);
    week[i] = formatDateKey(date);
    currentDay++;
  }
  matrix.push(week);

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

  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [selectedTour, setSelectedTour] = useState<string>("All");
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);

  useEffect(() => {
    async function load() {
      const data: Slot[] = await fetchCalendarSlotSummary({
        month,
        year,
        tourTitle: selectedTour === "All" ? null : selectedTour,
        onlyAvailable,
      });
      setSlots(data);
    }
    load();
  }, [month, year, selectedTour, onlyAvailable]);

  useEffect(() => {
    const matrix = generateMonthMatrix(year, month);
    setMonthMatrix(matrix);
  }, [month, year]);

  const getDaySlots = (dateKey: string) => {
    return slots.filter((s) => {
      const normalized = new Date(s.date).toISOString().split("T")[0];
      return normalized === dateKey;
    });
  };

  const tourOptions = Array.from(new Set(slots.map((s) => s.tour_type)));

  const isFullyBooked = (slot: Slot) => {
    return typeof slot.booked === "number" && slot.available === 0;
  };

  const isPartiallyBooked = (slot: Slot) => {
    return (
      typeof slot.booked === "number" && slot.booked > 0 && slot.available > 0
    );
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
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-background text-sm focus:ring-2 focus:ring-brand focus:border-brand transition-all"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>
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
              <option value="All">All Tours</option>
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

          {monthMatrix.flat().map((dateKey, i) => (
            <div
              key={i}
              className="min-h-[100px] sm:min-h-[120px] md:min-h-[140px] p-2 sm:p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-all bg-background"
            >
              {dateKey ? (
                <>
                  <div className="font-semibold text-strong mb-1 sm:mb-2 text-xs sm:text-sm">
                    {new Date(dateKey).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
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
                              : "bg-fill border-gray-200"
                          } hover:shadow-sm`}
                        >
                          {slot.slot_time && (
                            <div className="font-medium text-strong text-xs sm:text-sm mb-0.5 sm:mb-1 flex items-center justify-between">
                              <span>{slot.slot_time}</span>
                              {isFullyBooked(slot) && (
                                <span className="text-[10px] sm:text-xs font-medium text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full">
                                  Fully Booked
                                </span>
                              )}
                              {isPartiallyBooked(slot) && (
                                <span className="text-[10px] sm:text-xs font-medium text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">
                                  Partially Booked
                                </span>
                              )}
                            </div>
                          )}
                          <div className="flex flex-col justify-between text-[10px] sm:text-xs text-weak">
                            <span className="flex items-center">
                              <span
                                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1 ${
                                  isFullyBooked(slot)
                                    ? "bg-red-500"
                                    : "bg-brand"
                                }`}
                              ></span>
                              <span
                                className={
                                  isFullyBooked(slot)
                                    ? "text-red-600 font-medium"
                                    : ""
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
                                    : "bg-stroke-strong"
                                }`}
                              ></span>
                              <span
                                className={
                                  isFullyBooked(slot) ? "text-red-500" : ""
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
              ) : (
                <div className="text-gray-300">—</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarBookingPage;
