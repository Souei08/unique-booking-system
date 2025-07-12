"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
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
import { AlertCircle } from "lucide-react";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { showErrorToast, showSuccessToast } from "@/utils/toastUtils";
import { inviteUserServerAction } from "../api/inviteUserRole";
import CustomPhoneInput from "@/app/_components/common/PhoneInput";

const userFormSchema = z.object({
  first_name: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  last_name: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  role: z.enum(["reservation_agent", "reseller", "ADMIN"], {
    required_error: "Please select a role.",
  }),
  phone_number: z.string().optional(),
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
      first_name: "",
      last_name: "",
      email: "",
      role: undefined,
      phone_number: "",
    },
  });

  async function onSubmit(data: UserFormValues) {
    try {
      const res = await inviteUserServerAction(data);

      console.log(res);

      if (res.success === false) {
        showErrorToast(res.error || "Failed to send invitation.");

        // Set form errors based on the response
        if (res.error) {
          // If there's a specific field error, you can set it like this:
          // form.setError("email", { message: res.error });

          // For now, setting a general form error
          form.setError("root", {
            message: res.error || "Failed to send invitation.",
          });
        }

        return false;
      }

      showSuccessToast("Invitation sent successfully!");
      form.reset(); // Reset form on success
      onSuccess?.();
    } catch (error: any) {
      console.error("Error sending invite:", error);
      showErrorToast(error.message || "Failed to send invitation.");

      // Set form error for caught exceptions
      form.setError("root", {
        message: error.message || "Failed to send invitation.",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter first name"
                    {...field}
                    className={
                      form.formState.errors.root
                        ? "border-destructive text-destructive"
                        : ""
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter last name"
                    {...field}
                    className={
                      form.formState.errors.root
                        ? "border-destructive text-destructive"
                        : ""
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
                  className={
                    form.formState.errors.root
                      ? "border-destructive text-red-500"
                      : ""
                  }
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
                  <SelectTrigger
                    className={
                      form.formState.errors.root
                        ? "border-destructive text-destructive"
                        : ""
                    }
                  >
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

        <FormField
          control={form.control}
          name="phone_number"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Controller
                  name="phone_number"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <CustomPhoneInput
                      value={field.value || ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={fieldState.error?.message}
                    />
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Display root form errors */}
        {form.formState.errors.root && (
          <div className="flex items-center gap-2 p-3 text-sm border border-destructive bg-destructive/10 text-destructive rounded-md">
            <AlertCircle className="h-4 w-4" />
            <span>{form.formState.errors.root.message}</span>
          </div>
        )}

        <Button type="submit" className="w-full">
          Send Invitation
        </Button>
      </form>
    </Form>
  );
}
