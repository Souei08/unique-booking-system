"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import { Tour } from "@/app/_features/tours/tour-types";
import { updateTourClient } from "../api/client/updateTourClient";
import { TourStatusBadge } from "./TourStatusBadge";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const statusSchema = z.object({
  status: z.enum(["active", "inactive", "draft"]).default("active"),
});

type StatusFormValues = z.infer<typeof statusSchema>;

interface TourStatusUpdateModalProps {
  tour: Tour;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function TourStatusUpdateModal({
  tour,
  isOpen,
  onClose,
  onSuccess,
}: TourStatusUpdateModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<StatusFormValues>({
    resolver: zodResolver(statusSchema),
    defaultValues: {
      status: (tour.status as "active" | "inactive" | "draft") || "active",
    },
  });

  const onSubmit = async (data: StatusFormValues) => {
    setIsSubmitting(true);
    try {
      await updateTourClient(tour.id, {
        status: data.status,
      });

      toast.success(`Tour status updated to ${data.status}`);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error updating tour status:", error);
      toast.error("Failed to update tour status");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            Update Tour Status
            <TourStatusBadge status={tour.status} />
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Update the status for "{tour.title}"
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Select Status
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="space-y-4"
                    >
                      <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        <RadioGroupItem value="active" id="status-active" />
                        <label htmlFor="status-active" className="flex items-center space-x-3 cursor-pointer flex-1">
                          <TourStatusBadge status="active" />
                          <div>
                            <div className="font-medium text-gray-900">Active</div>
                            <div className="text-sm text-gray-500">Tour is available for booking</div>
                          </div>
                        </label>
                      </div>

                      <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        <RadioGroupItem value="inactive" id="status-inactive" />
                        <label htmlFor="status-inactive" className="flex items-center space-x-3 cursor-pointer flex-1">
                          <TourStatusBadge status="inactive" />
                          <div>
                            <div className="font-medium text-gray-900">Inactive</div>
                            <div className="text-sm text-gray-500">Tour is temporarily unavailable</div>
                          </div>
                        </label>
                      </div>

                      <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        <RadioGroupItem value="draft" id="status-draft" />
                        <label htmlFor="status-draft" className="flex items-center space-x-3 cursor-pointer flex-1">
                          <TourStatusBadge status="draft" />
                          <div>
                            <div className="font-medium text-gray-900">Draft</div>
                            <div className="text-sm text-gray-500">Tour is in development and not ready for booking</div>
                          </div>
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Status"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 