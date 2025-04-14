import { CreateTourDTO, UpdateTourDTO, Tour } from "../types/TourTypes";

/**
 * Sanitizes string values by trimming and removing multiple spaces
 * @param value The string to sanitize
 */
const sanitizeString = (value: string): string => {
  return value.trim().replace(/\s+/g, " ");
};

/**
 * Sanitizes numeric values by ensuring they are positive numbers
 * @param value The number to sanitize
 * @param fallback Optional fallback value if invalid
 */
const sanitizeNumber = (value: number, fallback: number = 0): number => {
  const num = Number(value);
  return !isNaN(num) && num >= 0 ? num : fallback;
};

/**
 * Sanitizes array values by removing empty items and trimming strings
 * @param arr The array to sanitize
 */
const sanitizeArray = (arr: string[]): string[] => {
  return arr
    .map((item) => (typeof item === "string" ? sanitizeString(item) : item))
    .filter(Boolean);
};

/**
 * Sanitizes tour data for creation or update
 * @param data The tour data to sanitize
 */
export const sanitizeTourData = <T extends CreateTourDTO | UpdateTourDTO>(
  data: T
): T => {
  const sanitized = { ...data };

  // Sanitize string fields
  if ("title" in sanitized)
    sanitized.title = sanitizeString(sanitized.title as string);
  if ("description" in sanitized)
    sanitized.description = sanitizeString(sanitized.description as string);
  if ("category" in sanitized)
    sanitized.category = sanitizeString(sanitized.category as string);
  if ("meeting_point_address" in sanitized)
    sanitized.meeting_point_address = sanitizeString(
      sanitized.meeting_point_address as string
    );
  if ("dropoff_point_address" in sanitized)
    sanitized.dropoff_point_address = sanitizeString(
      sanitized.dropoff_point_address as string
    );
  if ("things_to_know" in sanitized)
    sanitized.things_to_know = sanitizeString(
      sanitized.things_to_know as string
    );

  // Sanitize numeric fields
  if ("duration" in sanitized)
    sanitized.duration = sanitizeNumber(sanitized.duration as number, 1);
  if ("group_size_limit" in sanitized)
    sanitized.group_size_limit = sanitizeNumber(
      sanitized.group_size_limit as number,
      1
    );
  if ("rate" in sanitized)
    sanitized.rate = sanitizeNumber(sanitized.rate as number, 0);
  if ("slots" in sanitized)
    sanitized.slots = sanitizeNumber(sanitized.slots as number, 0);

  // Sanitize array fields
  if ("includes" in sanitized)
    sanitized.includes = sanitizeArray(sanitized.includes as string[]);
  if ("faq" in sanitized)
    sanitized.faq = sanitizeArray(sanitized.faq as string[]);

  // Handle comma-separated string fields
  if ("languages" in sanitized) {
    const languagesArray = (sanitized.languages as string).split(",");
    sanitized.languages = sanitizeArray(languagesArray).join(",");
  }
  if ("trip_highlights" in sanitized) {
    const highlightsArray = (sanitized.trip_highlights as string).split(",");
    sanitized.trip_highlights = sanitizeArray(highlightsArray).join(",");
  }

  return sanitized;
};

/**
 * Validates tour data and throws error if invalid
 * @param data The tour data to validate
 */
export const validateTourData = (data: CreateTourDTO | UpdateTourDTO): void => {
  const requiredFields = [
    "title",
    "description",
    "category",
    "duration",
    "group_size_limit",
  ];
  const errors: string[] = [];

  requiredFields.forEach((field) => {
    if (!(field in data) || !data[field as keyof typeof data]) {
      errors.push(`${field} is required`);
    }
  });

  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(", ")}`);
  }
};
