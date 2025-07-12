"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { TimePicker } from "@/components/ui/time-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  X,
  Plus,
  Trash2,
  Users,
  Check,
  CalendarDays,
  Settings,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Weekday,
  WeekdaySchedule,
} from "@/app/_features/booking/types/tour-schedule-types";
import { getTourSchedule } from "@/app/_features/tours/api/tour-schedule/client/getTourSchedule";

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
}

interface DaySchedule {
  id: string;
  day: Weekday;
  available_time: TimeSlot[];
  enabled: boolean;
}

interface TourScheduleProps {
  form: UseFormReturn<any>;
  addItem: (field: any, value?: any) => void;
  removeItem: (field: any, index: number) => void;
  updateItem: (field: any, index: number, value: any) => void;
  title?: string;
  description?: string;
  onScheduleChange?: (scheduleData: any) => void;
  tourId?: string;
}

const DAYS_OF_WEEK: Weekday[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const COMMON_TIME_SLOTS = [
  { label: "Morning (9:00 AM)", value: "09:00" },
  { label: "Late Morning (11:00 AM)", value: "11:00" },
  { label: "Early Afternoon (1:00 PM)", value: "13:00" },
  { label: "Afternoon (3:00 PM)", value: "15:00" },
  { label: "Late Afternoon (5:00 PM)", value: "17:00" },
];

const TourSchedule: React.FC<TourScheduleProps> = ({
  form,
  addItem,
  removeItem,
  updateItem,
  title = "Tour Schedule",
  description = "Set up the availability schedule for your tour",
  onScheduleChange,
  tourId,
}) => {
  const [schedules, setSchedules] = useState<DaySchedule[]>(
    DAYS_OF_WEEK.map((day) => ({
      id: crypto.randomUUID(),
      day,
      available_time: [],
      enabled: false,
    }))
  );

  const [isTimePickerOpen, setIsTimePickerOpen] = useState<string | null>(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<string | null>(null);
  const isInitializing = useRef(true);
  const previousSchedules = useRef<DaySchedule[]>([]);

  // Initialize schedules from form data if available
  useEffect(() => {
    const loadSchedules = async () => {
      // First try to load from form data
      const formSchedules = form.getValues("weekly_schedules");
      if (formSchedules && Array.isArray(formSchedules)) {
        setSchedules(
          DAYS_OF_WEEK.map((day) => {
            const daySchedule = formSchedules.find((s: any) => s.day === day);
            return {
              id: crypto.randomUUID(),
              day,
              available_time: daySchedule?.available_time || [],
              enabled: !!daySchedule,
            };
          })
        );
        isInitializing.current = false;
        return;
      }

      // If no form data and we have a tourId, load from database
      if (tourId) {
        try {
          const defaultSchedules = await getTourSchedule(tourId);

          if (defaultSchedules.length > 0) {
            setSchedules(
              DAYS_OF_WEEK.map((day) => {
                const daySchedule = defaultSchedules.find(
                  (s) => s.weekday === day
                );
                const available_time = daySchedule?.available_time
                  ? JSON.parse(daySchedule.available_time)
                  : [];
                return {
                  id: crypto.randomUUID(),
                  day,
                  available_time: available_time.map((time: any) => ({
                    id: crypto.randomUUID(),
                    startTime: time.start_time,
                    endTime: "",
                    maxCapacity: time.max_capacity || 20,
                  })),
                  enabled: !!daySchedule,
                };
              })
            );
          }
        } catch (error) {
          console.error("Error loading tour schedule:", error);
        }
      }
      isInitializing.current = false;
    };

    loadSchedules();
  }, [form, tourId]);

  // Notify parent component when schedules change
  useEffect(() => {
    // Don't call onScheduleChange during initialization
    if (isInitializing.current || !onScheduleChange) {
      return;
    }

    // Check if schedules actually changed to prevent unnecessary calls
    const currentSchedulesString = JSON.stringify(schedules);
    const previousSchedulesString = JSON.stringify(previousSchedules.current);

    if (currentSchedulesString === previousSchedulesString) {
      return;
    }

    // Update the previous schedules ref
    previousSchedules.current = schedules;

    const enabledSchedules = schedules
      .filter((s) => s.enabled)
      .map((schedule) => ({
        weekday: schedule.day,
        available_time: JSON.stringify(
          schedule.available_time.map((slot) => ({
            start_time: slot.startTime,
            max_capacity: slot.maxCapacity,
          }))
        ),
      }));

    onScheduleChange(enabledSchedules);
  }, [schedules, onScheduleChange]);

  const toggleDay = (dayId: string) => {
    const updatedSchedules = schedules.map((schedule) => {
      if (schedule.id === dayId) {
        return {
          ...schedule,
          enabled: !schedule.enabled,
        };
      }
      return schedule;
    });
    setSchedules(updatedSchedules);

    // Update form data
    const enabledSchedules = updatedSchedules.filter((s) => s.enabled);
    form.setValue("weekly_schedules", enabledSchedules);
  };

  const hasTimeConflict = (
    dayId: string,
    timeSlotId: string,
    newTime: string
  ): boolean => {
    const schedule = schedules.find((s) => s.id === dayId);
    if (!schedule) return false;

    return schedule.available_time.some(
      (slot) => slot.id !== timeSlotId && slot.startTime === newTime
    );
  };

  const updateTimeSlot = (
    dayId: string,
    timeSlotId: string,
    field: keyof TimeSlot,
    value: string | number
  ) => {
    // Check for time conflicts if updating start time
    if (
      field === "startTime" &&
      typeof value === "string" &&
      hasTimeConflict(dayId, timeSlotId, value)
    ) {
      return;
    }

    const updatedSchedules = schedules.map((schedule) => {
      if (schedule.id === dayId) {
        return {
          ...schedule,
          available_time: schedule.available_time.map((slot) => {
            if (slot.id === timeSlotId) {
              return {
                ...slot,
                [field]: value,
              };
            }
            return slot;
          }),
        };
      }
      return schedule;
    });
    setSchedules(updatedSchedules);

    // Update form data
    const enabledSchedules = updatedSchedules.filter((s) => s.enabled);
    form.setValue("weekly_schedules", enabledSchedules);

    // Close edit modal if time is set
    if (field === "startTime" && value) {
      setIsEditModalOpen(null);
    }
  };

  const addTimeSlot = (dayId: string) => {
    const schedule = schedules.find((s) => s.id === dayId);
    if (!schedule) return;

    // Check if there are any empty time slots
    const hasEmptySlot = schedule.available_time.some(
      (slot) => !slot.startTime
    );

    if (hasEmptySlot) {
      return;
    }

    const updatedSchedules = schedules.map((schedule) => {
      if (schedule.id === dayId) {
        return {
          ...schedule,
          available_time: [
            ...schedule.available_time,
            {
              id: crypto.randomUUID(),
              startTime: "09:00",
              endTime: "",
              maxCapacity: 20,
            },
          ],
        };
      }
      return schedule;
    });
    setSchedules(updatedSchedules);

    // Update form data
    const enabledSchedules = updatedSchedules.filter((s) => s.enabled);
    form.setValue("weekly_schedules", enabledSchedules);
  };

  const removeTimeSlot = (dayId: string, timeSlotId: string) => {
    const updatedSchedules = schedules.map((schedule) => {
      if (schedule.id === dayId) {
        return {
          ...schedule,
          available_time: schedule.available_time.filter(
            (slot) => slot.id !== timeSlotId
          ),
        };
      }
      return schedule;
    });
    setSchedules(updatedSchedules);

    // Update form data
    const enabledSchedules = updatedSchedules.filter((s) => s.enabled);
    form.setValue("weekly_schedules", enabledSchedules);
  };

  const handleQuickTimeSelect = (dayId: string, time: string) => {
    const schedule = schedules.find((s) => s.id === dayId);
    if (!schedule) return;

    // Check if there are any empty time slots
    const hasEmptySlot = schedule.available_time.some(
      (slot) => !slot.startTime
    );

    if (hasEmptySlot) {
      return;
    }

    // Check for time conflicts
    if (hasTimeConflict(dayId, "", time)) {
      return;
    }

    const updatedSchedules = schedules.map((schedule) => {
      if (schedule.id === dayId) {
        return {
          ...schedule,
          available_time: [
            ...schedule.available_time,
            {
              id: crypto.randomUUID(),
              startTime: time,
              endTime: "",
              maxCapacity: 20,
            },
          ],
        };
      }
      return schedule;
    });
    setSchedules(updatedSchedules);

    // Update form data
    const enabledSchedules = updatedSchedules.filter((s) => s.enabled);
    form.setValue("weekly_schedules", enabledSchedules);

    // Close quick add modal
    setIsQuickAddOpen(null);
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    } as Intl.DateTimeFormatOptions);
  };

  return (
    <div className="space-y-8">
      {/* Weekly Schedule Section */}
      <Card className="border border-gray-200 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CalendarDays className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Weekly Schedule
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Set your tour availability for each day of the week
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">
                {schedules.filter((s) => s.enabled).length} of 7 days enabled
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Days Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className={cn(
                  "border rounded-xl transition-all duration-200 overflow-hidden",
                  !schedule.enabled && "bg-gray-50/50 border-gray-200",
                  schedule.enabled && "bg-white border-gray-200 shadow-sm"
                )}
              >
                {/* Day Header */}
                <div
                  className={cn(
                    "p-4 border-b transition-colors",
                    !schedule.enabled && "bg-gray-100 border-gray-200",
                    schedule.enabled &&
                      "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={schedule.enabled}
                        onCheckedChange={() => toggleDay(schedule.id)}
                        className="data-[state=checked]:bg-blue-600"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900 text-base">
                          {schedule.day}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full",
                              schedule.enabled ? "bg-green-500" : "bg-gray-300"
                            )}
                          />
                          <span className="text-xs text-gray-600">
                            {schedule.enabled ? "Available" : "Not available"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {schedule.enabled && (
                      <div className="text-right">
                        <div className="text-xs text-gray-500 mb-1">
                          {schedule.available_time.length} time slot
                          {schedule.available_time.length !== 1 ? "s" : ""}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Day Content */}
                {schedule.enabled && (
                  <div className="p-4 space-y-4">
                    {/* Time Slots */}
                    <div className="space-y-2">
                      {schedule.available_time.map((timeSlot, index) => (
                        <div
                          key={timeSlot.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-white hover:border-blue-300 transition-all duration-200"
                        >
                          {/* Time Display */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-medium text-gray-900">
                                    {timeSlot.startTime
                                      ? formatTime(timeSlot.startTime)
                                      : "Set time"}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {timeSlot.maxCapacity
                                      ? `${timeSlot.maxCapacity} people max`
                                      : "Set capacity"}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Edit Button */}
                          <Dialog
                            open={isEditModalOpen === timeSlot.id}
                            onOpenChange={(open) =>
                              setIsEditModalOpen(open ? timeSlot.id : null)
                            }
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Settings className="h-3.5 w-3.5" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle className="text-base">
                                  Edit Time Slot {index + 1}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div>
                                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Start Time
                                  </Label>
                                  <TimePicker
                                    value={timeSlot.startTime}
                                    onChange={(value) =>
                                      updateTimeSlot(
                                        schedule.id,
                                        timeSlot.id,
                                        "startTime",
                                        value
                                      )
                                    }
                                  />
                                  {timeSlot.startTime && (
                                    <div className="mt-2 px-3 py-2 text-sm text-gray-600 bg-gray-50 rounded border">
                                      {formatTime(timeSlot.startTime)}
                                    </div>
                                  )}
                                </div>

                                <div>
                                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Maximum Capacity
                                  </Label>
                                  <div className="relative">
                                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                      type="number"
                                      min="1"
                                      value={timeSlot.maxCapacity || ""}
                                      onChange={(e) =>
                                        updateTimeSlot(
                                          schedule.id,
                                          timeSlot.id,
                                          "maxCapacity",
                                          parseInt(e.target.value) || 0
                                        )
                                      }
                                      placeholder="e.g., 20"
                                      className="pl-10 h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                                    />
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          {/* Delete Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              removeTimeSlot(schedule.id, timeSlot.id)
                            }
                            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Add Time Slot Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Dialog
                        open={isQuickAddOpen === schedule.id}
                        onOpenChange={(open) =>
                          setIsQuickAddOpen(open ? schedule.id : null)
                        }
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1 text-xs"
                          >
                            <Plus className="h-3 w-3" />
                            Quick Add
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="text-base">
                              Quick Add Time Slot
                            </DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-2">
                            {COMMON_TIME_SLOTS.map((slot) => {
                              const isTimeUsed = schedule.available_time.some(
                                (timeSlot) => timeSlot.startTime === slot.value
                              );
                              return (
                                <Button
                                  key={slot.value}
                                  variant={isTimeUsed ? "ghost" : "outline"}
                                  size="sm"
                                  className={cn(
                                    "justify-start h-9",
                                    isTimeUsed &&
                                      "text-gray-400 cursor-not-allowed"
                                  )}
                                  onClick={() => {
                                    if (!isTimeUsed) {
                                      handleQuickTimeSelect(
                                        schedule.id,
                                        slot.value
                                      );
                                    }
                                  }}
                                  disabled={isTimeUsed}
                                >
                                  {slot.label}
                                  {isTimeUsed && (
                                    <Check className="h-3 w-3 ml-auto text-green-500" />
                                  )}
                                </Button>
                              );
                            })}
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addTimeSlot(schedule.id)}
                        className="h-8 gap-1 text-xs"
                      >
                        <Plus className="h-3 w-3" />
                        Custom Time
                      </Button>
                    </div>

                    {/* Empty State */}
                    {schedule.available_time.length === 0 && (
                      <div className="text-center py-6 text-sm text-gray-500 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/30">
                        <Clock className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                        <p className="font-medium text-xs">No time slots</p>
                        <p className="text-xs mt-1 text-gray-400">
                          Add your first time slot above
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Disabled State */}
                {!schedule.enabled && (
                  <div className="p-4 text-center">
                    <div className="text-gray-400 mb-2">
                      <Calendar className="h-8 w-8 mx-auto" />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">
                      Not Available
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Toggle the switch to enable this day
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Schedule Summary
              </span>
            </div>
            <div className="text-sm text-blue-800">
              <p>
                • {schedules.filter((s) => s.enabled).length} day
                {schedules.filter((s) => s.enabled).length !== 1
                  ? "s"
                  : ""}{" "}
                enabled
              </p>
              <p>
                •{" "}
                {schedules.reduce(
                  (total, s) => total + s.available_time.length,
                  0
                )}{" "}
                total time slot
                {schedules.reduce(
                  (total, s) => total + s.available_time.length,
                  0
                ) !== 1
                  ? "s"
                  : ""}
              </p>
              <p>
                • Average capacity:{" "}
                {(() => {
                  const enabledSchedules = schedules.filter((s) => s.enabled);
                  const totalCapacity = enabledSchedules.reduce(
                    (total, s) =>
                      total +
                      s.available_time.reduce(
                        (sum, slot) => sum + (slot.maxCapacity || 0),
                        0
                      ),
                    0
                  );
                  const totalSlots = enabledSchedules.reduce(
                    (total, s) => total + s.available_time.length,
                    0
                  );
                  return totalSlots > 0
                    ? Math.round(totalCapacity / totalSlots)
                    : 0;
                })()}{" "}
                people per slot
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TourSchedule;
