"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Clock, Calendar, Users, Check, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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
import { Switch } from "@/components/ui/switch";
import { TimePicker } from "@/components/ui/time-picker";

import { Tour } from "@/app/_features/tours/tour-types";
import { getTourSchedule } from "@/app/_features/tours/api/tour-schedule/client/getTourSchedule";
import { saveTourSchedule } from "@/app/_features/tours/api/tour-schedule/client/saveTourSchedule";

import {
  WeekdaySchedule,
  Weekday,
} from "@/app/_features/booking/types/tour-schedule-types";

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  duration: string;
}

interface DaySchedule {
  id: string;
  day: Weekday;
  available_time: TimeSlot[];
  enabled: boolean;
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

export function TourScheduleV2({ selectedTour }: { selectedTour?: Tour }) {
  const featuredImage = JSON.parse(selectedTour?.images || "[]");
  const isFeaturedImage = featuredImage.find(
    (image: any) => image.isFeature
  )?.url;

  const [schedules, setSchedules] = useState<DaySchedule[]>(
    DAYS_OF_WEEK.map((day) => ({
      id: crypto.randomUUID(),
      day,
      available_time: [],
      enabled: false,
    }))
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState<string | null>(null);

  useEffect(() => {
    const loadDefaultSchedule = async () => {
      if (selectedTour?.id) {
        const defaultSchedules = await getTourSchedule(selectedTour.id);

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
                  duration: "",
                })),
                enabled: !!daySchedule,
              };
            })
          );
        }
      }
    };

    loadDefaultSchedule();
  }, [selectedTour?.id]);

  const toggleDay = (dayId: string) => {
    setSchedules(
      schedules.map((schedule) => {
        if (schedule.id === dayId) {
          return {
            ...schedule,
            enabled: !schedule.enabled,
          };
        }
        return schedule;
      })
    );
  };

  const hasTimeConflict = (
    dayId: string,
    timeSlotId: string,
    newTime: string
  ): boolean => {
    const schedule = schedules.find((s) => s.id === dayId);
    if (!schedule) return false;

    return schedule.available_time.some(
      (slot) =>
        slot.id !== timeSlotId && // Don't compare with self
        slot.startTime === newTime
    );
  };

  const updateTimeSlot = (
    dayId: string,
    timeSlotId: string,
    field: keyof TimeSlot,
    value: string
  ) => {
    // Check for time conflicts if updating start time
    if (field === "startTime" && hasTimeConflict(dayId, timeSlotId, value)) {
      toast.error("This time slot conflicts with another slot on the same day");
      return;
    }

    setSchedules(
      schedules.map((schedule) => {
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
      })
    );
  };

  const addTimeSlot = (dayId: string) => {
    const schedule = schedules.find((s) => s.id === dayId);
    if (!schedule) return;

    // Check if there are any empty time slots
    const hasEmptySlot = schedule.available_time.some(
      (slot) => !slot.startTime
    );

    if (hasEmptySlot) {
      toast.error("Please fill in the existing time slot first");
      return;
    }

    setSchedules(
      schedules.map((schedule) => {
        if (schedule.id === dayId) {
          return {
            ...schedule,
            available_time: [
              ...schedule.available_time,
              {
                id: crypto.randomUUID(),
                startTime: "09:00", // Default to 9:00 AM
                endTime: "",
                duration: "",
              },
            ],
          };
        }
        return schedule;
      })
    );
  };

  const removeTimeSlot = (dayId: string, timeSlotId: string) => {
    setSchedules(
      schedules.map((schedule) => {
        if (schedule.id === dayId) {
          return {
            ...schedule,
            available_time: schedule.available_time.filter(
              (slot) => slot.id !== timeSlotId
            ),
          };
        }
        return schedule;
      })
    );
  };

  const handleQuickTimeSelect = (dayId: string, time: string) => {
    const schedule = schedules.find((s) => s.id === dayId);
    if (!schedule) return;

    // Check if there are any empty time slots
    const hasEmptySlot = schedule.available_time.some(
      (slot) => !slot.startTime
    );

    if (hasEmptySlot) {
      toast.error("Please fill in the existing time slot first");
      return;
    }

    // Check for time conflicts
    if (hasTimeConflict(dayId, "", time)) {
      toast.error("This time slot conflicts with another slot on the same day");
      return;
    }

    setSchedules(
      schedules.map((schedule) => {
        if (schedule.id === dayId) {
          return {
            ...schedule,
            available_time: [
              ...schedule.available_time,
              {
                id: crypto.randomUUID(),
                startTime: time,
                endTime: "",
                duration: "",
              },
            ],
          };
        }
        return schedule;
      })
    );
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

  const handleSubmit = async () => {
    if (!selectedTour?.id) {
      toast.error("No tour selected");
      return;
    }

    // Filter only enabled schedules and their time slots
    const enabledSchedules: WeekdaySchedule[] = schedules
      .filter((schedule) => schedule.enabled)
      .map((schedule) => ({
        weekday: schedule.day,
        available_time: JSON.stringify(
          schedule.available_time.map((slot) => ({
            start_time: slot.startTime,
          }))
        ),
      }));

    if (enabledSchedules.length === 0) {
      toast.error("Please enable at least one day and add time slots");
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveTourSchedule(selectedTour.id, enabledSchedules);

      if (result.success) {
        toast.success("Schedule saved successfully");
      } else {
        toast.error(result.message || "Failed to save schedule");
      }
    } catch (error: any) {
      toast.error(
        error.message || "An error occurred while saving the schedule"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div
        key={selectedTour?.id}
        className="relative h-[400px] rounded-lg overflow-hidden group hover:shadow-lg transition-shadow"
        style={{
          backgroundImage: `url(${
            isFeaturedImage ||
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1473&q=80"
          })`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white line-clamp-1">
              {selectedTour?.title}
            </h3>
            <p className="text-white/80 text-sm line-clamp-2">
              {selectedTour?.description}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {schedules.map((schedule, index) => (
          <div
            key={schedule.id}
            className={cn(
              "flex items-start gap-4 p-4 rounded-lg border transition-all duration-200",
              !schedule.enabled && "opacity-50",
              schedule.enabled && "hover:border-primary/50"
            )}
          >
            <div className="flex items-center gap-4 min-w-[200px]">
              <Switch
                checked={schedule.enabled}
                onCheckedChange={() => toggleDay(schedule.id)}
                className="data-[state=checked]:bg-primary"
              />
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{schedule.day}</span>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm text-muted-foreground">
                    Time Slots
                  </Label>
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-2"
                        disabled={!schedule.enabled}
                      >
                        <Plus className="h-4 w-4" />
                        Quick Add
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Quick Add Time Slot</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        {COMMON_TIME_SLOTS.map((slot) => (
                          <Button
                            key={slot.value}
                            variant="outline"
                            className="justify-start"
                            onClick={() => {
                              handleQuickTimeSelect(schedule.id, slot.value);
                              setIsTimePickerOpen(null);
                            }}
                          >
                            {slot.label}
                          </Button>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addTimeSlot(schedule.id)}
                    className="h-8 gap-2"
                    disabled={!schedule.enabled}
                  >
                    <Plus className="h-4 w-4" />
                    Custom Time
                  </Button>
                </div>
              </div>

              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {schedule.available_time.map((timeSlot, index) => (
                    <div
                      key={timeSlot.id}
                      className={cn(
                        "p-4 rounded-lg border transition-all duration-200",
                        "hover:border-primary/50 hover:shadow-sm",
                        "bg-card"
                      )}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-medium text-sm">
                            Slot {index + 1}
                          </h3>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            removeTimeSlot(schedule.id, timeSlot.id)
                          }
                          className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                          disabled={!schedule.enabled}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <div className="grid gap-2">
                          <Label
                            htmlFor={`start-${timeSlot.id}`}
                            className="text-sm text-muted-foreground"
                          >
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
                            disabled={!schedule.enabled}
                          />
                          {timeSlot.startTime && (
                            <div className="flex items-center justify-center px-3 py-2 text-sm text-muted-foreground border rounded-md bg-muted/50">
                              {formatTime(timeSlot.startTime)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {schedule.available_time.length === 0 && (
                  <div className="text-center py-8 text-sm text-muted-foreground border rounded-lg bg-muted/50">
                    <Clock className="h-5 w-5 mx-auto mb-2 text-muted-foreground/50" />
                    <p>No time slots added yet.</p>
                    <p className="text-xs mt-1">
                      Click "Quick Add" or "Custom Time" to schedule a time.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSubmit} className="gap-2" disabled={isSaving}>
          <Calendar className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save Schedule"}
        </Button>
      </div>
    </div>
  );
}
