import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Languages, Star, CheckCircle } from "lucide-react";

interface TourFeaturesProps {
  form: UseFormReturn<any>;
  addItem: (field: any, value?: any) => void;
  removeItem: (field: any, index: number) => void;
  updateItem: (field: any, index: number, value: any) => void;
}

const TourFeatures: React.FC<TourFeaturesProps> = ({
  form,
  addItem,
  removeItem,
  updateItem,
}) => {
  const renderField = (
    fieldName: string,
    label: string,
    placeholder: string,
    icon: React.ReactNode
  ) => {
    return (
      <FormField
        control={form.control}
        name={fieldName}
        render={({ field }) => {
          const value = Array.isArray(field.value) ? field.value : [""];
          const hasItems = value.some((item) => item.trim() !== "");

          return (
            <FormItem className="space-y-4">
              <div className="flex items-center gap-2">
                {icon}
                <FormLabel className="text-strong font-semibold text-base">
                  {label}
                </FormLabel>
              </div>

              <div className="space-y-3">
                {value.map((item, index) => (
                  <div key={index} className="flex gap-2 items-center group">
                    <div className="flex-1 relative">
                      <Input
                        value={item}
                        onChange={(e) =>
                          updateItem(fieldName, index, e.target.value)
                        }
                        placeholder={placeholder}
                        className={`text-strong pr-10 transition-all duration-200 focus:ring-2 focus:ring-brand/20 ${
                          item.trim() === ""
                            ? "border-gray-200 bg-gray-50"
                            : "border-gray-300"
                        }`}
                      />
                      {value.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeItem(fieldName, index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addItem(fieldName)}
                  className="text-strong border-dashed border-2 hover:border-solid hover:border-brand transition-all duration-200 group"
                >
                  <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Add {label.toLowerCase()}
                </Button>
              </div>

              {hasItems && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {value
                    .filter((item) => item.trim() !== "")
                    .map((item, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-brand/10 text-brand border-brand/20"
                      >
                        {item}
                      </Badge>
                    ))}
                </div>
              )}

              <FormMessage />
            </FormItem>
          );
        }}
      />
    );
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl font-bold text-strong  gap-3">
          Tour Features
        </CardTitle>
        <p className="text-base text-weak leading-relaxed">
          Enhance your tour by adding languages, highlights, and inclusions that
          will help customers understand what to expect.
        </p>
      </CardHeader>

      <CardContent className="space-y-8">
        {renderField(
          "languages",
          "Languages",
          "e.g., English, Spanish, French",
          <Languages className="h-5 w-5 text-brand" />
        )}

        {renderField(
          "trip_highlights",
          "Trip Highlights",
          "e.g., Scenic viewpoints, Local cuisine tasting",
          <Star className="h-5 w-5 text-brand" />
        )}

        {renderField(
          "includes",
          "What's Included",
          "e.g., Transportation, Guide, Lunch",
          <CheckCircle className="h-5 w-5 text-brand" />
        )}
      </CardContent>
    </Card>
  );
};

export default TourFeatures;
