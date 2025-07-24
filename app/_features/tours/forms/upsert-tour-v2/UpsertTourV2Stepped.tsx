"use client";

import React, { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Check,
  CheckCircle2,
  CircleCheck,
  Star,
  Shield,
  Award,
  FileText,
  DollarSign,
  MapPin,
  Settings,
  Image,
  HelpCircle,
  Info,
  Calendar,
  Loader2,
} from "lucide-react";

// Types
import {
  Tour,
  CreateTourDTO,
  TourLocalImage,
} from "@/app/_features/tours/tour-types";

// API
import { updateTourClient } from "../../api/client/updateTourClient";
import { createTourClient } from "../../api/client/createTourClient";
import { uploadImagesToSupabase } from "../../api/client/uploadTourImages";
import { deleteRemovedImages } from "../../api/client/deleteTourImages";
import { saveTourSchedule } from "../../api/tour-schedule/client/saveTourSchedule";
import { createClient } from "@/supabase/client";

// Step Components
import BasicInformation from "./upsert-tour-steps/BasicInformation";
import TourDetails from "./upsert-tour-steps/TourDetails";
import TourPricing from "./upsert-tour-steps/TourPricing";
import LocationInformation from "./upsert-tour-steps/LocationInformation";
import TourFeatures from "./upsert-tour-steps/TourFeatures";
import AdditionalInformation from "./upsert-tour-steps/AdditionalInformation";
import TourImages from "./upsert-tour-steps/TourImages";
import TourSchedule from "./upsert-tour-steps/TourSchedule";
import Logo from "@/app/_components/common/logo";
import StepCard from "@/components/ui/step-card";

// Helper function to safely get schema keys
const getSchemaKeys = (schema: z.ZodSchema): string[] => {
  if (
    "shape" in schema &&
    typeof schema.shape === "object" &&
    schema.shape !== null
  ) {
    return Object.keys(schema.shape as Record<string, unknown>);
  }
  if (
    "_def" in schema &&
    typeof schema._def === "object" &&
    schema._def !== null &&
    "shape" in schema._def &&
    typeof schema._def.shape === "object" &&
    schema._def.shape !== null
  ) {
    return Object.keys(schema._def.shape as Record<string, unknown>);
  }
  return [];
};

// Step-specific validation schemas
const step1Schema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description must be less than 2000 characters"),
  category: z.string().min(1, "Category is required"),
});

const step2Schema = z.object({
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
  waiver_link: z.string().min(1, "Waiver link is required"),
});

const step3Schema = z
  .object({
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
          min: z.number().optional(),
          max: z.number().optional(),
        })
      )
      .optional()
      .default([]),
  })
  .superRefine((data, ctx) => {
    // Validate based on whether custom pricing is being used
    const hasCustomPricing =
      data.custom_slot_types && data.custom_slot_types.length > 0;

    if (
      !hasCustomPricing &&
      (data.rate === null || data.rate === undefined || data.rate < 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Rate must be a positive number when using regular pricing",
        path: ["rate"],
      });
    }
  });

const step4Schema = z.object({
  meeting_point_address: z.string().min(1, "Meeting point is required"),
  dropoff_point_address: z.string().min(1, "Dropoff point is required"),
});

const step5Schema = z.object({
  languages: z.array(z.string()).optional().default([]),
  trip_highlights: z.array(z.string()).optional().default([]),
  includes: z.array(z.string()).optional().default([]),
});

const step6Schema = z.object({
  // things_to_know: z.string().min(1, "Things to know is required"),
  faq: z
    .array(
      z.object({
        question: z.string().min(1, "Question is required"),
        answer: z.string().min(1, "Answer is required"),
      })
    )
    .min(1, "At least one FAQ is required"),
});

const step7Schema = z.object({
  images: z.array(z.any()).min(1, "At least one image is required"),
});

