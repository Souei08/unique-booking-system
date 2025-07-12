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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MapPin,
  Tag,
  Pencil,
  ChevronDown,
  MessageSquare,
  FileText,
} from "lucide-react";
// import { ImageUploadInput } from "../ImageUploadInput";

interface BasicInformationProps {
  form: UseFormReturn<any>;
  title?: string;
  description?: string;
}

const BasicInformation: React.FC<BasicInformationProps> = ({
  form,
  title = "Basic Tour Information",
  description = "Let's start by creating the foundation for your tour",
}) => {
  // Watch images field for preview and error
  const images = form.watch("images") || [];
  const imageError = form.formState.errors.images?.message as string;

  return (
    <div className="space-y-8">
      {/* Tour Title & Category Section */}
      <Card className="border border-gray-200 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Tour Details
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Basic information about your tour
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Tour Title <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormDescription className="text-xs text-gray-500 mb-3">
                    Choose a clear, engaging title that describes your tour
                  </FormDescription>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Tour Name..."
                        className="h-12 pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                        {...field}
                        aria-invalid={!!form.formState.errors.title}
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
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Tour Category <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormDescription className="text-xs text-gray-500 mb-3">
                    Choose the most appropriate category for your tour
                  </FormDescription>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    aria-invalid={!!form.formState.errors.category}
                  >
                    <FormControl>
                      <div className="relative">
                        <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                        <SelectTrigger
                          className="h-12 pl-10 py-6 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                          aria-invalid={!!form.formState.errors.category}
                        >
                          <SelectValue placeholder="Select Tour Category..." />
                        </SelectTrigger>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="horseback_riding">
                        Horseback Riding
                      </SelectItem>
                      <SelectItem value="jet_ski_tour">Jet Ski Tour</SelectItem>
                      <SelectItem value="safari_tour_and_snorkeling">
                        Safari Tour and Snorkeling
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="min-h-[20px]">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tour Description Section */}
      <Card className="border border-gray-200 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MessageSquare className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Tour Description
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Describe the experience and key highlights
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Description <span className="text-red-500">*</span>
                </FormLabel>
                <FormDescription className="text-xs text-gray-500 mb-3">
                  Describe the experience, duration, and key highlights of your
                  tour
                </FormDescription>
                <FormControl>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Textarea
                      placeholder="Tour Description..."
                      className="min-h-[160px] resize-none pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500 transition-colors"
                      {...field}
                      aria-invalid={!!form.formState.errors.description}
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
      </Card>

      {/* Tour Images Section */}
      {/* <Card className="border border-gray-200 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Pencil className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Tour Images
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Upload images that best represent your tour
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormDescription className="text-xs text-gray-500 mb-3">
                  The first image will be featured. Maximum 10 images allowed.
                </FormDescription>
                <FormControl>
                  <ImageUploadInput
                    value={field.value}
                    onChange={field.onChange}
                    multiple={true}
                    maxFiles={10}
                  />
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

export default BasicInformation;
