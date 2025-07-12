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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation, Clock, Map } from "lucide-react";

interface LocationInformationProps {
  form: UseFormReturn<any>;
  title?: string;
  description?: string;
}

const LocationInformation: React.FC<LocationInformationProps> = ({
  form,
  title = "Location & Features",
  description = "Set the pickup location and add any special features or requirements for your tour",
}) => {
  return (
    <div className="space-y-8">
      {/* Pickup & Dropoff Locations Section */}
      <Card className="border border-gray-200 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Pickup & Dropoff Locations
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Set the meeting and ending points for your tour
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="meeting_point_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Meeting Point <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormDescription className="text-xs text-gray-500 mb-3">
                    The main pickup point for your tour
                  </FormDescription>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="e.g., Hotel lobby, Beach entrance"
                        className="h-12 pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <div className="min-h-[20px]">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dropoff_point_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Dropoff Point <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormDescription className="text-xs text-gray-500 mb-3">
                    Where will the tour end?
                  </FormDescription>
                  <FormControl>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="e.g., Same as pickup, Beach resort"
                        className="h-12 pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                        {...field}
                      />
                    </div>
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

      {/* Tour Features Section */}
      {/* <Card className="border border-gray-200 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Map className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Tour Features
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                List the key features and amenities included in your tour
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="features"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Tour Features
                </FormLabel>
                <FormDescription className="text-xs text-gray-500 mb-3">
                  List the key features and amenities included in your tour
                </FormDescription>
                <FormControl>
                  <div className="relative">
                    <Map className="absolute left-3 top-4 h-4 w-4 text-gray-400" />
                    <Textarea
                      placeholder="e.g., Professional guide, Safety equipment, Refreshments, Photo opportunities..."
                      className="min-h-[120px] resize-none pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-colors"
                      {...field}
                    />
                  </div>
                </FormControl>
                <div className="min-h-[20px]">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </CardContent>
      </Card> */}
    </div>
  );
};

export default LocationInformation;
