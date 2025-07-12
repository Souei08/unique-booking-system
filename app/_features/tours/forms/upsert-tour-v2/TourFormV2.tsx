"use client";

import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { StepContainer, TOUR_STEPS } from "./steps";
import { toast } from "sonner";

// Combined schema for all steps
const tourFormSchema = z.object({
  // Basic Info
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description must be less than 2000 characters"),
  category: z.string().min(1, "Category is required"),

  // Tour Details
  slots: z
    .number()
    .nullable()
    .refine((val) => val !== null && val >= 1, {
      message: "Slots must be at least 1",
    }),
  duration: z
    .number()
    .nullable()
    .refine((val) => val !== null && val >= 1, {
      message: "Duration must be at least 1 hour",
    }),
  group_size_limit: z
    .number()
    .nullable()
    .refine((val) => val !== null && val >= 1, {
      message: "Group size must be at least 1",
    }),
  difficulty_level: z.string().optional(),
  minimum_age: z.number().nullable().optional(),

  // Pricing
  useCustomPricing: z.boolean().optional().default(false),
  rate: z.number().nullable().optional(),
  custom_slot_types: z
    .array(
      z.object({
        name: z.string().min(1, "Name is required"),
        price: z
          .number()
          .nullable()
          .refine((val) => val !== null && val >= 0, {
            message: "Price must be a positive number",
          }),
        description: z.string().optional(),
        customName: z.string().optional(),
      })
    )
    .optional()
    .default([]),
  custom_slot_fields: z
    .array(
      z.object({
        name: z.string().min(1, "Field name is required"),
        type: z.enum(["text", "number", "select", "checkbox"]),
        required: z.boolean(),
        options: z.array(z.string()).optional(),
        label: z.string().min(1, "Label is required"),
        placeholder: z.string().optional(),
      })
    )
    .optional()
    .default([]),

  // Location
  meeting_point_address: z.string().min(1, "Meeting point is required"),
  dropoff_point_address: z.string().min(1, "Dropoff point is required"),
  languages: z.array(z.string()).optional().default([]),
  trip_highlights: z.array(z.string()).optional().default([]),
  includes: z.array(z.string()).optional().default([]),

  // Media & Policies
  faq: z
    .array(
      z.object({
        question: z.string().min(1, "Question is required"),
        answer: z.string().min(1, "Answer is required"),
      })
    )
    .min(1, "At least one FAQ is required"),
  images: z.array(z.any()).optional().default([]),
  cancellation_policy: z.string().optional(),
  refund_policy: z.string().optional(),
  additional_notes: z.string().optional(),
  terms_conditions: z.string().optional(),
  safety_info: z.string().optional(),
});

type TourFormData = z.infer<typeof tourFormSchema>;

interface TourFormV2Props {
  initialData?: Partial<TourFormData>;
  onComplete?: (data: TourFormData) => void;
  onCancel?: () => void;
  className?: string;
}

const TourFormV2: React.FC<TourFormV2Props> = ({
  initialData,
  onComplete,
  onCancel,
  className,
}) => {
  const form = useForm<TourFormData>({
    resolver: zodResolver(tourFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      slots: null,
      duration: null,
      group_size_limit: null,
      difficulty_level: "",
      minimum_age: null,
      useCustomPricing: false,
      rate: null,
      custom_slot_types: [],
      custom_slot_fields: [],
      meeting_point_address: "",
      dropoff_point_address: "",
      languages: [],
      trip_highlights: [],
      includes: [],
      faq: [],
      images: [],
      cancellation_policy: "",
      refund_policy: "",
      additional_notes: "",
      terms_conditions: "",
      safety_info: "",
      ...initialData,
    },
  });

  const handleComplete = async (data: TourFormData) => {
    try {
      // Here you would typically save the tour data to your backend
      console.log("Tour data:", data);

      toast.success("Tour created successfully!");
      onComplete?.(data);
    } catch (error) {
      console.error("Error creating tour:", error);
      toast.error("Failed to create tour. Please try again.");
    }
  };

  const handleCancel = () => {
    toast.info("Tour creation cancelled");
    onCancel?.();
  };

  return (
    <div className={className}>
      <FormProvider {...form}>
        <StepContainer
          steps={TOUR_STEPS}
          form={form}
          onComplete={handleComplete}
          onCancel={handleCancel}
          className="h-screen"
        />
      </FormProvider>
    </div>
  );
};

export default TourFormV2;
