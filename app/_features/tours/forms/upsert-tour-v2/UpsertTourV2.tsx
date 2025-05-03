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

import { Tour, CreateTourDTO, TourLocalImage } from "../../types/TourTypes";

import { X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ImageUploadInput } from "./ImageUploadInput";

import { updateTourClient } from "../../actions/client/updateTourClient";
import { createTourClient } from "../../actions/client/createTourClient";
import { uploadImagesToSupabase } from "../../actions/client/uploadTourImages";
import { deleteRemovedImages } from "../../actions/client/deleteTourImages";
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
  // images: z.string().min(1, "At least one image is required"),
});

type TourFormValues = z.infer<typeof tourFormSchema>;

interface UpsertTourV2Props {
  initialData?: Tour;
  onSuccess?: () => void;
}

const UpsertTourV2: React.FC<UpsertTourV2Props> = ({
  initialData,
  onSuccess,
}) => {
  const router = useRouter();
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
      // images: initialData?.images || "[]",
    },
  });

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

  // const handleSubmit = async (data: TourFormValues) => {
  //   try {
  //     // Validate required arrays are not empty
  //     if (!data.languages || data.languages.length === 0) {
  //       toast.error("At least one language is required");
  //       return;
  //     }
  //     if (!data.trip_highlights || data.trip_highlights.length === 0) {
  //       toast.error("At least one trip highlight is required");
  //       return;
  //     }
  //     if (!data.includes || data.includes.length === 0) {
  //       toast.error("At least one inclusion is required");
  //       return;
  //     }
  //     if (!data.faq || data.faq.length === 0) {
  //       toast.error("At least one FAQ is required");
  //       return;
  //     }

  //     // Filter out empty strings from arrays and stringify FAQ objects
  //     const cleanedData: CreateTourDTO = {
  //       ...data,
  //       languages: data.languages.filter(Boolean),
  //       trip_highlights: data.trip_highlights.filter(Boolean),
  //       includes: data.includes.filter(Boolean),
  //       faq: data.faq
  //         .filter((f) => f.question && f.answer)
  //         .map((f) => JSON.stringify(f)),
  //       // images: "[]", // Temporarily empty
  //     };

  //     if (initialData?.id) {
  //       // Handle update
  //       await updateTourClient(initialData.id, cleanedData);
  //       toast.success("Tour updated successfully");
  //     } else {
  //       await createTourClient(cleanedData);
  //       toast.success("Tour created successfully");
  //     }

  //     router.refresh();
  //     onSuccess?.();
  //   } catch (error) {
  //     console.error("Error submitting form:", error);
  //     toast.error(
  //       error instanceof Error ? error.message : "Failed to submit form"
  //     );
  //   }
  // };

  const addItem = (field: keyof TourFormValues) => {
    const currentValue = form.getValues(field) as any[];
    if (field === "faq") {
      form.setValue(field, [...currentValue, { question: "", answer: "" }]);
    } else {
      form.setValue(field, [...currentValue, ""]);
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

  return (
    <div className="w-full mt-5">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="title">Title</FormLabel>
                  <FormControl>
                    <Input
                      id="title"
                      placeholder="Enter tour title"
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
                  <FormLabel htmlFor="category">Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger id="category" aria-label="Select category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="horseback_riding">
                        Horseback Riding
                      </SelectItem>
                      <SelectItem value="jet_ski_tour">Jet Ski Tour</SelectItem>
                      <SelectItem value="safari_tour_and_snorkeling">
                        Safari Tour and Snorkeling
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="duration">Duration (hours)</FormLabel>
                  <FormControl>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="Enter duration in hours"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
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
                    Group Size Limit
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="group_size_limit"
                      type="number"
                      placeholder="Enter group size limit"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
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
                  <FormLabel htmlFor="rate">Rate (USD)</FormLabel>
                  <FormControl>
                    <Input
                      id="rate"
                      type="number"
                      placeholder="Enter rate in USD"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slots"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="slots">Available Slots</FormLabel>
                  <FormControl>
                    <Input
                      id="slots"
                      type="number"
                      placeholder="Enter available slots"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
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
                <FormLabel htmlFor="description">Description</FormLabel>
                <FormControl>
                  <Textarea
                    id="description"
                    placeholder="Enter tour description"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                      placeholder="Enter meeting point address"
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
                      placeholder="Enter dropoff point address"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="things_to_know"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="things_to_know">Things to Know</FormLabel>
                <FormControl>
                  <Textarea
                    id="things_to_know"
                    placeholder="Enter things to know"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Languages */}
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
                          aria-label={`Language ${index + 1}`}
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
                          aria-label={`Remove language ${index + 1}`}
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

          {/* Trip Highlights */}
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
                          aria-label={`Trip highlight ${index + 1}`}
                          value={item}
                          onChange={(e) =>
                            updateItem("trip_highlights", index, e.target.value)
                          }
                          placeholder="Enter trip highlight"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Remove trip highlight ${index + 1}`}
                          onClick={() => removeItem("trip_highlights", index)}
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

          {/* Includes */}
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
                          aria-label={`Inclusion ${index + 1}`}
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
                          aria-label={`Remove inclusion ${index + 1}`}
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

          {/* FAQ */}
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
                        className="space-y-2 border rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 space-y-2">
                            <div className="mb-5">
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
                            <div className="mb-5">
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

          {/* Image Upload Section */}
          <div className="space-y-4">
            <ImageUploadInput
              value={currentImages}
              onChange={handleImagesChange}
              label="Upload Tour Images"
              multiple={true}
              maxFiles={10}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? "Submitting..."
                : initialData
                ? "Update Tour"
                : "Create Tour"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default UpsertTourV2;
