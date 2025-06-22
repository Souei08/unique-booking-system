"use client";

import React from "react";
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
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createPromo } from "../api/createPromo";

const formSchema = z.object({
  code: z.string().min(1, "Promo code is required"),
  discount_type: z.enum(["percentage", "fixed"], {
    required_error: "Please select a discount type",
  }),
  discount_value: z.string().min(1, "Discount value is required"),
  expires_at: z.string().min(1, "Expiry date is required"),
  max_uses: z.string().min(1, "Max uses is required"),
  is_active: z.boolean().default(true),
});

interface CreatePromoProps {
  onSuccess?: () => void;
}

export default function CreatePromo({ onSuccess }: CreatePromoProps) {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      discount_type: "percentage",
      discount_value: "",
      expires_at: "",
      max_uses: "",
      is_active: true,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // ✅ Fix: map discount_type to match Stripe's expected values
      const payload = {
        ...values,
        discount_type:
          values.discount_type === "fixed"
            ? "fixed_amount"
            : values.discount_type,
        discount_value: parseFloat(values.discount_value),
        max_uses: parseInt(values.max_uses),
      };

      const res = await fetch("/api/create-promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error((await res.json()).error || "Failed to create promo");
      }

      // ✅ Success actions: show toast, reset form, refresh page, call callback
      toast.success("Promo created successfully");
      form.reset();
      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error("Error creating promo:", error);
      toast.error("Failed to create promo");
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Promo Code</FormLabel>
              <FormControl>
                <Input placeholder="Enter promo code" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="discount_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discount Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
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

        <FormField
          control={form.control}
          name="discount_value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discount Value</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter discount value"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expires_at"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expiry Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="max_uses"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Uses</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter maximum number of uses"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Create Promo
        </Button>
      </form>
    </Form>
  );
}
