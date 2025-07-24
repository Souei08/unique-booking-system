"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import { Tour } from "@/app/_features/tours/tour-types";
import { updateTourClient } from "../api/client/updateTourClient";
import { uploadImagesToSupabase } from "../api/client/uploadTourImages";
import { deleteRemovedImages } from "../api/client/deleteTourImages";
import { saveTourSchedule } from "../api/tour-schedule/client/saveTourSchedule";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Step Components
import BasicInformation from "../forms/upsert-tour-v2/upsert-tour-steps/BasicInformation";
import TourDetails from "../forms/upsert-tour-v2/upsert-tour-steps/TourDetails";
import TourPricing from "../forms/upsert-tour-v2/upsert-tour-steps/TourPricing";
import LocationInformation from "../forms/upsert-tour-v2/upsert-tour-steps/LocationInformation";
import TourFeatures from "../forms/upsert-tour-v2/upsert-tour-steps/TourFeatures";
import AdditionalInformation from "../forms/upsert-tour-v2/upsert-tour-steps/AdditionalInformation";
import TourImages from "../forms/upsert-tour-v2/upsert-tour-steps/TourImages";
import TourSchedule from "../forms/upsert-tour-v2/upsert-tour-steps/TourSchedule";



// Schemas for each section
const basicInfoSchema = z.object({
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

const tourDetailsSchema = z.object({
  duration: z.number().min(1, "Duration must be at least 1 hour"),
  group_size_limit: z.number().min(1, "Group size must be at least 1"),
  slots: z.number().min(1, "Slots must be at least 1"),
});

const pricingSchema = z.object({
  rate: z.number().min(0, "Rate must be a positive number"),
  custom_slot_types: z
    .array(
      z.object({
        name: z.string().min(1, "Name is required"),
        price: z.number().min(0, "Price must be a positive number"),
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
});

const locationSchema = z.object({
  meeting_point_address: z.string().min(1, "Meeting point is required"),
  dropoff_point_address: z.string().optional(),
  languages: z.array(z.string()).min(1, "At least one language is required"),
  trip_highlights: z
    .array(z.string())
    .min(1, "At least one highlight is required"),
  includes: z.array(z.string()).min(1, "At least one inclusion is required"),
});

const additionalInfoSchema = z.object({
  faq: z
    .array(
      z.object({
        question: z.string().min(1, "Question is required"),
        answer: z.string().min(1, "Answer is required"),
      })
    )
    .optional()
    .default([]),
});

const imagesSchema = z.object({
  images: z
    .array(
      z.object({
        url: z.string(),
        isFeature: z.boolean().default(false),
      })
    )
    .optional()
    .default([]),
});



export type TourSection =
  | "basic-info"
  | "tour-details"
  | "pricing"
  | "location"
  | "features"
  | "additional-info"
  | "images"
  | "schedule";

interface TourSectionUpdateProps {
  tour: Tour;
  section: TourSection;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const SECTION_CONFIG = {
  "basic-info": {
    title: "Basic Information",
    description: "Update tour title, description, and category",
    schema: basicInfoSchema,
    component: BasicInformation,
  },
  "tour-details": {
    title: "Tour Details",
    description: "Update duration, group size, and slots",
    schema: tourDetailsSchema,
    component: TourDetails,
  },
  pricing: {
    title: "Pricing",
    description: "Update tour pricing and custom slot types",
    schema: pricingSchema,
    component: TourPricing,
  },
  location: {
    title: "Location & Features",
    description: "Update meeting points, languages, and highlights",
    schema: locationSchema,
    component: LocationInformation,
  },
  features: {
    title: "Tour Features",
    description: "Update tour features and inclusions",
    schema: locationSchema,
    component: TourFeatures,
  },
  "additional-info": {
    title: "Additional Information",
    description: "Update FAQs and additional details",
    schema: additionalInfoSchema,
    component: AdditionalInformation,
  },
  images: {
    title: "Tour Images",
    description: "Update tour images and featured photos",
    schema: imagesSchema,
    component: TourImages,
  },
  schedule: {
    title: "Tour Schedule",
    description: "Update tour schedule and availability",
    schema: z.object({}),
    component: TourSchedule,
  },
};

export function TourSectionUpdate({
  tour,
  section,
  isOpen,
  onClose,
  onSuccess,
}: TourSectionUpdateProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentImages, setCurrentImages] = useState<any[]>(() => {
    if (!tour.images) return [];

    try {
      const parsedImages = JSON.parse(tour.images);
      // Ensure each image has the correct structure for featured functionality
      return parsedImages.map((img: any) => ({
        url: img.url || img,
        isFeature: img.isFeature || img.isFeatured || false,
        file: img.file || null,
      }));
    } catch (error) {
      console.error("Error parsing tour images:", error);
      return [];
    }
  });
  const [tourScheduleData, setTourScheduleData] = useState<any>(null);

  const config = SECTION_CONFIG[section];
  const SectionComponent = config.component;

  const form = useForm<any>({
    resolver: zodResolver(config.schema),
    defaultValues: getDefaultValues(section, tour),
  });

  function getDefaultValues(section: TourSection, tour: Tour) {
    switch (section) {
      case "basic-info":
        return {
          title: tour.title || "",
          description: tour.description || "",
          category: tour.category || "",
        };
      case "tour-details":
        return {
          duration: tour.duration || 1,
          group_size_limit: tour.group_size_limit || 1,
          slots: tour.slots || 1,
        };
      case "pricing":
        return {
          rate: tour.rate || 0,
          custom_slot_types: tour.custom_slot_types
            ? typeof tour.custom_slot_types === "string"
              ? JSON.parse(tour.custom_slot_types)
              : tour.custom_slot_types
            : [],
          custom_slot_fields: tour.custom_slot_fields
            ? typeof tour.custom_slot_fields === "string"
              ? JSON.parse(tour.custom_slot_fields)
              : tour.custom_slot_fields
            : [],
        };
      case "location":
        return {
          meeting_point_address: tour.meeting_point_address || "",
          dropoff_point_address: tour.dropoff_point_address || "",
          languages: Array.isArray(tour.languages) ? tour.languages : [""],
          trip_highlights: Array.isArray(tour.trip_highlights)
            ? tour.trip_highlights
            : [""],
          includes: Array.isArray(tour.includes) ? tour.includes : [""],
        };
      case "features":
        return {
          languages: Array.isArray(tour.languages) ? tour.languages : [""],
          trip_highlights: Array.isArray(tour.trip_highlights)
            ? tour.trip_highlights
            : [""],
          includes: Array.isArray(tour.includes) ? tour.includes : [""],
        };
      case "additional-info":
        return {
          faq: tour.faq?.length
            ? tour.faq.map((faq) => JSON.parse(faq))
            : [{ question: "", answer: "" }],
        };
      case "images":
        return {
          images: currentImages.map((img) => ({
            url: img.url,
            isFeature: img.isFeature || false,
            file: img.file || null,
          })),
        };
      case "schedule":
        return {};
      default:
        return {};
    }
  }

  const handleImagesChange = (images: any[]) => {
    setCurrentImages(images);
  };

  const handleScheduleChange = (scheduleData: any) => {
    setTourScheduleData(scheduleData);
  };

  const addItem = (field: any, value: any) => {
    const currentValue = form.getValues(field) as any[];
    const newValue = [...currentValue, value];
    form.setValue(field, newValue);
  };

  const removeItem = (field: any, index: number) => {
    const currentValue = form.getValues(field) as any[];
    const newValue = currentValue.filter((_, i) => i !== index);
    form.setValue(field, newValue.length > 0 ? newValue : [""]);
  };

  const updateItem = (field: any, index: number, value: any) => {
    const currentValue = form.getValues(field) as any[];
    const newValue = [...currentValue];
    newValue[index] = value;
    form.setValue(field, newValue);
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      let updateData = { ...data };

      console.log(updateData);

      // Handle special cases for different sections
      if (section === "pricing") {
        // Stringify custom_slot_types and custom_slot_fields for database storage
        if (updateData.custom_slot_types) {
          updateData.custom_slot_types = JSON.stringify(
            updateData.custom_slot_types
          );
        }
        if (updateData.custom_slot_fields) {
          updateData.custom_slot_fields = JSON.stringify(
            updateData.custom_slot_fields
          );
        }
      }

      if (section === "images") {
        // Upload new images and update tour
        const uploaded = await uploadImagesToSupabase(currentImages, tour.id);
        updateData.images = JSON.stringify(uploaded);

        // Clean up removed images
        const originalImages = tour.images ? JSON.parse(tour.images) : [];
        await deleteRemovedImages(originalImages, uploaded);
      }

      if (section === "schedule" && tourScheduleData) {
        // Save tour schedule separately
        await saveTourSchedule(tour.id, tourScheduleData);
        updateData = {}; // No tour data to update for schedule
      }

      // Update tour data
      if (Object.keys(updateData).length > 0) {
        await updateTourClient(tour.id, updateData);
      }

      toast.success(`${config.title} updated successfully`);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error updating tour section:", error);
      toast.error("Failed to update tour section");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSectionContent = () => {
    const commonProps = {
      form,
      title: config.title,
      description: config.description,
    };

    switch (section) {
      case "basic-info":
        return <BasicInformation {...commonProps} />;
      case "tour-details":
        return <TourDetails {...commonProps} />;
      case "pricing":
        return (
          <TourPricing
            {...commonProps}
            addItem={addItem}
            removeItem={removeItem}
            updateItem={updateItem}
            showCard={false}
          />
        );
      case "location":
        return <LocationInformation {...commonProps} />;
      case "features":
        return <TourFeatures {...commonProps} />;
      case "additional-info":
        return <AdditionalInformation {...commonProps} />;
      case "images":
        return (
          <TourImages
            {...commonProps}
            currentImages={currentImages}
            onImagesChange={handleImagesChange}
            isSubmitting={isSubmitting}
            initialData={tour}
          />
        );
      case "schedule":
        return (
          <TourSchedule
            {...commonProps}
            addItem={addItem}
            removeItem={removeItem}
            updateItem={updateItem}
            onScheduleChange={handleScheduleChange}
            tourId={tour.id}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[800px] lg:max-w-[1500px] max-h-[95vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {config.title}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {renderSectionContent()}

              <div className="flex items-center justify-end gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !form.formState.isValid}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    `Update ${config.title}`
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