const tourFormSchema = z
  .object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(100, "Title must be less than 100 characters"),
    description: z
      .string()
      .min(20, "Description must be at least 20 characters")
      .max(2000, "Description must be less than 2000 characters"),
    category: z.string().min(1, "Category is required"),
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
    waiver_link: z.string().min(1, "Waiver link is required"),

    rate: z.number().nullable().optional(),
    slots: z
      .number()
      .nullable()
      .refine((val) => val !== null && val >= 1, {
        message: "Slots must be at least 1",
      }),
    meeting_point_address: z.string().min(1, "Meeting point is required"),
    dropoff_point_address: z.string().min(1, "Dropoff point is required"),
    languages: z.array(z.string()).optional().default([]),
    trip_highlights: z.array(z.string()).optional().default([]),
    // things_to_know: z.string().min(1, "Things to know is required"),
    includes: z.array(z.string()).optional().default([]),
    faq: z
      .array(
        z.object({
          question: z.string().min(1, "Question is required"),
          answer: z.string().min(1, "Answer is required"),
        })
      )
      .min(1, "At least one FAQ is required"),
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
          min: z.number().optional(),
          max: z.number().optional(),
        })
      )
      .optional()
      .default([]),
    images: z.array(z.any()).min(1, "At least one image is required"),
  })
  .superRefine((data, ctx) => {
    // Validate based on whether custom pricing is being used
    const hasCustomPricing =
      data.custom_slot_types && data.custom_slot_types.length > 0;

    if (
      !hasCustomPricing &&
      (data.rate === null || data.rate === undefined || data.rate < 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Rate must be a positive number when using regular pricing",
        path: ["rate"],
      });
    }
  });

type TourFormValues = z.infer<typeof tourFormSchema>;

interface UpsertTourV2SteppedProps {
  initialData?: Tour;
  onSuccess?: () => void;
}

const STEPS = [
  {
    id: 1,
    title: "Basic Information",
    description: "Title, category & description",
    schema: step1Schema,
    icon: FileText,
  },
  {
    id: 2,
    title: "Tour Configuration",
    description: "Slots, duration & group size",
    schema: step2Schema,
    icon: Settings,
  },
  {
    id: 3,
    title: "Pricing & Details",
    description: "Custom types & pricing",
    schema: step3Schema,
    icon: DollarSign,
  },
  {
    id: 4,
    title: "Location & Features",
    description: "Meeting points & highlights",
    schema: z.object({
      ...step4Schema.shape,
      ...step5Schema.shape,
    }),
    icon: MapPin,
  },
  {
    id: 5,
    title: "Tour Schedule",
    description: "Weekly schedule & times",
    schema: z.object({}), // No validation needed for schedule step
    icon: Calendar,
  },
  {
    id: 6,
    title: "Additional Info",
    description: "FAQs, images & details",
    schema: z.object({
      ...step6Schema.shape,
      ...step7Schema.shape,
    }),
    icon: Settings,
  },
];

