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
  label?: string;
  multiple?: boolean;
  maxFiles?: number;
}

export function ImageUploadInput({
  value = [],
  onChange,
  className,
  label = "Upload Images",
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
    <div className={cn("space-y-2", className)}>
      <Label className="text-strong font-semibold">{label}</Label>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-muted"
        )}
      >
        <input {...getInputProps()} />
        <p className="text-sm text-muted-foreground">
          {isDragActive
            ? "Drop the images here"
            : "Drag and drop images here, or click to select"}
        </p>
        <Button type="button" variant="outline" size="sm" className="mt-2">
          Select Images
        </Button>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square relative rounded-lg overflow-hidden">
                <Image
                  src={image.url}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => handleSetFeature(index)}
                    title="Set as featured"
                  >
                    {image.isFeature ? (
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ) : (
                      <StarOff className="w-5 h-5" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => handleRemove(index)}
                    title="Remove image"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              {image.isFeature && (
                <div className="absolute top-2 right-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
