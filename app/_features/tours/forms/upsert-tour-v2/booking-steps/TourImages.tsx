import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormMessage } from "@/components/ui/form";
import { ImageUploadInput } from "../ImageUploadInput";
import { TourLocalImage } from "@/app/_features/tours/tour-types";
import { AlertCircle } from "lucide-react";

interface TourImagesProps {
  form: UseFormReturn<any>;
  onBack: () => void;
  onSubmit: () => void;
  currentImages: TourLocalImage[];
  onImagesChange: (images: TourLocalImage[]) => void;
  isSubmitting: boolean;
  initialData?: any;
}

const TourImages: React.FC<TourImagesProps> = ({
  form,
  onBack,
  onSubmit,
  currentImages,
  onImagesChange,
  isSubmitting,
  initialData,
}) => {
  const imageError = form.formState.errors.images?.message as string;
  const formImages = form.watch("images") || [];
  const hasImages = formImages.length > 0;

  return (
    <Card>
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl font-bold text-strong  gap-3">
          Tour Images
        </CardTitle>
        <p className="text-sm text-weak">
          Upload images to showcase your tour. At least one image is required.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <ImageUploadInput
            value={currentImages}
            onChange={onImagesChange}
            label="Upload Tour Images"
            multiple={true}
            maxFiles={10}
          />

          {imageError && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{imageError}</span>
            </div>
          )}

          {hasImages && (
            <p className="text-sm text-green-600">
              ✓ {formImages.length} image
              {formImages.length !== 1 ? "s" : ""} uploaded
            </p>
          )}
        </div>

        <div className="flex justify-between mt-6">
          <Button
            onClick={onBack}
            variant="outline"
            type="button"
            className="text-strong"
          >
            Previous
          </Button>
          <Button
            onClick={onSubmit}
            type="button"
            disabled={isSubmitting || !hasImages}
            className="bg-brand text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? "Saving..."
              : initialData
                ? "Update Tour"
                : "Create Tour"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TourImages;
