"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { X, Star, StarOff } from "lucide-react";

interface ImageUploadInputProps {
  value?: { url: string; isFeature: boolean }[];
  onChange?: (images: { url: string; isFeature: boolean }[]) => void;
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
}: ImageUploadInputProps) {
  const [images, setImages] =
    useState<{ url: string; isFeature: boolean }[]>(value);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newImages = acceptedFiles.map((file) => ({
        url: URL.createObjectURL(file),
        isFeature: false,
      }));

      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      onChange?.(updatedImages);
    },
    [images, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    multiple,
    maxFiles,
  });

  const handleRemoveImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onChange?.(updatedImages);
  };

  const handleSetFeatureImage = (index: number) => {
    const updatedImages = images.map((img, i) => ({
      ...img,
      isFeature: i === index,
    }));
    setImages(updatedImages);
    onChange?.(updatedImages);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {isDragActive
              ? "Drop the images here"
              : "Drag & drop images here, or click to select"}
          </p>
          <Button variant="outline" size="sm">
            Select Images
          </Button>
        </div>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square relative rounded-lg overflow-hidden">
                <Image
                  src={image.url}
                  alt={`Uploaded image ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:text-white hover:bg-white/20"
                    onClick={() => handleSetFeatureImage(index)}
                  >
                    {image.isFeature ? (
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ) : (
                      <StarOff className="h-5 w-5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:text-white hover:bg-white/20"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              {image.isFeature && (
                <div className="absolute top-2 right-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
