import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tour,
  CreateTourDTO,
  TourLocalImage,
} from "@/app/_features/tours/tour-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { X, Info, ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ImageUploadInput } from "./ImageUploadInput";
import { cn } from "@/lib/utils";
// import { Progress } from "@/components/ui/progress";

import { updateTourClient } from "../../api/client/updateTourClient";
import { createTourClient } from "../../api/client/createTourClient";
import { uploadImagesToSupabase } from "../../api/client/uploadTourImages";
import { deleteRemovedImages } from "../../api/client/deleteTourImages";
import { createClient } from "@/supabase/client";

const tourFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  duration: z.number().min(1, "Duration must be at least 1 hour"),
  group_size_limit: z.number().min(1, "Group size must be at least 1"),
  rate: z.number().min(0, "Rate must be a positive number"),
  slots: z.number().min(1, "Slots must be at least 1"),
  meeting_point_address: z.string().min(1, "Meeting point is required"),
  dropoff_point_address: z.string().min(1, "Dropoff point is required"),
  languages: z.array(z.string()).min(1, "At least one language is required"),
  trip_highlights: z
    .array(z.string())
    .min(1, "At least one highlight is required"),
  things_to_know: z.string().min(1, "Things to know is required"),
  includes: z.array(z.string()).min(1, "At least one inclusion is required"),
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
        price: z.number().min(0, "Price must be a positive number"),
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
  // images: z.string().min(1, "At least one image is required"),
});

type TourFormValues = z.infer<typeof tourFormSchema>;

interface UpsertTourV2Props {
  initialData?: Tour;
  onSuccess?: () => void;
}

const steps = [
  {
    id: "basic",
    title: "Basic Information",
    description: "Enter the essential details about your tour",
  },
  {
    id: "pricing",
    title: "Pricing & Capacity",
    description: "Set up your tour's pricing and capacity",
  },
  {
    id: "location",
    title: "Location Details",
    description: "Specify where your tour starts and ends",
  },
  {
    id: "features",
    title: "Tour Features",
    description: "Add languages, highlights, and inclusions",
  },
  {
    id: "additional",
    title: "Additional Information",
    description: "Add important details and FAQs",
  },
  {
    id: "images",
    title: "Tour Images",
    description: "Upload images to showcase your tour",
  },
];

