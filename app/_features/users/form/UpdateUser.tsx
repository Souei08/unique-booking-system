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

import { showErrorToast, showSuccessToast } from "@/utils/toastUtils";
import { updateUserServerAction } from "../api/updateUser";
import { User } from "../types";
import CustomPhoneInput from "@/app/_components/common/PhoneInput";

const updateUserFormSchema = z.object({
  first_name: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  last_name: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  role: z.enum(["reservation_agent", "reseller", "ADMIN"], {
    required_error: "Please select a role.",
  }),
  phone_number: z.string().optional(),
});

type UpdateUserFormValues = z.infer<typeof updateUserFormSchema>;

interface UpdateUserProps {
  user: User;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function UpdateUser({ user, onSuccess, onCancel }: UpdateUserProps) {
  const { first_name, last_name, role, phone_number } = user;

  const form = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserFormSchema),
    defaultValues: {
      first_name,
      last_name,
      role: role as "reservation_agent" | "reseller" | "ADMIN",
      phone_number: phone_number || "",
    },
  });

  async function onSubmit(data: UpdateUserFormValues) {
    try {
      const res = await updateUserServerAction({
        user_id: user.id,
        ...data,
      });

      if (res.success === false) {
        showErrorToast(res.error || "Failed to update user.");

        // Set form errors based on the response
        if (res.error) {
          form.setError("root", {
            message: res.error || "Failed to update user.",
          });
        }

        return false;
      }

      showSuccessToast("User updated successfully!");
      onSuccess?.();
    } catch (error: any) {
      console.error("Error updating user:", error);
      showErrorToast(error.message || "Failed to update user.");

      // Set form error for caught exceptions
      form.setError("root", {
        message: error.message || "Failed to update user.",
      });
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 mt-5 w-full"
      >
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

        {/* Display current email (read-only) */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Email (cannot be changed)
          </label>
          <Input
            value={user.email}
            disabled
            className="bg-gray-50 text-gray-500"
          />
        </div>

        {/* Display root form errors */}
        {form.formState.errors.root && (
          <div className="flex items-center gap-2 p-3 text-sm border border-destructive bg-destructive/10 text-destructive rounded-md">
            <AlertCircle className="h-4 w-4" />
            <span>{form.formState.errors.root.message}</span>
          </div>
        )}

        <div className="flex gap-3">
          <Button type="submit" className="flex-1">
            Update User
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
