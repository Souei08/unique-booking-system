"use client";

import { useState, useEffect } from "react";
import {
  saveRecurringSchedules,
  getRecurringSchedules,
} from "@/app/_api/actions/schedule/actions";

export type Weekday =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

interface WeekdaySchedule {
  weekday: Weekday;
  start_time: string;
}

interface SuccessResponse {
  success: boolean;
  message?: string;
}

const allWeekdays: Weekday[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const ScheduleForm: React.FC<{ tourId: string }> = ({ tourId }) => {
  const [schedules, setSchedules] = useState<WeekdaySchedule[]>([]);
  const [response, setResponse] = useState<SuccessResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSchedules = async () => {
      const existing = await getRecurringSchedules(tourId);
      setSchedules(
        existing.length
          ? existing
          : [{ weekday: "Monday", start_time: "09:00" }]
      );
    };
    fetchSchedules();
  }, [tourId]);

  const handleAddSchedule = () => {
    const usedDays = schedules.map((s) => s.weekday);
    const availableDay = allWeekdays.find((day) => !usedDays.includes(day));
    if (availableDay) {
      setSchedules([
        ...schedules,
        { weekday: availableDay, start_time: "09:00" },
      ]);
    }
  };

  const handleRemoveSchedule = (index: number) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  const handleScheduleChange = (
    index: number,
    field: keyof WeekdaySchedule,
    value: string
  ) => {
    const newSchedules = [...schedules];
    newSchedules[index] = {
      ...newSchedules[index],
      [field]: value,
    };
    setSchedules(newSchedules);
  };

  const isWeekdayUsed = (day: Weekday, currentIndex: number) => {
    return schedules.some(
      (schedule, index) => index !== currentIndex && schedule.weekday === day
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (schedules.length === 0) {
      setResponse({
        success: false,
        message: "Please add at least one schedule.",
      });
      return;
    }

    setIsSaving(true);
    const result = await saveRecurringSchedules(tourId, schedules);
    setResponse(result);
    setIsSaving(false);

    // Clear success message after 3 seconds
    if (result.success) {
      setTimeout(() => setResponse(null), 3000);
    }
  };

  return (
    <div>
      {response && (
        <div
          className={`mb-6 px-5 py-3 rounded-lg ${
            response.success
              ? "bg-green-200 text-green-800"
              : "bg-red-200 text-red-800"
          }`}
        >
          {response.message ||
            (response.success
              ? "Schedules updated successfully."
              : "Something went wrong.")}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          {schedules.map((schedule, index) => (
            <div key={index} className="flex gap-10 py-2">
              <select
                value={schedule.weekday}
                onChange={(e) =>
                  handleScheduleChange(
                    index,
                    "weekday",
                    e.target.value as Weekday
                  )
                }
                className="border border-gray-400 rounded-lg px-4 py-2 w-52 text-small"
              >
                {allWeekdays.map((day) => (
                  <option
                    key={day}
                    value={day}
                    disabled={isWeekdayUsed(day, index)}
                  >
                    {day}
                  </option>
                ))}
              </select>

              <input
                type="time"
                value={schedule.start_time}
                onChange={(e) =>
                  handleScheduleChange(index, "start_time", e.target.value)
                }
                className="border border-gray-400 rounded-lg px-4 py-2 text-small"
                required
              />

              <button
                type="button"
                onClick={() => handleRemoveSchedule(index)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-small hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mt-6">
          <button
            type="button"
            onClick={handleAddSchedule}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-small hover:bg-green-700"
            disabled={schedules.length >= 7}
          >
            Add Day
          </button>
          <button
            type="submit"
            className={`px-5 py-3 rounded-lg text-white text-small ${
              isSaving
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-700 hover:bg-blue-800"
            }`}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Update Schedules"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScheduleForm;
