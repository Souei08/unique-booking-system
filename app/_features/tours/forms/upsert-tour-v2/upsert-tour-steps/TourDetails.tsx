import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Users,
  Clock,
  UserMinus,
  UserPlus,
  Calendar,
  Timer,
  Settings,
} from "lucide-react";
import { NumberInput } from "@/components/ui/number-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TourDetailsProps {
  form: UseFormReturn<any>;
  title?: string;
  description?: string;
}

const TourDetails: React.FC<TourDetailsProps> = ({
  form,
  title = "Tour Configuration",
  description = "Configure the capacity and timing for your tour",
}) => {
  return (
    <div className="space-y-8">
      {/* Capacity & Duration Section */}
      <Card className="border border-gray-200 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Capacity & Duration
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Set the total capacity and tour duration
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="slots"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Available Slots <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormDescription className="text-xs text-gray-500 mb-3">
                    Total number of slots available for booking
                  </FormDescription>
                  <FormControl>
                    <NumberInput
                      value={field.value ?? 1}
                      onValueChange={field.onChange}
                      min={1}
                      stepper={1}
                      className="w-full h-12 pl-10"
                      startIcon={<Calendar className="w-4 h-4" />}
                    />
                  </FormControl>
                  <div className="min-h-[20px]">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Duration (hours) <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormDescription className="text-xs text-gray-500 mb-3">
                    How long will the tour last?
                  </FormDescription>
                  <FormControl>
                    <NumberInput
                      value={field.value ?? 1}
                      onValueChange={field.onChange}
                      min={1}
                      stepper={1}
                      className="w-full h-12 pl-10"
                      startIcon={<Timer className="w-4 h-4" />}
                    />
                  </FormControl>
                  <div className="min-h-[20px]">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Group Size Settings Section */}
      <Card className="border border-gray-200 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Group Size Limits
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Define minimum and maximum group sizes
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="min_group_size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Minimum Group Size <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormDescription className="text-xs text-gray-500 mb-3">
                    Minimum people required to book this tour
                  </FormDescription>
                  <FormControl>
                    <NumberInput
                      value={field.value ?? 1}
                      onValueChange={field.onChange}
                      min={1}
                      stepper={1}
                      className="w-full h-12 pl-10"
                      startIcon={<UserMinus className="w-4 h-4" />}
                    />
                  </FormControl>
                  <div className="min-h-[20px]">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="group_size_limit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Maximum Group Size <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormDescription className="text-xs text-gray-500 mb-3">
                    Maximum people allowed per tour
                  </FormDescription>
                  <FormControl>
                    <NumberInput
                      value={field.value ?? 1}
                      onValueChange={field.onChange}
                      min={1}
                      stepper={1}
                      className="w-full h-12 pl-10"
                      startIcon={<UserPlus className="w-4 h-4" />}
                    />
                  </FormControl>
                  <div className="min-h-[20px]">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TourDetails;
