export type Weekday =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export interface WeekdaySchedule {
  weekday: Weekday;
  start_time: string;
}

export interface SuccessResponse {
  success: boolean;
  message?: string;
}

export const allWeekdays: Weekday[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
