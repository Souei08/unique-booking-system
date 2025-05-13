import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts a date object or raw structured date into 'YYYY-MM-DD' format.
 *
 * @param dateInput - A Date object or an object with { year, month, day }.
 * @returns A formatted date string or null if invalid.
 */
export function formatToDateString(dateInput: any): string | null {
  if (!dateInput) return null;

  // Case 1: If it's a native Date object
  if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
    return dateInput.toISOString().split("T")[0]; // 'YYYY-MM-DD'
  }

  // Case 2: If it's a structured object (e.g., from a date picker)
  if (
    typeof dateInput === "object" &&
    dateInput.year &&
    dateInput.month &&
    dateInput.day
  ) {
    const { year, month, day } = dateInput;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
      2,
      "0"
    )}`;
  }

  // Case 3: If it's already a valid date string
  if (typeof dateInput === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    return dateInput;
  }

  console.warn("Invalid date input:", dateInput);
  return null;
}
