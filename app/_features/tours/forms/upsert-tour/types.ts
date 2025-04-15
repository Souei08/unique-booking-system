import { Path } from "react-hook-form";
import { UpsertTourData } from "./schema";

export interface SelectOption {
  value: string;
  label: string;
}

export interface TourFormField {
  name: Path<UpsertTourData>;
  type: string;
  placeholder: string;
  label: string;
  colSpan?: "full" | "half" | "one-third" | "two-thirds" | "equal";
  options?: SelectOption[];
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
    type: "select",
    placeholder: "Select tour category",
    label: "Category",
    colSpan: "full",
    options: [
      { value: "horseback_riding", label: "Horseback Riding" },
      { value: "jet_ski_tour", label: "Jet Ski Tour" },
      {
        value: "safari_tour_and_snorkeling",
        label: "Safari Tour and Snorkeling",
      },
    ],
  },
  {
    name: "slots",
    type: "number",
    placeholder: "Enter number of slots",
    label: "Available Slots",
    colSpan: "equal",
  },
  {
    name: "price",
    type: "number",
    placeholder: "Enter tour price",
    label: "Price ($)",
    colSpan: "equal",
  },
  {
    name: "duration",
    type: "number",
    placeholder: "Enter tour duration in hrs",
    label: "Duration (hrs)",
    colSpan: "equal",
  },
  {
    name: "maxGroupSize",
    type: "number",
    placeholder: "Enter maximum group size",
    label: "Maximum Group Size",
    colSpan: "equal",
  },
  {
    name: "languages",
    type: "array",
    placeholder: "Enter languages spoken",
    label: "Languages",
    colSpan: "full",
  },
  {
    name: "tripHighlights",
    type: "array",
    placeholder: "Enter trip highlights",
    label: "Trip Highlights",
    colSpan: "full",
  },
  {
    name: "faq",
    type: "faq",
    placeholder: "Enter FAQs with questions and answers",
    label: "FAQ's",
    colSpan: "full",
  },
  {
    name: "thingToKnow",
    type: "text",
    placeholder: "Enter things to know",
    label: "Things to Know",
    colSpan: "full",
  },
  {
    name: "meetingPointAddress",
    type: "textarea",
    placeholder: "Enter meeting point address",
    label: "Meeting Point Address",
    colSpan: "equal",
  },
  {
    name: "dropoffPointAddress",
    type: "textarea",
    placeholder: "Enter dropoff point address",
    label: "Dropoff Point Address",
    colSpan: "equal",
  },
  {
    name: "includes",
    type: "array",
    placeholder: "Enter inclusions (one per line)",
    label: "Inclusions",
    colSpan: "full",
  },
];
