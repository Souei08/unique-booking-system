import React, { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
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
import BasicInformation from "./booking-steps/BasicInformation";
import TourDetails from "./booking-steps/TourDetails";
import SlotConfiguration from "./booking-steps/SlotConfiguration";
import LocationInformation from "./booking-steps/LocationInformation";
import TourFeatures from "./booking-steps/TourFeatures";
import AdditionalInformation from "./booking-steps/AdditionalInformation";
import TourImages from "./booking-steps/TourImages";
import TourSchedule from "./booking-steps/TourSchedule";

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
});

const step3Schema = z.object({
  rate: z
    .number()
    .nullable()
    .refine((val) => val !== null && val >= 0, {
      message: "Rate must be a positive number",
    }),
  slots: z
    .number()
    .nullable()
    .refine((val) => val !== null && val >= 1, {
      message: "Slots must be at least 1",
    }),
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

const tourFormSchema = z.object({
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
  rate: z
    .number()
    .nullable()
    .refine((val) => val !== null && val >= 0, {
      message: "Rate must be a positive number",
    }),
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
  images: z.array(z.any()).min(1, "At least one image is required"),
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
    description: "Tour title, category, and description",
    schema: step1Schema,
    icon: FileText,
  },
  {
    id: 2,
    title: "Tour Details & Pricing",
    description: "Duration, group size, pricing, and capacity",
    schema: z.object({
      ...step2Schema.shape,
      ...step3Schema.shape,
    }),
    icon: DollarSign,
  },
  {
    id: 3,
    title: "Location & Features",
    description: "Meeting points, languages, highlights, and inclusions",
    schema: z.object({
      ...step4Schema.shape,
      ...step5Schema.shape,
    }),
    icon: MapPin,
  },
  {
    id: 4,
    title: "Tour Schedule",
    description: "Weekly schedule and time slots",
    schema: z.object({}), // No validation needed for schedule step
    icon: Calendar,
  },
  {
    id: 5,
    title: "Additional Information",
    description: "Things to know, FAQs, and images",
    schema: z.object({
      ...step6Schema.shape,
      ...step7Schema.shape,
    }),
    icon: Settings,
  },
];

const UpsertTourV2Stepped: React.FC<UpsertTourV2SteppedProps> = ({
  initialData,
  onSuccess,
}) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
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
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      category: initialData?.category || "",
      duration: initialData?.duration || null,
      group_size_limit: initialData?.group_size_limit || null,
      rate: initialData?.rate || null,
      slots: initialData?.slots || null,
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
    setCurrentImages(images);
    // Update the form's images field for validation
    form.setValue("images", images);
  };

  const handleScheduleChange = useCallback((scheduleData: any) => {
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
      setIsScheduleValid(isValid);
    } else {
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

      // Special handling for step 5 (Additional Information) - validate both FAQs and images
      if (currentStep === 5) {
        const faqValidation = step6Schema.safeParse({
          faq: formData.faq,
        });
        const imageValidation = step7Schema.safeParse({
          images: currentImages, // Use currentImages instead of formData.images
        });

        if (!faqValidation.success) {
          // Set error for faq field
          form.setError("faq", {
            type: "manual",
            message: "At least one FAQ is required",
          });
          return false;
        }

        if (!imageValidation.success) {
          // Set error for images field
          form.setError("images", {
            type: "manual",
            message: "At least one image is required",
          });
          return false;
        }

        return true;
      }

      // Step 4 (Tour Schedule) - validate schedule data
      if (currentStep === 4) {
        return validateTourSchedule();
      }

      await currentStepData.schema.parseAsync(formData);
      return true;
    } catch (error) {
      // Trigger validation to show errors
      await form.trigger(Object.keys(currentStepData.schema.shape) as any);
      return false;
    }
  };

  // Check if a step is completed
  const isStepCompleted = (stepNumber: number): boolean => {
    const stepData = STEPS[stepNumber - 1];
    if (!stepData?.schema) return true;

    try {
      const formData = form.getValues();

      // Special handling for step 5 (Additional Information) - validate both FAQs and images
      if (stepNumber === 5) {
        const faqValidation = step6Schema.safeParse({
          faq: formData.faq,
        });
        const imageValidation = step7Schema.safeParse({
          images: currentImages, // Use currentImages instead of formData.images
        });

        return faqValidation.success && imageValidation.success;
      }

      // Step 4 (Tour Schedule) - validate schedule data
      if (stepNumber === 4) {
        return validateTourSchedule();
      }

      stepData.schema.parse(formData);
      return true;
    } catch {
      return false;
    }
  };

  // Check if current step has validation errors
  const hasCurrentStepErrors = (): boolean => {
    const currentStepData = STEPS[currentStep - 1];
    if (!currentStepData?.schema) return false;

    const formErrors = form.formState.errors;

    // Special handling for step 5 (Additional Information)
    if (currentStep === 5) {
      const formData = form.getValues();
      const faqValidation = step6Schema.safeParse({
        faq: formData.faq,
      });
      const imageValidation = step7Schema.safeParse({
        images: currentImages,
      });

      return !faqValidation.success || !imageValidation.success;
    }

    // Step 4 (Tour Schedule) - check schedule validation
    if (currentStep === 4) {
      return !validateTourSchedule();
    }

    const stepFields = Object.keys(currentStepData.schema.shape);

    return stepFields.some(
      (field) => formErrors[field as keyof typeof formErrors]
    );
  };

  // Navigate to a specific step
  const goToStep = async (stepNumber: number) => {
    // Always validate current step before allowing navigation
    if (stepNumber !== currentStep) {
      const isValid = await validateCurrentStep();
      if (!isValid) {
        // Show error message to user
        toast.error("Please fix the validation errors before proceeding.");
        return;
      }
    }

    // If editing an existing tour (initialData exists), allow navigation to any step
    if (initialData) {
      setCurrentStep(stepNumber);
      return;
    }

    // For new tours, only allow navigation to completed steps or the next available step
    if (stepNumber <= currentStep || completedSteps.has(stepNumber)) {
      setCurrentStep(stepNumber);
    } else {
      setCurrentStep(stepNumber);
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
    }
  };

  const handleSubmit = async (formData: TourFormValues) => {
    let uploaded: { url: string; isFeature: boolean }[] = [];
    let tourId: string | undefined = undefined;

    try {
      // Clean form data and handle null values
      const cleanedData: CreateTourDTO = {
        ...formData,
        duration: formData.duration !== null ? formData.duration : 1, // Provide default value if null
        group_size_limit:
          formData.group_size_limit !== null ? formData.group_size_limit : 1, // Provide default value if null
        rate: formData.rate !== null ? formData.rate : 0, // Provide default value if null
        slots: formData.slots !== null ? formData.slots : 1, // Provide default value if null
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

      // Step 1: Create or update tour
      if (initialData?.id) {
        await updateTourClient(initialData.id, cleanedData);
        tourId = initialData.id;
      } else {
        const created = await createTourClient(cleanedData);
        tourId = created.id;
      }

      if (!tourId) throw new Error("Tour ID is undefined");

      // Step 2: Upload new images
      uploaded = await uploadImagesToSupabase(currentImages, tourId);

      // Step 3: Update the tour with image metadata (stringified)
      await updateTourClient(tourId, {
        ...cleanedData,
        images: JSON.stringify(uploaded),
      });

      // Step 4: Delete removed images from storage
      await deleteRemovedImages(originalImages, uploaded);

      // Step 5: Save tour schedule if it exists (for new tours)
      if (tourScheduleData && tourScheduleData.length > 0 && !initialData?.id) {
        try {
          const scheduleResult = await saveTourSchedule(
            tourId,
            tourScheduleData
          );
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

      toast.success("Tour saved successfully");
      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error("Tour save failed:", error);
      toast.error("Something went wrong while saving the tour.");

      // Rollback uploaded images if save failed
      if (uploaded.length > 0) {
        const supabase = await createClient();
        const pathsToDelete = uploaded.map((img) => {
          const url = new URL(img.url);
          const parts = url.pathname.split("/");
          const bucketIndex = parts.findIndex((p) => p === "tour-images");
          return parts.slice(bucketIndex + 1).join("/");
        });

        if (pathsToDelete.length > 0) {
          const { error: rollbackError } = await supabase.storage
            .from("tour-images")
            .remove(pathsToDelete);

          if (rollbackError) {
            console.warn("Rollback failed:", rollbackError);
          } else {
            console.info("Rolled back uploaded images successfully.");
          }
        }
      }
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
    const isValid = await validateCurrentStep();
    if (isValid) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      // Show error message to user
      toast.error(
        "Please fix the validation errors before proceeding to the next step."
      );
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFormSubmit = async () => {
    // Validate current step before submission
    const isValid = await validateCurrentStep();
    if (!isValid) {
      toast.error("Please fix the validation errors before submitting.");
      return;
    }

    form.handleSubmit(handleSubmit)();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInformation form={form} onNext={nextStep} />;
      case 2:
        return (
          <div className="space-y-8">
            <TourDetails form={form} />
            <SlotConfiguration
              form={form}
              addItem={addItem}
              removeItem={removeItem}
              updateItem={updateItem}
            />
            <div className="flex justify-between pt-6 border-t border-gray-100">
              <Button
                onClick={prevStep}
                variant="outline"
                type="button"
                className="text-strong px-6 py-2"
              >
                ← Previous
              </Button>
              <Button
                onClick={nextStep}
                type="button"
                className="bg-brand text-white font-semibold px-8 py-2 hover:bg-brand/90 transition-colors"
              >
                Next Step →
              </Button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8">
            <LocationInformation form={form} />
            <TourFeatures
              form={form}
              addItem={addItem}
              removeItem={removeItem}
              updateItem={updateItem}
            />
            <div className="flex justify-between pt-6 border-t border-gray-100">
              <Button
                onClick={prevStep}
                variant="outline"
                type="button"
                className="text-strong px-6 py-2"
              >
                ← Previous
              </Button>
              <Button
                onClick={nextStep}
                type="button"
                className="bg-brand text-white font-semibold px-8 py-2 hover:bg-brand/90 transition-colors"
              >
                Next Step →
              </Button>
            </div>
          </div>
        );
      case 4:
        return (
          <TourSchedule
            form={form}
            tourId={initialData?.id}
            onNext={nextStep}
            onBack={prevStep}
            onScheduleChange={handleScheduleChange}
          />
        );
      case 5:
        return (
          <div className="space-y-8">
            <AdditionalInformation
              form={form}
              addItem={addItem}
              removeItem={removeItem}
              updateItem={updateItem}
            />
            <TourImages
              form={form}
              onBack={prevStep}
              onSubmit={handleFormSubmit}
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
    <div className="min-h-screen bg-background">
      <div className="">
        {/* Progress Bar and Stepper */}
        <div className="mb-8 md:mb-12 px-4 md:px-8">
          {/* Stepper */}
          <div className="mb-6">
            <div className="flex items-center justify-between w-full relative">
              {STEPS.map((step, index) => {
                const isCompleted =
                  completedSteps.has(step.id) || isStepCompleted(step.id);
                const isCurrent = currentStep === step.id;
                const hasErrors = isCurrent && hasCurrentStepErrors();
                const isClickable = initialData
                  ? !hasErrors // Disable if there are errors, even in edit mode
                  : (isCompleted || step.id <= currentStep) && !hasErrors; // Only completed/current steps for new tours, and no errors

                return (
                  <div
                    key={step.id}
                    className="flex flex-col items-center flex-1 relative"
                  >
                    <button
                      onClick={() => isClickable && goToStep(step.id)}
                      disabled={!isClickable}
                      className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full border-2 transition-all duration-300 z-10 relative ${
                        isCurrent
                          ? hasErrors
                            ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/25 scale-110"
                            : "bg-brand border-brand text-white shadow-lg shadow-brand/25 scale-110"
                          : isCompleted
                            ? initialData
                              ? "bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                              : "bg-green-500 border-green-500 text-white shadow-md"
                            : "bg-white border-gray-300 text-gray-500 hover:border-gray-400"
                      } ${
                        isClickable
                          ? "cursor-pointer hover:scale-105"
                          : "cursor-not-allowed opacity-50"
                      }`}
                    >
                      {isCompleted ? (
                        initialData ? (
                          // New design for update mode
                          <div className="relative">
                            <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 md:w-3 md:h-3 bg-white rounded-full flex items-center justify-center">
                              <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-emerald-600 rounded-full"></div>
                            </div>
                          </div>
                        ) : (
                          // Original design for create mode
                          <Check className="w-4 h-4 md:w-5 md:h-5" />
                        )
                      ) : (
                        <span className="text-sm md:text-base font-bold">
                          {hasErrors ? (
                            <HelpCircle className="w-4 h-4 md:w-5 md:h-5" />
                          ) : (
                            React.createElement(step.icon, {
                              className: "w-4 h-4 md:w-5 md:h-5",
                            })
                          )}
                        </span>
                      )}
                    </button>

                    {/* Step title and description */}
                    <div className="mt-3 text-center w-full px-2">
                      <div
                        className={`text-xs font-semibold mb-1 ${
                          isCurrent
                            ? hasErrors
                              ? "text-red-600"
                              : "text-brand"
                            : isCompleted
                              ? initialData
                                ? "text-emerald-600"
                                : "text-green-600"
                              : isClickable
                                ? "text-gray-700"
                                : "text-gray-400"
                        }`}
                      >
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-500 leading-tight">
                        {step.description}
                      </div>
                    </div>

                    {/* Connector line */}
                    {index < STEPS.length - 1 && (
                      <div className="absolute top-5 md:top-6 left-[calc(50%+20px)] md:left-[calc(50%+24px)] w-[calc(100%-40px)] md:w-[calc(100%-48px)] h-0.5 -z-10">
                        <div
                          className={`w-full h-full transition-all duration-300 ${
                            isCompleted
                              ? initialData
                                ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                                : "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className=" p-4 sm:p-6">
          <Form {...form}>{renderStep()}</Form>
        </div>
      </div>
    </div>
  );
};

export default UpsertTourV2Stepped;
