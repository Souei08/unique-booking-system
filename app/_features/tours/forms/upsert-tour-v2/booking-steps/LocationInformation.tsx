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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LocationInformationProps {
  form: UseFormReturn<any>;
}

const LocationInformation: React.FC<LocationInformationProps> = ({ form }) => {
  return (
    <Card>
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl font-bold text-strong  gap-3">
          Location Information
        </CardTitle>
        <p className="text-sm  text-weak">
          Specify where the tour starts and ends.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="meeting_point_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  htmlFor="meeting_point_address"
                  className="text-strong font-semibold"
                >
                  Meeting Point
                </FormLabel>
                <FormControl>
                  <Textarea
                    id="meeting_point_address"
                    placeholder="Enter meeting location address"
                    className="min-h-[100px] text-strong resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dropoff_point_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  htmlFor="dropoff_point_address"
                  className="text-strong font-semibold"
                >
                  Dropoff Point
                </FormLabel>
                <FormControl>
                  <Textarea
                    id="dropoff_point_address"
                    placeholder="Enter dropoff location address"
                    className="min-h-[100px] text-strong resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationInformation;
