import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Star } from "lucide-react";

interface Image {
  url: string;
  isFeatured: boolean;
}

interface NewImage {
  file: File;
  preview: string;
  isFeatured: boolean;
}

interface TourImageUploadProps {
  initialImages: Image[];
  initialFeaturedImages: string[];
  onImagesChange?: (images: Image[]) => void;
}

export const TourImageUpload: React.FC<TourImageUploadProps> = ({
  initialImages,
  initialFeaturedImages,
  onImagesChange,
}) => {
  const [newImages, setNewImages] = useState<NewImage[]>([]);
  const [images, setImages] = useState<Image[]>(initialImages);

  useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImageFiles = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      isFeatured: false,
    }));

    setNewImages((prev) => [...prev, ...newImageFiles]);

    // Update parent with only existing images (not blob URLs)
    const updatedImages = [...images];
    onImagesChange?.(updatedImages);
  };

  const removeImage = (index: number, isNewImage: boolean) => {
    if (isNewImage) {
      const imageToRemove = newImages[index];
      URL.revokeObjectURL(imageToRemove.preview);
      setNewImages((prev) => prev.filter((_, i) => i !== index));

      // Update parent with only existing images
      const updatedImages = [...images];
      onImagesChange?.(updatedImages);
    } else {
      setImages((prev) => prev.filter((_, i) => i !== index));

      // Update parent with remaining existing images
      const updatedImages = images.filter((_, i) => i !== index);
      onImagesChange?.(updatedImages);
    }
  };

  const toggleFeatured = (index: number, isNewImage: boolean) => {
    if (isNewImage) {
      setNewImages((prev) => {
        const updatedImages = prev.map((img, i) => ({
          ...img,
          isFeatured: i === index ? !img.isFeatured : false,
        }));

        // Update parent with only existing images
        const allImages = [...images];
        onImagesChange?.(allImages);
        return updatedImages;
      });
    } else {
      setImages((prev) => {
        const updatedImages = prev.map((img, i) => ({
          ...img,
          isFeatured: i === index ? !img.isFeatured : false,
        }));

        // Update parent with updated existing images
        onImagesChange?.(updatedImages);
        return updatedImages;
      });
    }
  };

  const clearAllImages = () => {
    newImages.forEach((img) => URL.revokeObjectURL(img.preview));
    setNewImages([]);
    setImages([]);
    onImagesChange?.([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="w-full"
          />
          <Button
            type="button"
            variant="outline"
            onClick={clearAllImages}
            disabled={newImages.length === 0 && images.length === 0}
          >
            Clear All Images
          </Button>
        </div>

        {(newImages.length > 0 || images.length > 0) && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={`existing-${index}`}
                className={`relative border rounded-lg p-2 ${
                  image.isFeatured ? "ring-2 ring-primary" : ""
                }`}
              >
                <img
                  src={image.url}
                  alt={`Existing image ${index + 1}`}
                  className="w-full h-32 object-cover rounded"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => removeImage(index, false)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant={image.isFeatured ? "default" : "outline"}
                  size="sm"
                  className="absolute bottom-2 left-2"
                  onClick={() => toggleFeatured(index, false)}
                >
                  {image.isFeatured ? (
                    <Star className="h-4 w-4 fill-current" />
                  ) : (
                    <Star className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}

            {newImages.map((image, index) => (
              <div
                key={`new-${index}`}
                className={`relative border rounded-lg p-2 ${
                  image.isFeatured ? "ring-2 ring-primary" : ""
                }`}
              >
                <img
                  src={image.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => removeImage(index, true)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant={image.isFeatured ? "default" : "outline"}
                  size="sm"
                  className="absolute bottom-2 left-2"
                  onClick={() => toggleFeatured(index, true)}
                >
                  {image.isFeatured ? (
                    <Star className="h-4 w-4 fill-current" />
                  ) : (
                    <Star className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