const SidebarStepper = ({
  steps,
  currentStep,
  completedSteps,
  isStepCompleted,
  onStepClick,
  isNavigating,
}: {
  steps: {
    id: number;
    title: string;
    description: string;
    icon: React.ElementType;
    schema: z.ZodSchema;
  }[];
  currentStep: number;
  completedSteps: Set<number>;
  isStepCompleted: (stepId: number) => boolean;
  onStepClick: (stepId: number) => void | Promise<void>;
  isNavigating: boolean;
}) => (
  <div className="h-full relative">
    {/* Progress bar */}
    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200">
      <div
        className="w-full bg-gradient-to-b from-blue-500 to-blue-600 transition-all duration-500 ease-out"
        style={{
          height: `${Math.max(0, Math.min(100, ((currentStep - 1) / (steps.length - 1)) * 100))}%`,
        }}
      />
    </div>

    <ol className="relative z-10 space-y-8">
      {steps.map((step, idx) => {
        const isActive = currentStep === step.id;
        const isCompleted =
          completedSteps.has(step.id) || isStepCompleted(step.id);
        const isClickable = step.id <= currentStep;
        const StepIcon = step.icon;

        return (
          <li
            key={step.id}
            className={`group relative flex items-start gap-4 ${
              isClickable && !isNavigating
                ? "cursor-pointer"
                : "cursor-not-allowed"
            }`}
            onClick={() => isClickable && !isNavigating && onStepClick(step.id)}
          >
            {/* Step indicator */}
            <div className="relative flex-shrink-0">
              <div
                className={`
                  w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ease-out
                  ${
                    isActive
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 border-blue-600 shadow-lg shadow-blue-500/25"
                      : isCompleted
                        ? "bg-gradient-to-br from-green-500 to-green-600 border-green-600 shadow-lg shadow-green-500/25"
                        : isClickable
                          ? "bg-white border-gray-300 group-hover:border-blue-400 group-hover:shadow-md"
                          : "bg-gray-100 border-gray-200"
                  }
                `}
              >
                {isCompleted && !isActive ? (
                  <Check className="h-5 w-5 text-white" />
                ) : (
                  <StepIcon
                    className={`h-5 w-5 ${
                      isActive
                        ? "text-white"
                        : isCompleted
                          ? "text-white"
                          : isClickable
                            ? "text-gray-600 group-hover:text-blue-600"
                            : "text-gray-400"
                    }`}
                  />
                )}
              </div>

              {/* Step number badge */}
              <div
                className={`
                absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center
                ${
                  isActive
                    ? "bg-white text-blue-600"
                    : isCompleted
                      ? "bg-white text-green-600"
                      : isClickable
                        ? "bg-gray-200 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                        : "bg-gray-100 text-gray-400"
                }
              `}
              >
                {step.id}
              </div>
            </div>

            {/* Step content */}
            <div className="flex-1 min-w-0 pt-1">
              <div
                className={`
                font-semibold text-base leading-tight mb-1 transition-colors
                ${
                  isActive
                    ? "text-blue-600"
                    : isCompleted
                      ? "text-green-600"
                      : isClickable
                        ? "text-gray-900 group-hover:text-blue-600"
                        : "text-gray-400"
                }
              `}
              >
                {step.title}
              </div>
              <div
                className={`
                text-sm leading-tight transition-colors
                ${
                  isActive
                    ? "text-blue-500"
                    : isCompleted
                      ? "text-green-500"
                      : isClickable
                        ? "text-gray-600 group-hover:text-blue-500"
                        : "text-gray-400"
                }
              `}
              >
                {step.description}
              </div>

              {/* Status indicator */}
              {isActive && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-blue-600">
                    Current Step
                  </span>
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  </div>
);

const UpsertTourV2Stepped = ({
  initialData,
  onSuccess,
}: UpsertTourV2SteppedProps) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isNavigating, setIsNavigating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentImages, setCurrentImages] = useState<TourLocalImage[]>(
    initialData?.images
      ? JSON.parse(initialData.images).map((img: any) => ({
          url: img.url,
          isFeature: img.isFeatured ?? false,
        }))
      : []
  );

  const [tourScheduleData, setTourScheduleData] = useState<any>(null);
  const [isScheduleValid, setIsScheduleValid] = useState(false);

  const originalImages = initialData?.images
    ? JSON.parse(initialData.images).map((img: any) => ({
        url: img.url,
        isFeature: img.isFeature ?? false,
      }))
    : [];

  const form = useForm<TourFormValues>({
    resolver: zodResolver(tourFormSchema),
    mode: "onChange",
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      category: initialData?.category || "",
      duration: initialData?.duration ?? 1,
      group_size_limit: initialData?.group_size_limit ?? 1,
      waiver_link: initialData?.waiver_link || "",

      rate: initialData?.rate || null,
      slots: initialData?.slots ?? 1,
      meeting_point_address: initialData?.meeting_point_address || "",
      dropoff_point_address: initialData?.dropoff_point_address || "",
      languages: Array.isArray(initialData?.languages)
        ? initialData.languages
        : [""],
      trip_highlights: Array.isArray(initialData?.trip_highlights)
        ? initialData.trip_highlights
        : [""],
      // things_to_know: initialData?.things_to_know || "",
      includes: Array.isArray(initialData?.includes)
        ? initialData.includes
        : [""],
      faq: initialData?.faq?.length
        ? initialData.faq.map((faq) => JSON.parse(faq))
        : [{ question: "", answer: "" }],
      custom_slot_types: initialData?.custom_slot_types
        ? JSON.parse(initialData.custom_slot_types)
        : [],
      custom_slot_fields: initialData?.custom_slot_fields
        ? JSON.parse(initialData.custom_slot_fields)
        : [],
      images: [],
    },
  });

  const handleImagesChange = (images: TourLocalImage[]) => {
    console.log("🖼️ Images changed:", {
      previousCount: currentImages.length,
      newCount: images.length,
      newImages: images,
    });
    setCurrentImages(images);
    // Update the form's images field for validation
    form.setValue("images", images);
  };

  const handleScheduleChange = useCallback((scheduleData: any) => {
    console.log("📅 Schedule data changed:", {
      previousData: tourScheduleData,
      newData: scheduleData,
      dataLength: scheduleData?.length || 0,
    });
    setTourScheduleData(scheduleData);
    // Update validation state based on schedule data
    if (scheduleData && scheduleData.length > 0) {
      const isValid = scheduleData.every((schedule: any) => {
        try {
          const timeSlots = JSON.parse(schedule.available_time);
          return Array.isArray(timeSlots) && timeSlots.length > 0;
        } catch {
          return false;
        }
      });
      console.log("📅 Schedule validation result:", isValid);
      setIsScheduleValid(isValid);
    } else {
      console.log("📅 No schedule data or empty array");
      setIsScheduleValid(false);
    }
  }, []);

  // Validate tour schedule step
  const validateTourSchedule = (): boolean => {
    // For existing tours, if no schedule data is provided, consider it valid
    // (the schedule might already exist in the database)
    if (initialData?.id && !tourScheduleData) {
      return true;
    }

    // For new tours or when schedule data is provided, validate it
    if (!tourScheduleData) return false;

    // Check if at least one day is enabled
    if (tourScheduleData.length === 0) return false;

    // Check if all enabled days have at least one time slot
    return tourScheduleData.every((schedule: any) => {
      try {
        const timeSlots = JSON.parse(schedule.available_time);
        return Array.isArray(timeSlots) && timeSlots.length > 0;
      } catch {
        return false;
      }
    });
  };

  // Validate current step
  const validateCurrentStep = async (): Promise<boolean> => {
    const currentStepData = STEPS[currentStep - 1];
    if (!currentStepData?.schema) return true;

    try {
      const formData = form.getValues();
      console.log(`🔍 Validating step ${currentStep}:`, {
        stepTitle: currentStepData.title,
        formData: formData,
        currentImages: currentImages,
        tourScheduleData: tourScheduleData,
      });

      // Special handling for step 6 (Additional Information) - validate both FAQs and images
      if (currentStep === 6) {
        const faqValidation = step6Schema.safeParse({
          faq: formData.faq,
        });
        const imageValidation = step7Schema.safeParse({
          images: currentImages, // Use currentImages instead of formData.images
        });

        console.log("📋 Step 6 Validation Results:", {
          faqValidation: faqValidation.success ? "✅ Valid" : "❌ Invalid",
          faqErrors: !faqValidation.success ? faqValidation.error.errors : null,
          imageValidation: imageValidation.success ? "✅ Valid" : "❌ Invalid",
          imageErrors: !imageValidation.success
            ? imageValidation.error.errors
            : null,
          currentImagesCount: currentImages.length,
        });

        if (!faqValidation.success) {
          console.error(
            "❌ FAQ validation failed:",
            faqValidation.error.errors
          );
          // Set error for faq field
          form.setError("faq", {
            type: "manual",
            message: "At least one FAQ is required",
          });
          return false;
        }

        if (!imageValidation.success) {
          console.error(
            "❌ Image validation failed:",
            imageValidation.error.errors
          );
          // Set error for images field
          form.setError("images", {
            type: "manual",
            message: "At least one image is required",
          });
          return false;
        }

        return true;
      }

      // Step 5 (Tour Schedule) - validate schedule data
      if (currentStep === 5) {
        const isValid = validateTourSchedule();
        console.log("📅 Step 5 Schedule Validation:", {
          isValid: isValid,
          tourScheduleData: tourScheduleData,
          scheduleLength: tourScheduleData?.length || 0,
        });
        return isValid;
      }

      // Step 3 (Pricing) - validate based on pricing mode
      if (currentStep === 3) {
        const hasCustomPricing =
          formData.custom_slot_types && formData.custom_slot_types.length > 0;
        console.log("💰 Step 3 Pricing Validation:", {
          hasCustomPricing: hasCustomPricing,
          rate: formData.rate,
          customSlotTypes: formData.custom_slot_types,
        });

        if (hasCustomPricing) {
          // For custom pricing, validate that at least one custom slot type is defined
          if (
            !formData.custom_slot_types ||
            formData.custom_slot_types.length === 0
          ) {
            console.error(
              "❌ Custom pricing requires at least one custom type"
            );
            form.setError("custom_slot_types", {
              type: "manual",
              message:
                "At least one custom type is required for custom pricing",
            });
            return false;
          }

          // Validate that all custom slot types have valid names and prices
          const invalidTypes = formData.custom_slot_types.filter(
            (type) =>
              !type.name ||
              type.price === null ||
              type.price === undefined ||
              type.price < 0
          );

          if (invalidTypes.length > 0) {
            console.error("❌ Invalid custom slot types:", invalidTypes);
            form.setError("custom_slot_types", {
              type: "manual",
              message: "All custom types must have valid names and prices",
            });
            return false;
          }
        } else {
          // For regular pricing, validate that rate is provided and positive
          if (
            formData.rate === null ||
            formData.rate === undefined ||
            formData.rate < 0
          ) {
            console.error("❌ Regular pricing requires a valid rate");
            form.setError("rate", {
              type: "manual",
              message:
                "Rate must be a positive number when using regular pricing",
            });
            return false;
          }
        }

        console.log("✅ Step 3 pricing validation successful");
        return true;
      }

      // For other steps, validate against the schema directly
      console.log(`🔍 Validating step ${currentStep} against schema:`, {
        stepFields:
          currentStep === 3
            ? ["rate", "custom_slot_types", "custom_slot_fields"]
            : getSchemaKeys(currentStepData.schema),
        formData: formData,
      });

      const validationResult =
        await currentStepData.schema.parseAsync(formData);
      console.log(
        `✅ Step ${currentStep} validation successful:`,
        validationResult
      );
      return true;
    } catch (error) {
      console.error(`❌ Step ${currentStep} validation failed:`, {
        error: error,
        stepTitle: currentStepData.title,
        formData: form.getValues(),
        formErrors: form.formState.errors,
      });
      // Trigger validation to show errors
      const fieldsToTrigger =
        currentStep === 3
          ? ["rate", "custom_slot_types", "custom_slot_fields"]
          : getSchemaKeys(currentStepData.schema);
      await form.trigger(fieldsToTrigger as any);
      return false;
    }
  };

  // Helper function to check if a field has a valid existing value
  const hasValidExistingValue = (field: string, value: any): boolean => {
    // For string fields, check if they have meaningful content
    if (typeof value === "string") {
      return value.trim().length > 0;
    }

    // For number fields, check if they have valid positive values
    if (typeof value === "number") {
      return value > 0;
    }

    // For arrays, check if they have items
    if (Array.isArray(value)) {
      return (
        value.length > 0 &&
        value.some((item) => {
          if (typeof item === "string") return item.trim().length > 0;
          if (typeof item === "object" && item !== null) {
            // For FAQ objects, check if both question and answer exist
            if (item.question && item.answer) {
              return (
                item.question.trim().length > 0 && item.answer.trim().length > 0
              );
            }
            // For other objects, check if they have any meaningful properties
            return Object.values(item).some((val) => {
              if (typeof val === "string") return val.trim().length > 0;
              if (typeof val === "number") return val > 0;
              return val !== null && val !== undefined;
            });
          }
          return item !== null && item !== undefined;
        })
      );
    }

    // For null/undefined values, they're not valid
    if (value === null || value === undefined) {
      return false;
    }

    // For other types, consider them valid if they exist
    return true;
  };

  // Check if a step is completed
  const isStepCompleted = (stepNumber: number): boolean => {
    // Only validate steps that are before the current step or the current step itself
    // This prevents unnecessary validation of future steps
    if (stepNumber > currentStep) {
      return false;
    }

    const stepData = STEPS[stepNumber - 1];
    if (!stepData?.schema) return true;

    try {
      const formData = form.getValues();

      // Special handling for step 6 (Additional Information) - validate both FAQs and images
      if (stepNumber === 6) {
        const faqValidation = step6Schema.safeParse({
          faq: formData.faq,
        });
        const imageValidation = step7Schema.safeParse({
          images: currentImages, // Use currentImages instead of formData.images
        });

        const isCompleted = faqValidation.success && imageValidation.success;
        console.log(`🔍 Checking if step ${stepNumber} is completed:`, {
          isCompleted: isCompleted,
          faqValid: faqValidation.success,
          imageValid: imageValidation.success,
        });
        return isCompleted;
      }

      // Step 5 (Tour Schedule) - validate schedule data
      if (stepNumber === 5) {
        const isCompleted = validateTourSchedule();
        console.log(`🔍 Checking if step ${stepNumber} is completed:`, {
          isCompleted: isCompleted,
          hasScheduleData: !!tourScheduleData,
        });
        return isCompleted;
      }

      stepData.schema.parse(formData);
      console.log(`✅ Step ${stepNumber} is completed`);
      return true;
    } catch (error) {
      console.log(`❌ Step ${stepNumber} is not completed:`, error);
      return false;
    }
  };

  // Check if current step has validation errors
  const hasCurrentStepErrors = (): boolean => {
    const currentStepData = STEPS[currentStep - 1];
    if (!currentStepData?.schema) return false;

    const formErrors = form.formState.errors;

    // Special handling for step 6 (Additional Information)
    if (currentStep === 6) {
      const formData = form.getValues();
      const faqValidation = step6Schema.safeParse({
        faq: formData.faq,
      });
      const imageValidation = step7Schema.safeParse({
        images: currentImages,
      });

      return !faqValidation.success || !imageValidation.success;
    }

    // Step 5 (Tour Schedule) - check schedule validation
    if (currentStep === 5) {
      return !validateTourSchedule();
    }

    // Step 3 (Pricing) - check pricing validation
    if (currentStep === 3) {
      const formData = form.getValues();
      const hasCustomPricing =
        formData.custom_slot_types && formData.custom_slot_types.length > 0;

      if (hasCustomPricing) {
        // For custom pricing, check custom slot types
        return !!(
          formErrors.custom_slot_types ||
          !formData.custom_slot_types ||
          formData.custom_slot_types.length === 0 ||
          formData.custom_slot_types.some(
            (type) =>
              !type.name ||
              type.price === null ||
              type.price === undefined ||
              type.price < 0
          )
        );
      } else {
        // For regular pricing, check rate
        return !!(
          formErrors.rate ||
          formData.rate === null ||
          formData.rate === undefined ||
          formData.rate < 0
        );
      }
    }

    const stepFields =
      currentStep === 3
        ? ["rate", "custom_slot_types", "custom_slot_fields"]
        : getSchemaKeys(currentStepData.schema);

    return stepFields.some(
      (field) => formErrors[field as keyof typeof formErrors]
    );
  };

  // Navigate to a specific step
  const goToStep = async (stepNumber: number) => {
    console.log(
      `🔄 Attempting to navigate to step ${stepNumber} from step ${currentStep}`
    );

    // Don't navigate if already navigating
    if (isNavigating) return;

    setIsNavigating(true);

    try {
      // Check if the step is accessible
      const isStepAccessible = (step: number): boolean => {
        // If editing an existing tour, allow navigation to any step
        if (initialData) return true;

        // For new tours, allow navigation to completed steps or current/previous steps
        return (
          step <= currentStep ||
          completedSteps.has(step) ||
          isStepCompleted(step)
        );
      };

      if (!isStepAccessible(stepNumber)) {
        console.log(`❌ Step ${stepNumber} is not accessible`);
        toast.error("Please complete the previous steps first.");
        return;
      }

      // Only validate current step if navigating forward
      if (stepNumber > currentStep) {
        const isValid = await validateCurrentStep();
        console.log(`🔍 Current step validation result:`, isValid);
        if (!isValid) {
          console.error("❌ Navigation blocked due to validation errors");
          // Show error message to user
          toast.error("Please fix the validation errors before proceeding.");
          return;
        }

        // Mark current step as completed if moving forward
        setCompletedSteps((prev) => new Set([...prev, currentStep]));
      }

      console.log(`✅ Navigating to step ${stepNumber}`);
      setCurrentStep(stepNumber);
    } finally {
      setIsNavigating(false);
    }
  };

  const handleSubmit = async (formData: TourFormValues) => {
    console.log("🚀 Starting form submission:", {
      formData: formData,
      currentImages: currentImages,
      tourScheduleData: tourScheduleData,
      initialData: initialData,
    });

    setIsSubmitting(true);

    let uploaded: { url: string; isFeature: boolean }[] = [];
    let tourId: string | undefined = undefined;

    try {
      // Clean form data and handle null values
      const dataForDatabase = formData;

      const cleanedData: CreateTourDTO = {
        ...dataForDatabase,
        duration: formData.duration !== null ? formData.duration : 1, // Provide default value if null
        group_size_limit:
          formData.group_size_limit !== null ? formData.group_size_limit : 1, // Provide default value if null
        rate:
          formData.rate !== null && formData.rate !== undefined
            ? formData.rate
            : 0, // Provide default value if null
        slots: formData.slots !== null ? formData.slots : 1, // Provide default value if null
        waiver_link: formData.waiver_link || "",
        languages: formData.languages.filter(Boolean),
        trip_highlights: formData.trip_highlights.filter(Boolean),
        includes: formData.includes.filter(Boolean),
        faq: formData.faq
          .filter((f) => f.question && f.answer)
          .map((f) => JSON.stringify(f)),
        custom_slot_types: formData.custom_slot_types
          ? JSON.stringify(
              formData.custom_slot_types.map((type) => ({
                ...type,
                price: type.price !== null ? type.price : 0, // Provide default value if null
              }))
            )
          : null,
        custom_slot_fields: formData.custom_slot_fields
          ? JSON.stringify(formData.custom_slot_fields)
          : null,
      };

      console.log("🧹 Cleaned form data:", cleanedData);

      // Step 1: Create or update tour
      if (initialData?.id) {
        console.log("📝 Updating existing tour:", initialData.id);
        await updateTourClient(initialData.id, cleanedData);
        tourId = initialData.id;
      } else {
        console.log("🆕 Creating new tour");
        const created = await createTourClient(cleanedData);
        tourId = created.id;
        console.log("✅ Tour created with ID:", tourId);
      }

      if (!tourId) throw new Error("Tour ID is undefined");

      // Step 2: Upload new images
      console.log("📤 Uploading images to Supabase...");
      uploaded = await uploadImagesToSupabase(currentImages, tourId);
      console.log("✅ Images uploaded:", uploaded);

      // Step 3: Update the tour with image metadata (stringified)
      console.log("🔄 Updating tour with image metadata...");
      await updateTourClient(tourId, {
        ...cleanedData,
        images: JSON.stringify(uploaded),
      });

      // Step 4: Delete removed images from storage
      console.log("🗑️ Cleaning up removed images...");
      await deleteRemovedImages(originalImages, uploaded);

      // Step 5: Save tour schedule if it exists
      if (tourScheduleData && tourScheduleData.length > 0) {
        console.log("📅 Saving tour schedule...");
        try {
          const scheduleResult = await saveTourSchedule(
            tourId,
            tourScheduleData
          );
          console.log("📅 Schedule save result:", scheduleResult);
          if (!scheduleResult.success) {
            console.warn(
              "Failed to save tour schedule:",
              scheduleResult.message
            );
          }
        } catch (error) {
          console.warn("Error saving tour schedule:", error);
        }
      }

      console.log("🎉 Tour saved successfully!");
      toast.success("Tour saved successfully");
      router.push("/dashboard/tours");
      onSuccess?.();
    } catch (error) {
      console.error("❌ Tour save failed:", {
        error: error,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        formData: formData,
        uploadedImages: uploaded,
        tourId: tourId,
      });
      toast.error("Something went wrong while saving the tour.");

      // Rollback uploaded images if save failed
      if (uploaded.length > 0) {
        console.log("🔄 Rolling back uploaded images...");
        const supabase = await createClient();
        const pathsToDelete = uploaded.map((img) => {
          const url = new URL(img.url);
          const parts = url.pathname.split("/");
          const bucketIndex = parts.findIndex((p) => p === "tour-images");
          return parts.slice(bucketIndex + 1).join("/");
        });

        console.log("🗑️ Deleting image paths:", pathsToDelete);

        if (pathsToDelete.length > 0) {
          const { error: rollbackError } = await supabase.storage
            .from("tour-images")
            .remove(pathsToDelete);

          if (rollbackError) {
            console.warn("❌ Rollback failed:", rollbackError);
          } else {
            console.info("✅ Rolled back uploaded images successfully.");
          }
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const addItem = (field: keyof TourFormValues, value?: any) => {
    const currentValue = form.getValues(field) as any[];
    if (field === "faq") {
      form.setValue(field, [
        ...currentValue,
        value || { question: "", answer: "" },
      ]);
    } else {
      form.setValue(field, [...currentValue, value || ""]);
    }
  };

  const removeItem = (field: keyof TourFormValues, index: number) => {
    const currentValue = form.getValues(field) as any[];
    const newValue = currentValue.filter((_, i) => i !== index);
    if (field === "faq") {
      form.setValue(
        field,
        newValue.length > 0 ? newValue : [{ question: "", answer: "" }]
      );
    } else if (
      field === "languages" ||
      field === "trip_highlights" ||
      field === "includes"
    ) {
      form.setValue(field, newValue.length > 0 ? newValue : [""]);
    } else {
      form.setValue(field, newValue);
    }
  };

  const updateItem = (
    field: keyof TourFormValues,
    index: number,
    value: any
  ) => {
    const currentValue = form.getValues(field) as any[];
    const newValue = [...currentValue];
    newValue[index] = value;
    form.setValue(field, newValue);
  };

  const nextStep = async () => {
    console.log(`➡️ Attempting to go to next step from step ${currentStep}`);

    // Don't proceed if already navigating
    if (isNavigating) return;

    setIsNavigating(true);

    try {
      const isValid = await validateCurrentStep();
      console.log(`🔍 Next step validation result:`, isValid);

      if (isValid) {
        console.log(`✅ Moving to next step: ${currentStep + 1}`);
        setCompletedSteps((prev) => new Set([...prev, currentStep]));
        if (currentStep < STEPS.length) {
          setCurrentStep(currentStep + 1);
        }
      } else {
        // console.error(
        //   "❌ Cannot proceed to next step due to validation errors"
        // );
        // Show error message to user
        toast.error(
          "Please fix the validation errors before proceeding to the next step."
        );
      }
    } finally {
      setIsNavigating(false);
    }
  };

  const prevStep = () => {
    console.log(`⬅️ Going to previous step from step ${currentStep}`);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFormSubmit = async () => {
    console.log("🚀 Form submission initiated");
    // Validate current step before submission
    const isValid = await validateCurrentStep();
    console.log(`🔍 Final validation before submission:`, isValid);

    if (!isValid) {
      console.error("❌ Form submission blocked due to validation errors");
      toast.error("Please fix the validation errors before submitting.");
      return;
    }

    console.log("✅ Proceeding with form submission");
    form.handleSubmit(handleSubmit)();
  };

  const renderStep = () => {
    const currentStepData = STEPS[currentStep - 1];

    // Get step-specific button text
    const getNextButtonText = () => {
      switch (currentStep) {
        case 1:
          return "Continue to Tour Configuration";
        case 2:
          return "Continue to Pricing";
        case 3:
          return "Continue to Location & Features";
        case 4:
          return "Continue to Tour Schedule";
        case 5:
          return "Continue to Additional Information";
        case 6:
          return "Create Tour";
        default:
          return "Continue";
      }
    };

    const getBackButtonText = () => {
      return "Previous";
    };

    // Render step content based on current step
    const renderStepContent = () => {
      switch (currentStep) {
        case 1:
          return (
            <BasicInformation
              form={form}
              title={currentStepData.title}
              description={currentStepData.description}
            />
          );
        case 2:
          return (
            <TourDetails
              form={form}
              title={currentStepData.title}
              description={currentStepData.description}
            />
          );
        case 3:
          return (
            <TourPricing
              form={form}
              addItem={addItem}
              removeItem={removeItem}
              updateItem={updateItem}
              title={currentStepData.title}
              description={currentStepData.description}
              showCard={false}
            />
          );
        case 4:
          return (
            <div className="space-y-8">
              <LocationInformation
                form={form}
                title={currentStepData.title}
                description={currentStepData.description}
              />
              <TourFeatures form={form} />
            </div>
          );
        case 5:
          return (
            <TourSchedule
              form={form}
              addItem={addItem}
              removeItem={removeItem}
              updateItem={updateItem}
              title={currentStepData.title}
              description={currentStepData.description}
              onScheduleChange={handleScheduleChange}
              tourId={initialData?.id}
            />
          );
        case 6:
          return (
            <div className="space-y-8">
              <AdditionalInformation
                form={form}
                title={currentStepData.title}
                description={currentStepData.description}
              />
              <TourImages
                form={form}
                currentImages={currentImages}
                onImagesChange={handleImagesChange}
                isSubmitting={form.formState.isSubmitting}
                initialData={initialData}
              />
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div className="space-y-8">
        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={prevStep}
                className="flex items-center gap-2"
                disabled={isNavigating || isSubmitting}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={currentStep === 6 ? handleFormSubmit : nextStep}
              disabled={isNavigating || isSubmitting || hasCurrentStepErrors()}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              {isNavigating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Tour...
                </>
              ) : currentStep === 6 ? (
                <>
                  <Check className="h-4 w-4" />
                  Create Tour
                </>
              ) : (
                <>
                  {getNextButtonText()}
                  <ChevronLeft className="h-4 w-4 rotate-180" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex w-full max-w-full h-screen border border-gray-200 bg-white rounded-none shadow-none overflow-hidden relative">
        {/* Loading Overlay */}
        {(isNavigating || isSubmitting) && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-lg font-medium text-gray-900">
                {isSubmitting ? "Creating tour..." : "Validating step..."}
              </p>
            </div>
          </div>
        )}

        {/* Sidebar Stepper */}
        <aside className="w-96 bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-8 border-b border-gray-200 bg-white">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                <Logo className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-1">
                {initialData ? "Edit Tour" : "Create Tour"}
              </h1>
              <p className="text-sm text-gray-600">
                {initialData
                  ? "Update your tour details"
                  : "Build your perfect tour experience"}
              </p>

              {/* Progress indicator */}
              <div className="mt-4 w-full">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{Math.round((currentStep / STEPS.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="flex-1 p-8 overflow-y-auto">
            <SidebarStepper
              steps={STEPS}
              currentStep={currentStep}
              completedSteps={completedSteps}
              isStepCompleted={isStepCompleted}
              onStepClick={goToStep}
              isNavigating={isNavigating}
            />
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-white">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/tours")}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Tours
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50">
          {/* Content Header */}
          <div className="bg-white border-b border-gray-200 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {STEPS[currentStep - 1]?.title}
                </h2>
                <p className="text-gray-600 mt-1">
                  {STEPS[currentStep - 1]?.description}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    Step {currentStep} of {STEPS.length}
                  </div>
                  <div className="text-xs text-gray-500">
                    {Math.round((currentStep / STEPS.length) * 100)}% Complete
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  {(() => {
                    const StepIcon = STEPS[currentStep - 1]?.icon;
                    return StepIcon ? (
                      <StepIcon className="h-6 w-6 text-white" />
                    ) : null;
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 p-8 overflow-y-auto">
              <div className="max-w-5xl mx-auto">
                <Form {...form}>{renderStep()}</Form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UpsertTourV2Stepped;
