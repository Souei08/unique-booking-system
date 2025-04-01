import { useState } from "react";
import { generateTourSchedules } from "@/app/actions/schedule/actions";

type Weekday =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

interface WeekdaySchedule {
  day: Weekday;
  time: string;
}

interface SuccessResponse {
  success: boolean;
  message?: string;
}

const ScheduleForm: React.FC = () => {
  const [tourId, setTourId] = useState<string>("");
  const [schedules, setSchedules] = useState<WeekdaySchedule[]>([
    { day: "Monday", time: "09:00" },
  ]);
  const [response, setResponse] = useState<SuccessResponse | null>(null);

  const handleAddSchedule = () => {
    setSchedules([...schedules, { day: "Monday", time: "09:00" }]);
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

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const result = await generateTourSchedules(tourId, schedules);
    setResponse(result);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-1 font-medium">Tour ID</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={tourId}
            onChange={(e) => setTourId(e.target.value)}
            required
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="font-medium">Weekly Schedule</label>
            <button
              type="button"
              onClick={handleAddSchedule}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm"
            >
              Add Day
            </button>
          </div>

          {schedules.map((schedule, index) => (
            <div
              key={index}
              className="flex gap-4 items-center p-4 border rounded"
            >
              <select
                value={schedule.day}
                onChange={(e) =>
                  handleScheduleChange(index, "day", e.target.value as Weekday)
                }
                className="border rounded px-3 py-2"
              >
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>

              <input
                type="time"
                value={schedule.time}
                onChange={(e) =>
                  handleScheduleChange(index, "time", e.target.value)
                }
                className="border rounded px-3 py-2"
                required
              />

              <button
                type="button"
                onClick={() => handleRemoveSchedule(index)}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create Schedules
          </button>
        </div>
      </form>

      {response && (
        <div className="mt-6 p-4 border rounded">
          <h3 className="font-medium mb-2">Response:</h3>
          <pre className="bg-gray-50 p-2 rounded">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ScheduleForm;
