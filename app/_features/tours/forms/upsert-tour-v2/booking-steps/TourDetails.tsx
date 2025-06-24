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
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TourDetailsProps {
  form: UseFormReturn<any>;
}

const TourDetails: React.FC<TourDetailsProps> = ({ form }) => {
  return (
    <Card>
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl font-bold text-strong  gap-3">
          Tour Details
        </CardTitle>
        <p className="text-sm  text-weak">
          Specify the practical details of your tour.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  htmlFor="duration"
                  className="flex items-center gap-2 text-strong font-semibold"
                >
                  Duration
                  <span className="text-sm  text-weak">(in hours)</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      id="duration"
                      type="number"
                      step="0.5"
                      placeholder="e.g., 2.5"
                      className="pr-12 text-strong"
                      value={field.value === null ? "" : field.value}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "") {
                          field.onChange(null);
                        } else {
                          const numValue = Number(value);
                          field.onChange(isNaN(numValue) ? null : numValue);
                        }
                      }}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className=" text-weak">hrs</span>
                    </div>
                  </div>
                </FormControl>
                <FormDescription className="text-weak">
                  How long will the tour last? Enter the duration in hours.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="group_size_limit"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  htmlFor="group_size_limit"
                  className="flex items-center gap-2 text-strong font-semibold"
                >
                  Maximum Group Size
                  <span className="text-sm  text-weak">(per tour)</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      id="group_size_limit"
                      type="number"
                      placeholder="e.g., 10"
                      className="pr-12 text-strong"
                      value={field.value === null ? "" : field.value}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "") {
                          field.onChange(null);
                        } else {
                          const numValue = Number(value);
                          field.onChange(isNaN(numValue) ? null : numValue);
                        }
                      }}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className=" text-weak">people</span>
                    </div>
                  </div>
                </FormControl>
                <FormDescription className="text-weak">
                  What's the maximum number of people allowed per tour?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TourDetails;
