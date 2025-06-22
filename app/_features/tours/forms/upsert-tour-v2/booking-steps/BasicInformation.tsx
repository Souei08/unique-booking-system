import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
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

interface BasicInformationProps {
  form: UseFormReturn<any>;
  onNext: () => void;
}

const BasicInformation: React.FC<BasicInformationProps> = ({
  form,
  onNext,
}) => {
  return (
    <Card>
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl font-bold text-strong  gap-3">
          Basic Information
        </CardTitle>
        <p className="text-sm  text-weak">
          Enter the essential details about your tour.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  htmlFor="title"
                  className="text-strong font-semibold"
                >
                  Tour Title
                </FormLabel>
                <FormControl>
                  <Input
                    id="title"
                    className="text-strong"
                    placeholder="Enter a descriptive title for your tour"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  htmlFor="category"
                  className="text-strong font-semibold"
                >
                  Tour Category
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger id="category" className="text-strong">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="text-strong">
                    <SelectItem value="horseback_riding">
                      Horseback Riding
                    </SelectItem>
                    <SelectItem value="jet_ski_tour">Jet Ski Tour</SelectItem>
                    <SelectItem value="safari_tour_and_snorkeling">
                      Safari Tour and Snorkeling
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel
                htmlFor="description"
                className="text-strong font-semibold"
              >
                Tour Description
              </FormLabel>
              <FormControl>
                <Textarea
                  id="description"
                  placeholder="Provide a detailed description of your tour experience"
                  className="min-h-[120px] text-strong"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button
            onClick={onNext}
            type="button"
            className="bg-brand text-white font-bold"
          >
            Next Step
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicInformation;
