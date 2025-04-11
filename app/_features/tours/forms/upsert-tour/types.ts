import { Path } from "react-hook-form";
import { UpsertTourData } from "./schema";

export interface TourFormField {
  name: Path<UpsertTourData>;
  type: string;
  placeholder: string;
  label: string;
  colSpan?: "full" | "half";
}

export const tourFields: TourFormField[] = [
  {
    name: "title",
    type: "text",
    placeholder: "Enter tour title",
    label: "Tour Title",
    colSpan: "full",
  },
  {
    name: "description",
    type: "textarea",
    placeholder: "Enter tour description",
    label: "Description",
    colSpan: "full",
  },
  {
    name: "category",
    type: "text",
    placeholder: "Enter tour category",
    label: "Category",
    colSpan: "full",
  },
  {
    name: "price",
    type: "number",
    placeholder: "Enter tour price",
    label: "Price ($)",
    colSpan: "half",
  },
  {
    name: "duration",
    type: "number",
    placeholder: "Enter tour duration in hrs",
    label: "Duration (hrs)",
    colSpan: "half",
  },
  {
    name: "maxGroupSize",
    type: "number",
    placeholder: "Enter maximum group size",
    label: "Maximum Group Size",
    colSpan: "half",
  },
  {
    name: "slots",
    type: "number",
    placeholder: "Enter number of slots",
    label: "Available Slots",
    colSpan: "half",
  },
  {
    name: "weightLimit",
    type: "number",
    placeholder: "Enter weight limit in kg",
    label: "Weight Limit (kg)",
    colSpan: "half",
  },
  {
    name: "difficulty",
    type: "select",
    placeholder: "Select difficulty level",
    label: "Difficulty Level",
    colSpan: "half",
  },
  {
    name: "location",
    type: "text",
    placeholder: "Enter tour location",
    label: "Location",
    colSpan: "full",
  },
  {
    name: "includes",
    type: "array",
    placeholder: "Enter inclusions (one per line)",
    label: "Inclusions",
    colSpan: "full",
  },
  {
    name: "bookingLink",
    type: "text",
    placeholder: "Enter booking link URL",
    label: "Booking Link",
    colSpan: "full",
  },
];
