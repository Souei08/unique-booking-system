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

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  last_login?: string;
  avatar_url?: string;
}

const userFormSchema = z.object({
  id: z.string().optional(),
  full_name: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  role: z.enum(["RESERVATION_AGENT", "RESELLER", "ADMIN"], {
    required_error: "Please select a role.",
  }),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UpsertUserProps {
  initialData?: User;
  onSuccess?: () => void;
  mode?: "create" | "update";
}

export function UpsertUser({
  initialData,
  onSuccess,
  mode = "create",
}: UpsertUserProps) {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: initialData
      ? {
          id: initialData.id,
          full_name: initialData.full_name,
          email: initialData.email,
          role: initialData.role as "RESERVATION_AGENT" | "RESELLER" | "ADMIN",
        }
      : {
          full_name: "",
          email: "",
          role: undefined,
        },
  });

  async function onSubmit(data: UserFormValues) {
    try {
      // TODO: Implement the API call to create/update user
      console.log("Upserting user:", data);
      onSuccess?.();
    } catch (error) {
      console.error("Error upserting user:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  placeholder="Enter email address"
                  type="email"
                  {...field}
                  disabled={mode === "update"} // Email cannot be changed after creation
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
                  <SelectItem value="RESERVATION_AGENT">
                    Reservation Agent
                  </SelectItem>
                  <SelectItem value="RESELLER">Reseller</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {mode === "create" ? "Create User" : "Update User"}
        </Button>
      </form>
    </Form>
  );
}
