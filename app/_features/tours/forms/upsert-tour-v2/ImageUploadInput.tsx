import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { X, Star, StarOff } from "lucide-react";
import { TourLocalImage } from "@/app/_features/tours/tour-types";

interface Props {
  value?: TourLocalImage[];
  onChange?: (images: TourLocalImage[]) => void;
  className?: string;
  multiple?: boolean;
  maxFiles?: number;
}

export function ImageUploadInput({
  value = [],
  onChange,
  className,
  multiple = true,
  maxFiles = 10,
}: Props) {
  const [images, setImages] = useState<TourLocalImage[]>(value);

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newImages: TourLocalImage[] = acceptedFiles
        .slice(0, maxFiles - images.length)
        .map((file) => ({
          file,
          url: URL.createObjectURL(file),
          isFeature: false,
        }));

      const updated = [...images, ...newImages].slice(0, maxFiles);
      setImages(updated);
      onChange?.(updated);
    },
    [images, maxFiles, onChange]
  );

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    onChange?.(updated);
  };

  const handleSetFeature = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      isFeature: i === index, // Only one can be true
    }));
    setImages(updated);
    onChange?.(updated);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"] },
    multiple,
    maxFiles,
  });

  useEffect(() => {
    if (value?.length && !value.some((img) => img.isFeature)) {
      const updated = value.map((img, i) => ({ ...img, isFeature: i === 0 }));
      setImages(updated);
      onChange?.(updated);
    } else {
      setImages(value);
    }
  }, [value, onChange]);

  return (
    <div className={cn("space-y-3", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand/30",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-gray-300 hover:border-primary/50"
        )}
      >
        <input {...getInputProps()} />
        <svg
          className="w-10 h-10 mx-auto mb-2 text-primary"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 16v-8m0 0-3.5 3.5M12 8l3.5 3.5M20 16.5V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2.5"
          />
        </svg>
        <p className="text-base text-gray-700 font-medium mb-1">
          {isDragActive
            ? "Drop the images here"
            : "Drag & drop or click to upload"}
        </p>
        <p className="text-xs text-gray-500 mb-3">
          PNG, JPG, JPEG, GIF, WEBP up to {maxFiles} files
        </p>
        <Button
          type="button"
          variant="default"
          size="sm"
          className="h-9 px-4 mt-1"
        >
          Select Images
        </Button>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-6">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group rounded-xl overflow-hidden shadow-sm  bg-white"
            >
              <div className="aspect-square relative">
                <Image
                  src={image.url}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-primary hover:bg-primary/10 h-8 w-8 z-10"
                    onClick={() => handleSetFeature(index)}
                    title="Set as featured"
                  >
                    {image.isFeature ? (
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ) : (
                      <StarOff className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-primary hover:bg-primary/10 h-8 w-8 z-10"
                    onClick={() => handleRemove(index)}
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                {image.isFeature && (
                  <div className="absolute top-2 left-2 bg-yellow-400/90 text-white text-xs font-semibold px-2 py-0.5 rounded shadow">
                    Featured
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
