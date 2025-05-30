"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { showErrorToast, showSuccessToast } from "@/utils/toastUtils";
import { inviteUserServerAction } from "../api/inviteUserRole";

const userFormSchema = z.object({
  full_name: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  role: z.enum(["reservation_agent", "reseller", "ADMIN"], {
    required_error: "Please select a role.",
  }),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UpsertUserProps {
  onSuccess?: () => void;
}

export function UpsertUser({ onSuccess }: UpsertUserProps) {
  const supabase = createClientComponentClient();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      full_name: "",
      email: "",
      role: undefined,
    },
  });

  async function onSubmit(data: UserFormValues) {
    try {
      const res = await inviteUserServerAction(data);

      console.log(res);

      if (!res.success) {
        throw new Error(res.error || "Failed to invite user");
      }

      showSuccessToast("Invitation sent successfully!");
      onSuccess?.();
    } catch (error: any) {
      console.error("Error sending invite:", error);
      showErrorToast(error.message || "Failed to send invitation.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-5">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="reservation_agent">
                    Reservation Agent
                  </SelectItem>
                  <SelectItem value="reseller">
                    Reseller/Hotel Partners
                  </SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Send Invitation
        </Button>
      </form>
    </Form>
  );
}
