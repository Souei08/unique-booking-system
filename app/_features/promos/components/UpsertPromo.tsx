"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Promo } from "../types/promo-types";

const formSchema = z
  .object({
    code: z
      .string()
      .min(1, "Promo code is required")
      .regex(
        /^[A-Z0-9_-]+$/,
        "Promo code can only contain uppercase letters, numbers, hyphens, and underscores"
      )
      .regex(/^[^ ]*$/, "Promo code cannot contain spaces"),
    discount_type: z.enum(["percentage", "fixed"], {
      required_error: "Please select a discount type",
    }),
    discount_value: z.string().min(1, "Discount value is required"),
    expires_at: z.date({
      required_error: "Expiry date is required.",
    }),
    max_uses: z.string().optional(),
    is_unlimited: z.enum(["limited", "unlimited"]).default("limited"),
    is_active: z.boolean().default(true),
  })
  .refine(
    (data) => {
      // If unlimited is selected, max_uses should be empty/null
      if (data.is_unlimited === "unlimited") {
        return true; // No validation needed for max_uses
      }
      // If limited is selected, max_uses should be required and valid
      if (data.is_unlimited === "limited") {
        return (
          data.max_uses &&
          data.max_uses.trim() !== "" &&
          !isNaN(Number(data.max_uses)) &&
          Number(data.max_uses) > 0
        );
      }
      return false;
    },
    {
      message:
        "Max uses is required and must be a positive number when limited usage is selected",
      path: ["max_uses"],
    }
  )
  .refine(
    (data) => {
      // Validate that expiry date is in the future (not today or past)
      if (!data.expires_at) return false;

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of today

      const expiryDate = new Date(data.expires_at);
      expiryDate.setHours(0, 0, 0, 0); // Set to start of expiry date

      return expiryDate > today;
    },
    {
      message: "Expiry date must be in the future (not today or past)",
      path: ["expires_at"],
    }
  );

interface UpsertPromoProps {
  promo?: Promo; // Optional - if provided, we're updating
  onSuccess?: () => void;
}

export default function UpsertPromo({ promo, onSuccess }: UpsertPromoProps) {
  const router = useRouter();
  const isEditing = !!promo;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: promo?.code || "",
      discount_type: (promo?.discount_type === "fixed_amount"
        ? "fixed"
        : "percentage") as "percentage" | "fixed",
      discount_value: promo?.discount_value?.toString() || "",
      expires_at: promo?.expires_at ? new Date(promo.expires_at) : undefined,
      max_uses: promo?.max_uses?.toString() || "",
      is_unlimited: promo?.max_uses === null ? "unlimited" : "limited",
      is_active: promo?.is_active ?? true,
    },
  });

  const watchDiscountType = form.watch("discount_type");
  const watchIsUnlimited =
    form.watch("is_unlimited") === "unlimited" ||
    promo?.max_uses === null ||
    promo?.max_uses === 0;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // Validate discount value based on type
      const discountValue = parseFloat(values.discount_value);
      if (values.discount_type === "percentage") {
        if (discountValue < 1 || discountValue > 100) {
          toast.error("Percentage must be between 1% and 100%");
          return;
        }
      } else {
        if (discountValue <= 0) {
          toast.error("Amount must be greater than 0");
          return;
        }
      }

      // ✅ Fix: map discount_type to match Stripe's expected values
      const payload: any = {
        ...values,
        discount_type:
          values.discount_type === "fixed"
            ? "fixed_amount"
            : values.discount_type,
        discount_value: discountValue,
        expires_at: values.expires_at.toISOString(),
        max_uses:
          values.is_unlimited === "unlimited"
            ? null
            : parseInt(values.max_uses || "0"),
      };

      // Use appropriate API endpoint based on whether we're editing or creating
      const apiEndpoint = isEditing ? "/api/update-promo" : "/api/upsert-promo";

      // Add promo ID to payload if editing
      if (isEditing && promo) {
        payload.id = promo.id;
      }

      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();

        // Handle duplicate promo code error specifically
        if (
          res.status === 409 &&
          errorData.error === "Promo code already exists"
        ) {
          toast.error(
            `Promo code "${values.code.toUpperCase()}" already exists. Please use a different code.`
          );
          return;
        }

        throw new Error(errorData.error || "Failed to upsert promo");
      }

      // ✅ Success actions: show toast, reset form, refresh page, call callback
      toast.success(
        isEditing ? "Promo updated successfully" : "Promo created successfully"
      );
      form.reset();
      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error("Error upserting promo:", error);
      toast.error(
        isEditing ? "Failed to update promo" : "Failed to create promo"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Promo Code - Full Width */}
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Promo Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter promo code (e.g., SAVE20, WELCOME-2024)"
                      {...field}
                      disabled={isEditing || isSubmitting}
                      onChange={(e) => {
                        // Remove spaces and convert to uppercase
                        const value = e.target.value
                          .replace(/\s/g, "")
                          .toUpperCase();
                        field.onChange(value);
                      }}
                      onKeyDown={(e) => {
                        // Prevent space key from being entered
                        if (e.key === " ") {
                          e.preventDefault();
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Discount Type */}
          <FormField
            control={form.control}
            name="discount_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select discount type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Discount Value */}
          <FormField
            control={form.control}
            name="discount_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Value</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      min={watchDiscountType === "percentage" ? "1" : "0.01"}
                      max={
                        watchDiscountType === "percentage" ? "100" : undefined
                      }
                      step={watchDiscountType === "percentage" ? "1" : "0.01"}
                      placeholder={
                        watchDiscountType === "percentage"
                          ? "Enter percentage (1-100)"
                          : "Enter amount"
                      }
                      {...field}
                      disabled={isSubmitting}
                    />
                    {watchDiscountType === "percentage" && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="text-gray-500 text-sm">%</span>
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Expiry Date - Full Width */}
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="expires_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date</FormLabel>
                  <FormControl className="w-full">
                    <Input
                      type="date"
                      value={
                        field.value
                          ? new Date(field.value).toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) => {
                        const date = e.target.value
                          ? new Date(e.target.value)
                          : undefined;
                        field.onChange(date);
                      }}
                      min={(() => {
                        // Set minimum date to tomorrow
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        return tomorrow.toISOString().split("T")[0];
                      })()}
                      placeholder="Pick a date"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Usage Limit Options */}
        <FormField
          control={form.control}
          name="is_unlimited"
          render={({ field }) => (
            <FormItem className="space-y-3 mb-9">
              <FormLabel>Usage Limit</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={
                    promo?.max_uses === null || promo?.max_uses === 0
                      ? "unlimited"
                      : "limited"
                  }
                  className="flex flex-col space-y-1"
                  disabled={isSubmitting}
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="limited" />
                    </FormControl>
                    <FormLabel className="font-normal">Limited uses</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="unlimited" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Unlimited uses
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Max Uses - Only show when limited is selected */}
        {!watchIsUnlimited && (
          <FormField
            control={form.control}
            name="max_uses"
            render={({ field }) => (
              <FormItem className="mb-2">
                <FormLabel>Usage Limit</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Enter maximum number of uses"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button
          type="submit"
          className="w-full mt-4 cursor-pointer"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {isEditing ? "Updating..." : "Creating..."}
            </div>
          ) : isEditing ? (
            "Update Promo"
          ) : (
            "Create Promo"
          )}
        </Button>
      </form>
    </Form>
  );
}
