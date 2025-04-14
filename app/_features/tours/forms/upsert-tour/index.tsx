"use client";

import { createTourClient } from "@/app/_features/tours/actions/client/createTourClient";
import { updateTourClient } from "@/app/_features/tours/actions/client/updateTourClient";

import { CreateTourDTO } from "@/app/_features/tours/types/TourTypes";

import { createTourSchema, UpsertTourData } from "./schema";

import { tourFields } from "./types";

import TourForm from "./components/TourForm";

interface UpsertTourFormProps {
  initialData?: UpsertTourData;
  mode?: "create" | "update";
  tourId?: string;
  onSuccess?: () => void;
}

export default function UpsertTourForm({
  initialData,
  mode = "create",
  tourId,
  onSuccess,
}: UpsertTourFormProps) {
  const handleSubmit = async (data: UpsertTourData) => {
    try {
      // Convert string values to numbers for numeric fields
      const processedData = {
        ...data,
        price: Number(data.price),
        duration: Number(data.duration),
        maxGroupSize: Number(data.maxGroupSize),
        slots: Number(data.slots),
      };

      // Map form data to match the Tour interface
      const tourData: CreateTourDTO = {
        title: processedData.title,
        description: processedData.description,
        duration: processedData.duration,
        group_size_limit: processedData.maxGroupSize,
        slots: processedData.slots,
        rate: processedData.price,
        languages: processedData.languages,
        trip_highlights: processedData.tripHighlights,
        things_to_know: processedData.thingToKnow,
        faq: processedData.faq,
        meeting_point_address: processedData.meetingPointAddress,
        dropoff_point_address: processedData.dropoffPointAddress,
        includes: processedData.includes,
        category: processedData.category,
      };

      let result: any;

      if (mode === "create") {
        result = await createTourClient(tourData);
      } else if (tourId) {
        result = await updateTourClient(tourId, tourData);
      }

      if (!result) {
        throw new Error(`Failed to ${mode} tour`);
      }

      onSuccess?.();
    } catch (error: any) {
      console.error(`Error ${mode}ing tour:`, error);
      // You might want to show this error to the user through a toast or alert
      throw new Error(error.message || `Failed to ${mode} tour`);
    }
  };

  return (
    <TourForm
      schema={createTourSchema}
      onSubmit={handleSubmit}
      fields={tourFields}
      buttonText={mode === "create" ? "Create Tours" : "Update Tour"}
      initialData={initialData}
      onSuccess={onSuccess}
    />
  );
}