const UpsertTourV2: React.FC<UpsertTourV2Props> = ({
  initialData,
  onSuccess,
}) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [currentImages, setCurrentImages] = useState<TourLocalImage[]>(
    initialData?.images
      ? JSON.parse(initialData.images).map((img: any) => ({
          url: img.url,
          isFeature: img.isFeatured ?? false,
        }))
      : []
  );

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
      duration: initialData?.duration || 1,
      group_size_limit: initialData?.group_size_limit || 1,
      rate: initialData?.rate || 0,
      slots: initialData?.slots || 1,
      meeting_point_address: initialData?.meeting_point_address || "",
      dropoff_point_address: initialData?.dropoff_point_address || "",
      languages: Array.isArray(initialData?.languages)
        ? initialData.languages
        : [""],
      trip_highlights: Array.isArray(initialData?.trip_highlights)
        ? initialData.trip_highlights
        : [""],
      things_to_know: initialData?.things_to_know || "",
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
      // images: initialData?.images || "[]",
    },
  });

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleImagesChange = (images: TourLocalImage[]) => {
    setCurrentImages(images);
  };

  const handleSubmit = async (formData: TourFormValues) => {
    const oldImages = currentImages;
    let uploaded: { url: string; isFeature: boolean }[] = [];
    let tourId: string | undefined = undefined;

    try {
      // Clean form data
      const cleanedData: CreateTourDTO = {
        ...formData,
        languages: formData.languages.filter(Boolean),
        trip_highlights: formData.trip_highlights.filter(Boolean),
        includes: formData.includes.filter(Boolean),
        faq: formData.faq
          .filter((f) => f.question && f.answer)
          .map((f) => JSON.stringify(f)),
        custom_slot_types: formData.custom_slot_types
          ? JSON.stringify(formData.custom_slot_types)
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
        images: JSON.stringify(uploaded), // ✅ store as string in text column
      });

      // Step 4: Delete removed images from storage
      await deleteRemovedImages(originalImages, uploaded);

      toast.success("Tour saved successfully");
      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error("Tour save failed:", error);
      toast.error("Something went wrong while saving the tour.");

      // 🔁 Rollback uploaded images if save failed
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
    } else {
      form.setValue(field, newValue.length > 0 ? newValue : [""]);
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Basic Information
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Enter the essential details about your tour.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="title">Tour Title</FormLabel>
                      <FormControl>
                        <Input
                          id="title"
                          placeholder="Enter a descriptive title for your tour"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="category">Tour Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger id="category">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="horseback_riding">
                            Horseback Riding
                          </SelectItem>
                          <SelectItem value="jet_ski_tour">
                            Jet Ski Tour
                          </SelectItem>
                          <SelectItem value="safari_tour_and_snorkeling">
                            Safari Tour and Snorkeling
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="description">
                      Tour Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        id="description"
                        placeholder="Provide a detailed description of your tour experience"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Pricing & Capacity
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Set up your tour's capacity and pricing structure.
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Basic Slot Settings */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Basic Settings</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="duration">
                          Duration (hours)
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              id="duration"
                              type="number"
                              min="1"
                              step="0.5"
                              placeholder="e.g., 2.5"
                              className="pr-12"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <span className="text-muted-foreground">hrs</span>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="group_size_limit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="group_size_limit">
                          Maximum Group Size
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              id="group_size_limit"
                              type="number"
                              min="1"
                              placeholder="e.g., 10"
                              className="pr-12"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <span className="text-muted-foreground">
                                people
                              </span>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator className="my-6" />

              {/* Slot Configuration */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Slot Configuration</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="slots"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="slots">Available Slots</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              id="slots"
                              type="number"
                              min="1"
                              placeholder="e.g., 20"
                              className="pr-12"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <span className="text-muted-foreground">
                                slots
                              </span>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="rate">Base Rate</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              id="rate"
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="e.g., 99.99"
                              className="pl-8 pr-12"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <span className="text-muted-foreground">$</span>
                            </div>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <span className="text-muted-foreground">USD</span>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator className="my-6" />

              {/* Custom Slot Types */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">
                    Pricing Tiers (Optional)
                  </h3>
                </div>
                <FormField
                  control={form.control}
                  name="custom_slot_types"
                  render={({ field }) => {
                    const value = Array.isArray(field.value) ? field.value : [];
                    return (
                      <FormItem>
                        <FormDescription className="mb-4">
                          Create different pricing tiers for your tour. For
                          example: Adult ($100), Child ($50), Senior ($75). If
                          you only need a single price, you can skip this
                          section.
                        </FormDescription>
                        <div className="space-y-4">
                          {value.map((type, index) => (
                            <div
                              key={index}
                              className="space-y-2 border rounded-lg p-4 bg-muted/50"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1 space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <FormLabel>Name</FormLabel>
                                      <Input
                                        value={type.name || ""}
                                        onChange={(e) =>
                                          updateItem(
                                            "custom_slot_types",
                                            index,
                                            {
                                              ...type,
                                              name: e.target.value,
                                            }
                                          )
                                        }
                                        placeholder="e.g., Adult, Child, Senior"
                                      />
                                    </div>
                                    <div>
                                      <FormLabel>Price</FormLabel>
                                      <div className="relative">
                                        <Input
                                          type="number"
                                          min="0"
                                          step="0.01"
                                          value={type.price || 0}
                                          onChange={(e) =>
                                            updateItem(
                                              "custom_slot_types",
                                              index,
                                              {
                                                ...type,
                                                price: Number(e.target.value),
                                              }
                                            )
                                          }
                                          className="pl-8"
                                        />
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                          <span className="text-muted-foreground">
                                            $
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <FormLabel>
                                      Description (Optional)
                                    </FormLabel>
                                    <Textarea
                                      value={type.description || ""}
                                      onChange={(e) =>
                                        updateItem("custom_slot_types", index, {
                                          ...type,
                                          description: e.target.value,
                                        })
                                      }
                                      placeholder="Describe this pricing tier (e.g., 'Children under 12 years old')"
                                    />
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    removeItem("custom_slot_types", index)
                                  }
                                  className="ml-2"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              addItem("custom_slot_types", {
                                name: "",
                                price: 0,
                                description: "",
                              })
                            }
                            className="w-full"
                          >
                            Add Pricing Tier
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>

              <Separator className="my-6" />

              {/* Custom Slot Fields */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">
                    Additional Information Fields (Optional)
                  </h3>
                </div>
                <FormField
                  control={form.control}
                  name="custom_slot_fields"
                  render={({ field }) => {
                    const value = Array.isArray(field.value) ? field.value : [];
                    return (
                      <FormItem>
                        <FormDescription className="mb-4">
                          Add custom fields to collect additional information
                          from your customers. For example: dietary
                          restrictions, special requirements, or equipment
                          preferences. This section is optional.
                        </FormDescription>
                        <div className="space-y-4">
                          {value.map((field, index) => (
                            <div
                              key={index}
                              className="space-y-2 border rounded-lg p-4 bg-muted/50"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1 space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <FormLabel>Field Name</FormLabel>
                                      <Input
                                        value={field.name || ""}
                                        onChange={(e) =>
                                          updateItem(
                                            "custom_slot_fields",
                                            index,
                                            {
                                              ...field,
                                              name: e.target.value,
                                            }
                                          )
                                        }
                                        placeholder="e.g., dietary_restrictions"
                                      />
                                      <FormDescription className="mt-1">
                                        Used internally (no spaces, lowercase)
                                      </FormDescription>
                                    </div>
                                    <div>
                                      <FormLabel>Display Label</FormLabel>
                                      <Input
                                        value={field.label || ""}
                                        onChange={(e) =>
                                          updateItem(
                                            "custom_slot_fields",
                                            index,
                                            {
                                              ...field,
                                              label: e.target.value,
                                            }
                                          )
                                        }
                                        placeholder="e.g., Dietary Restrictions"
                                      />
                                      <FormDescription className="mt-1">
                                        Shown to users
                                      </FormDescription>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <FormLabel>Field Type</FormLabel>
                                      <Select
                                        value={field.type || "text"}
                                        onValueChange={(value) =>
                                          updateItem(
                                            "custom_slot_fields",
                                            index,
                                            {
                                              ...field,
                                              type: value,
                                            }
                                          )
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select field type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="text">
                                            Text
                                          </SelectItem>
                                          <SelectItem value="number">
                                            Number
                                          </SelectItem>
                                          <SelectItem value="select">
                                            Select
                                          </SelectItem>
                                          <SelectItem value="checkbox">
                                            Checkbox
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <FormLabel>
                                        Placeholder (Optional)
                                      </FormLabel>
                                      <Input
                                        value={field.placeholder || ""}
                                        onChange={(e) =>
                                          updateItem(
                                            "custom_slot_fields",
                                            index,
                                            {
                                              ...field,
                                              placeholder: e.target.value,
                                            }
                                          )
                                        }
                                        placeholder="Enter placeholder text"
                                      />
                                    </div>
                                  </div>

                                  {field.type === "select" && (
                                    <div>
                                      <FormLabel>
                                        Options (one per line)
                                      </FormLabel>
                                      <Textarea
                                        value={field.options?.join("\n") || ""}
                                        onChange={(e) =>
                                          updateItem(
                                            "custom_slot_fields",
                                            index,
                                            {
                                              ...field,
                                              options: e.target.value
                                                .split("\n")
                                                .filter(Boolean),
                                            }
                                          )
                                        }
                                        placeholder="Option 1&#10;Option 2&#10;Option 3"
                                        className="min-h-[100px]"
                                      />
                                      <FormDescription className="mt-1">
                                        Enter each option on a new line
                                      </FormDescription>
                                    </div>
                                  )}

                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      checked={field.required || false}
                                      onChange={(e) =>
                                        updateItem(
                                          "custom_slot_fields",
                                          index,
                                          {
                                            ...field,
                                            required: e.target.checked,
                                          }
                                        )
                                      }
                                      className="h-4 w-4"
                                    />
                                    <FormLabel>Required field</FormLabel>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    removeItem("custom_slot_fields", index)
                                  }
                                  className="ml-2"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              addItem("custom_slot_fields", {
                                name: "",
                                type: "text",
                                required: false,
                                label: "",
                                placeholder: "",
                              })
                            }
                            className="w-full"
                          >
                            Add Information Field
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Location Details
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Specify where your tour starts and ends.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="meeting_point_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="meeting_point_address">
                        Meeting Point
                      </FormLabel>
                      <FormControl>
                        <Input
                          id="meeting_point_address"
                          placeholder="Enter meeting location"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dropoff_point_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="dropoff_point_address">
                        Dropoff Point
                      </FormLabel>
                      <FormControl>
                        <Input
                          id="dropoff_point_address"
                          placeholder="Enter dropoff location"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Tour Features
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Add languages, highlights, and inclusions.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="languages"
                render={({ field }) => {
                  const value = Array.isArray(field.value) ? field.value : [""];
                  return (
                    <FormItem>
                      <FormLabel htmlFor="languages">Languages</FormLabel>
                      <div className="space-y-2">
                        {value.map((item, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              id={`languages-${index}`}
                              value={item}
                              onChange={(e) =>
                                updateItem("languages", index, e.target.value)
                              }
                              placeholder="Enter language"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem("languages", index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => addItem("languages")}
                        >
                          Add Language
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="trip_highlights"
                render={({ field }) => {
                  const value = Array.isArray(field.value) ? field.value : [""];
                  return (
                    <FormItem>
                      <FormLabel htmlFor="trip_highlights">
                        Trip Highlights
                      </FormLabel>
                      <div className="space-y-2">
                        {value.map((item, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              id={`trip_highlights-${index}`}
                              value={item}
                              onChange={(e) =>
                                updateItem(
                                  "trip_highlights",
                                  index,
                                  e.target.value
                                )
                              }
                              placeholder="Enter highlight"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                removeItem("trip_highlights", index)
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => addItem("trip_highlights")}
                        >
                          Add Highlight
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="includes"
                render={({ field }) => {
                  const value = Array.isArray(field.value) ? field.value : [""];
                  return (
                    <FormItem>
                      <FormLabel htmlFor="includes">What's Included</FormLabel>
                      <div className="space-y-2">
                        {value.map((item, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              id={`includes-${index}`}
                              value={item}
                              onChange={(e) =>
                                updateItem("includes", index, e.target.value)
                              }
                              placeholder="Enter inclusion"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem("includes", index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => addItem("includes")}
                        >
                          Add Inclusion
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Additional Information
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Add important details and FAQs.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="things_to_know"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="things_to_know">
                      Things to Know
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        id="things_to_know"
                        placeholder="Enter important information for participants"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="faq"
                render={({ field }) => {
                  const value = Array.isArray(field.value)
                    ? field.value
                    : [{ question: "", answer: "" }];
                  return (
                    <FormItem>
                      <FormLabel htmlFor="faq">
                        Frequently Asked Questions
                      </FormLabel>
                      <div className="space-y-4">
                        {value.map((faq, index) => (
                          <div
                            key={index}
                            className="space-y-2 border rounded-lg p-4 bg-muted/50"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1 space-y-2">
                                <div className="mb-4">
                                  <FormLabel
                                    htmlFor={`faq-question-${index}`}
                                    className="mb-2"
                                  >
                                    Question
                                  </FormLabel>
                                  <Input
                                    id={`faq-question-${index}`}
                                    value={faq.question}
                                    onChange={(e) =>
                                      updateItem("faq", index, {
                                        ...faq,
                                        question: e.target.value,
                                      })
                                    }
                                    placeholder="Enter question"
                                  />
                                </div>
                                <div>
                                  <FormLabel
                                    htmlFor={`faq-answer-${index}`}
                                    className="mb-2"
                                  >
                                    Answer
                                  </FormLabel>
                                  <Textarea
                                    id={`faq-answer-${index}`}
                                    value={faq.answer}
                                    onChange={(e) =>
                                      updateItem("faq", index, {
                                        ...faq,
                                        answer: e.target.value,
                                      })
                                    }
                                    placeholder="Enter answer"
                                    className="min-h-[100px]"
                                  />
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItem("faq", index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => addItem("faq")}
                        >
                          Add FAQ
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Tour Images
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Upload images to showcase your tour.
              </p>
            </CardHeader>
            <CardContent>
              <ImageUploadInput
                value={currentImages}
                onChange={handleImagesChange}
                label="Upload Tour Images"
                multiple={true}
                maxFiles={10}
              />
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full mx-auto mt-5 space-y-8">
      {/* Progress Steps */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "flex items-center",
                index < steps.length - 1 && "flex-1"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2",
                  currentStep >= index
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/25"
                )}
              >
                {currentStep > index ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-4",
                    currentStep > index
                      ? "bg-primary"
                      : "bg-muted-foreground/25"
                  )}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between px-4">
          {steps.map((step) => (
            <div key={step.id} className="text-sm text-center w-24">
              <div className="font-medium">{step.title}</div>
              <div className="text-xs text-muted-foreground">
                {step.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {renderStepContent()}

          <div className="flex justify-between space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            {currentStep === steps.length - 1 ? (
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "Saving..."
                  : initialData
                  ? "Update Tour"
                  : "Create Tour"}
              </Button>
            ) : (
              <Button type="button" onClick={nextStep}>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default UpsertTourV2;
