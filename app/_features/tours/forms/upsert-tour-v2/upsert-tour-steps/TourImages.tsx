import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormMessage, FormLabel, FormDescription } from "@/components/ui/form";
import { ImageUploadInput } from "../ImageUploadInput";
import { TourLocalImage } from "@/app/_features/tours/tour-types";
import { AlertCircle, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TourImagesProps {
  form: UseFormReturn<any>;
  currentImages: TourLocalImage[];
  onImagesChange: (images: TourLocalImage[]) => void;
  isSubmitting: boolean;
  initialData?: any;
}

const TourImages: React.FC<TourImagesProps> = ({
  form,
  currentImages,
  onImagesChange,
  isSubmitting,
  initialData,
}) => {
  const imageError = form.formState.errors.images?.message as string;
  const formImages = form.watch("images") || [];
  const hasImages = formImages.length > 0;

  return (
    <div className="space-y-8">
      {/* Tour Images Section */}
      <Card className="border border-gray-200 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ImageIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Tour Images
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Upload images that best represent your tour. At least one image
                is required.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="mb-2">
            <FormLabel className="text-base font-semibold text-gray-700">
              Tour Images <span className="text-red-500">*</span>
            </FormLabel>
            <FormDescription className="text-sm text-gray-400 mb-3">
              Upload images that best represent your tour. At least one image is
              required. You can set one image as featured by clicking the star
              icon.
            </FormDescription>
            <ImageUploadInput
              value={currentImages}
              onChange={onImagesChange}
              multiple={true}
              maxFiles={10}
            />

            {imageError && (
              <div className="flex items-center gap-2 text-sm text-red-600 mt-3">
                <AlertCircle className="h-4 w-4" />
                <span>{imageError}</span>
              </div>
            )}

            {hasImages && (
              <div className="flex items-center gap-2 text-sm text-green-600 mt-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>
                  {formImages.length} image{formImages.length !== 1 ? "s" : ""}{" "}
                  uploaded
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TourImages;
