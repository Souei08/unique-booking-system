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
import { updatePromo } from "../api/updatePromo";
import { Promo } from "../types/promo-types";

const formSchema = z.object({
  code: z.string().min(1, "Promo code is required"),
  discount_type: z.enum(["percentage", "fixed_amount"], {
    required_error: "Please select a discount type",
  }),
  discount_value: z.string().min(1, "Discount value is required"),
  expires_at: z.string().min(1, "Expiry date is required"),
  max_uses: z.string().min(1, "Max uses is required"),
  is_active: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface UpdatePromoProps {
  promo: Promo;
  onSuccess?: () => void;
}

export default function UpdatePromo({ promo, onSuccess }: UpdatePromoProps) {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: promo.code,
      discount_type: promo.discount_type as "percentage" | "fixed_amount",
      discount_value: promo.discount_value.toString(),
      expires_at: new Date(promo.expires_at).toISOString().split("T")[0],
      max_uses: promo.max_uses.toString(),
      is_active: promo.is_active,
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await updatePromo(promo.id, {
        ...values,
        discount_value: parseFloat(values.discount_value),
        max_uses: parseInt(values.max_uses),
      });

      toast.success("Promo updated successfully");
      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error("Error updating promo:", error);
      toast.error("Failed to update promo");
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
                  <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
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
          Update Promo
        </Button>
      </form>
    </Form>
  );
}
