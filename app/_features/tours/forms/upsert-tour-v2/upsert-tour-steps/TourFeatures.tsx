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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TagsInput } from "@/components/ui/tags-input";
import { Globe, Star, Package } from "lucide-react";

interface TourFeaturesProps {
  form: UseFormReturn<any>;
}

const TourFeatures: React.FC<TourFeaturesProps> = ({ form }) => {
  const renderTagsField = (
    fieldName: string,
    label: string,
    placeholder: string,
    icon: React.ElementType,
    iconColor: string,
    maxTags?: number,
    description?: string
  ) => {
    const Icon = icon;
    return (
      <FormField
        control={form.control}
        name={fieldName}
        render={({ field }) => {
          const value = Array.isArray(field.value) ? field.value : [];

          return (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                {label} <span className="text-red-500">*</span>
              </FormLabel>
              <FormDescription className="text-xs text-gray-500 mb-3">
                {description}
              </FormDescription>
              <FormControl>
                <TagsInput
                  value={value}
                  onChange={(newValue) => field.onChange(newValue)}
                  placeholder={placeholder}
                  maxTags={maxTags}
                />
              </FormControl>
              <div className="min-h-[20px]">
                <FormMessage />
              </div>
            </FormItem>
          );
        }}
      />
    );
  };

  return (
    <div className="space-y-8">
      {/* Languages Section */}
      <Card className="border border-gray-200 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Globe className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Languages
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                The languages that the tour will be conducted in
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderTagsField(
            "languages",
            "Languages",
            "e.g., English, Spanish, French",
            Globe,
            "text-blue-600",
            10,
            "The languages that the tour will be conducted in"
          )}
        </CardContent>
      </Card>

      {/* Trip Highlights Section */}
      <Card className="border border-gray-200 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Star className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Trip Highlights
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                The highlights and key attractions of the tour
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderTagsField(
            "trip_highlights",
            "Trip Highlights",
            "e.g., Scenic viewpoints, Local cuisine tasting",
            Star,
            "text-green-600",
            15,
            "The highlights of the tour"
          )}
        </CardContent>
      </Card>

      {/* What's Included Section */}
      <Card className="border border-gray-200 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                What's Included
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Services and amenities included in the tour
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderTagsField(
            "includes",
            "What's Included",
            "e.g., Transportation, Guide, Lunch",
            Package,
            "text-purple-600",
            12,
            "The things that are included in the tour"
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TourFeatures;
