import React, { useMemo, useCallback } from "react";
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
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  X,
  Plus,
  DollarSign,
  Users,
  FileText,
  Check,
  Calculator,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { NumberInput } from "@/components/ui/number-input";

interface TourPricingProps {
  form: UseFormReturn<any>;
  addItem: (field: any, value?: any) => void;
  removeItem: (field: any, index: number) => void;
  updateItem: (field: any, index: number, value: any) => void;
  title?: string;
  description?: string;
  showCard?: boolean;
}

const TourPricing: React.FC<TourPricingProps> = ({
  form,
  addItem,
  removeItem,
  updateItem,
  title = "Tour Pricing",
  description = "Set up pricing for different customer types and add custom fields if needed",
  showCard = true,
}) => {
  // Memoize the estimated rate calculation to prevent unnecessary recalculations
  const estimatedRate = useMemo(() => {
    const customSlotTypes = form.watch("custom_slot_types") || [];
    if (customSlotTypes.length === 0) return 0;

    const validPrices = customSlotTypes
      .filter((type: any) => type.price && type.price > 0)
      .map((type: any) => type.price);

    if (validPrices.length === 0) return 0;

    // Calculate average price
    const averagePrice =
      validPrices.reduce((sum: number, price: number) => sum + price, 0) /
      validPrices.length;
    return Math.round(averagePrice * 100) / 100; // Round to 2 decimal places
  }, [form.watch("custom_slot_types")]);

  // Check if custom pricing is active based on custom_slot_types having values
  const customSlotTypes = form.watch("custom_slot_types") || [];
  const hasCustomPricing = customSlotTypes.length > 0;

  // Debounced price update function
  const debouncedPriceUpdate = useCallback(
    (index: number, value: string) => {
      const timeoutId = setTimeout(() => {
        const numValue = value === "" ? null : Number(value);
        updateItem("custom_slot_types", index, {
          ...form.getValues("custom_slot_types")[index],
          price: isNaN(numValue as number) ? null : numValue,
        });
      }, 300); // 300ms delay

      return () => clearTimeout(timeoutId);
    },
    [updateItem, form]
  );

  // Optimized price input handler
  const handlePriceChange = useCallback(
    (index: number, value: string) => {
      // Update the local state immediately for responsive UI
      const currentTypes = form.getValues("custom_slot_types");
      const updatedTypes = [...currentTypes];
      updatedTypes[index] = {
        ...updatedTypes[index],
        price: value === "" ? null : Number(value),
      };
      form.setValue("custom_slot_types", updatedTypes, {
        shouldValidate: false,
      });

      // Debounce the actual update
      debouncedPriceUpdate(index, value);
    },
    [form, debouncedPriceUpdate]
  );

  const content = (
    <div className="space-y-8">
      {/* Pricing Mode Selection */}
      <Card className="border border-gray-200 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Pricing Method
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Choose how you want to price your tour slots
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Regular Pricing Option */}
            <div
              className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 group ${
                !hasCustomPricing
                  ? "border-blue-500 bg-blue-50 shadow-lg"
                  : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
              }`}
              onClick={() => {
                form.setValue("custom_slot_types", []);
              }}
            >
              <div className="flex items-start gap-2">
                <div
                  className={`p-3 rounded-lg transition-colors ${
                    !hasCustomPricing
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                  }`}
                >
                  <DollarSign className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3
                    className={`font-semibold text-lg mb-2 ${
                      !hasCustomPricing ? "text-blue-900" : "text-gray-900"
                    }`}
                  >
                    Regular Pricing
                  </h3>
                  <p
                    className={`text-sm mb-3 ${
                      !hasCustomPricing ? "text-blue-700" : "text-gray-600"
                    }`}
                  >
                    Set a single price that applies to all customers. Simple and
                    straightforward pricing structure.
                  </p>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        !hasCustomPricing ? "bg-blue-500" : "bg-gray-300"
                      }`}
                    />
                    <span
                      className={`text-xs font-medium ${
                        !hasCustomPricing ? "text-blue-700" : "text-gray-500"
                      }`}
                    >
                      {!hasCustomPricing ? "Selected" : "Click to select"}
                    </span>
                  </div>
                </div>
              </div>

              {!hasCustomPricing && (
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
            </div>

            {/* Custom Pricing Option */}
            <div
              className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 group ${
                hasCustomPricing
                  ? "border-blue-500 bg-blue-50 shadow-lg"
                  : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
              }`}
              onClick={() => {
                // Add a default custom type when selecting custom pricing
                if (!hasCustomPricing) {
                  addItem("custom_slot_types", {
                    name: "",
                    customName: "",
                    price: null,
                    description: "",
                  });
                }
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-lg transition-colors ${
                    hasCustomPricing
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                  }`}
                >
                  <Users className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3
                    className={`font-semibold text-lg mb-2 ${
                      hasCustomPricing ? "text-blue-900" : "text-gray-900"
                    }`}
                  >
                    Custom Pricing
                  </h3>
                  <p
                    className={`text-sm mb-3 ${
                      hasCustomPricing ? "text-blue-700" : "text-gray-600"
                    }`}
                  >
                    Create different pricing tiers for adults, children,
                    seniors, and other customer types.
                  </p>
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        hasCustomPricing ? "bg-blue-500" : "bg-gray-300"
                      }`}
                    />
                    <span
                      className={`text-xs font-medium ${
                        hasCustomPricing ? "text-blue-700" : "text-gray-500"
                      }`}
                    >
                      {hasCustomPricing ? "Selected" : "Click to select"}
                    </span>
                  </div>
                </div>
              </div>

              {hasCustomPricing && (
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regular Pricing Section */}
      {!hasCustomPricing && (
        <div className="space-y-8">
          {/* Regular Pricing Content */}
          <Card className="border border-gray-200 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Set Your Price
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Enter the price that all customers will pay for your tour
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Price per Person <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormDescription className="text-xs text-gray-500 mb-3">
                      Set the price that all customers will pay for your tour
                    </FormDescription>
                    <FormControl>
                      <NumberInput
                        value={field.value ?? 0}
                        onValueChange={field.onChange}
                        placeholder="0.00"
                        decimalScale={2}
                        fixedDecimalScale={true}
                        min={0}
                        suffix=" USD"
                        stepper={1}
                        className="w-full h-12 pl-10"
                        startIcon={<DollarSign className="w-4 h-4" />}
                      />
                    </FormControl>
                    <div className="min-h-[20px]">
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Estimated Rate Section - Shows when custom pricing is selected */}
      {/* {hasCustomPricing && estimatedRate > 0 && (
        <div className="space-y-8">
          <Card className="border border-blue-200 bg-blue-50 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calculator className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-blue-900">
                    Estimated Average Price
                  </CardTitle>
                  <p className="text-sm text-blue-700 mt-1">
                    Based on your custom pricing configuration
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-blue-800 mb-2 block">
                      Estimated Average Price per Person
                    </FormLabel>
                    <FormDescription className="text-xs text-blue-600 mb-3">
                      This is calculated as the average of all your custom
                      pricing tiers
                    </FormDescription>
                    <FormControl>
                      <NumberInput
                        value={estimatedRate}
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Also update the form value
                          form.setValue("rate", value);
                        }}
                        placeholder="0.00"
                        decimalScale={2}
                        fixedDecimalScale={true}
                        min={0}
                        suffix=" USD"
                        stepper={1}
                        className="w-full h-12 pl-10 border-2 border-blue-300 bg-blue-100 text-blue-900 font-semibold"
                        startIcon={
                          <DollarSign className="w-4 h-4 text-blue-600" />
                        }
                      />
                    </FormControl>
                    <div className="flex items-center gap-2 mt-2">
                      <Calculator className="h-4 w-4 text-blue-600" />
                      <p className="text-xs text-blue-600 font-medium">
                        Auto-calculated from custom pricing tiers
                      </p>
                    </div>
                    <div className="min-h-[20px]">
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>
      )} */}

      {/* Custom Pricing Section */}
      {hasCustomPricing && (
        <div className="space-y-8">
          {/* Custom Pricing Content */}
          <Card className="border border-gray-200 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Custom Pricing
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Define different pricing tiers for various customer types
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="custom_slot_types"
                render={({ field }) => {
                  const value = Array.isArray(field.value) ? field.value : [];
                  return (
                    <FormItem>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {value.map((type, index) => (
                          <div
                            key={index}
                            className="relative group bg-blue-50 border-2 border-dashed border-blue-200 rounded-xl p-6 transition-all duration-300 hover:border-blue-400"
                          >
                            {/* Remove Button */}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                removeItem("custom_slot_types", index)
                              }
                              className="absolute top-4 right-4 h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-full shadow-sm"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <div className="mb-6 border-b border-gray-200 pb-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  <Users className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <span className="font-bold text-gray-800 text-base">
                                    Custom Type {index + 1}
                                  </span>
                                  {type.name === "custom" &&
                                    type.customName && (
                                      <p className="text-sm text-blue-600 font-medium">
                                        "{type.customName}"
                                      </p>
                                    )}
                                </div>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                                  Custom Type
                                </FormLabel>
                                <Select
                                  value={type.name || ""}
                                  onValueChange={(value) =>
                                    updateItem("custom_slot_types", index, {
                                      ...type,
                                      name: value,
                                      customName:
                                        value !== "custom"
                                          ? ""
                                          : type.customName,
                                    })
                                  }
                                >
                                  <SelectTrigger className="h-13 border-2  py-6  border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-lg transition-all duration-200 bg-white">
                                    <SelectValue placeholder="Select custom type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="adult">
                                      <div className="flex items-center gap-4">
                                        <Users className="h-4 w-4 text-gray-500" />
                                        <span>Adult (18+)</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="child">
                                      <div className="flex items-center gap-4">
                                        <Users className="h-4 w-4 text-gray-500" />
                                        <span>Child (3-17)</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="infant">
                                      <div className="flex items-center gap-4">
                                        <Users className="h-4 w-4 text-gray-500" />
                                        <span>Infant (0-2)</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="senior">
                                      <div className="flex items-center gap-4">
                                        <Users className="h-4 w-4 text-gray-500" />
                                        <span>Senior (65+)</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="student">
                                      <div className="flex items-center gap-4">
                                        <Users className="h-4 w-4 text-gray-500" />
                                        <span>Student (with ID)</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="military">
                                      <div className="flex items-center gap-4">
                                        <Users className="h-4 w-4 text-gray-500" />
                                        <span>Military (with ID)</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="group">
                                      <div className="flex items-center gap-4">
                                        <Users className="h-4 w-4 text-gray-500" />
                                        <span>Group Rate</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="custom">
                                      <div className="flex items-center gap-4">
                                        <Plus className="h-4 w-4 text-blue-600" />
                                        <span className="font-medium text-blue-600">
                                          Custom Type
                                        </span>
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>

                                {/* Custom Type Input */}
                                {type.name === "custom" && (
                                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
                                    <div className="flex items-center gap-2 mb-3">
                                      <Plus className="h-4 w-4 text-blue-600" />
                                      <FormLabel className="text-sm font-semibold text-blue-800">
                                        Custom Type Name
                                      </FormLabel>
                                    </div>
                                    <div className="relative">
                                      <Input
                                        value={type.customName || ""}
                                        onChange={(e) =>
                                          updateItem(
                                            "custom_slot_types",
                                            index,
                                            {
                                              ...type,
                                              customName: e.target.value,
                                            }
                                          )
                                        }
                                        placeholder="e.g., VIP Guest, Corporate Client, Family Package"
                                        className="h-12 border-1 border-blue-300 focus:border-blue-600 focus:ring-blue-600/20 text-base  transition-colors bg-white"
                                      />
                                      {type.customName && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        </div>
                                      )}
                                    </div>
                                    <p className="text-xs text-blue-600 mt-2">
                                      Enter a descriptive name for your custom
                                      type
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Price Section - Optimized */}
                              <div>
                                <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                                  Price per Custom Type
                                </FormLabel>
                                <div className="relative">
                                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-5" />
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={
                                      type.price === null ? "" : type.price
                                    }
                                    onChange={(e) =>
                                      handlePriceChange(index, e.target.value)
                                    }
                                    placeholder="0.00"
                                    className="pl-12 h-12 border-1 border-gray-300 focus:border-blue-600 focus:ring-blue-600/20 text-base transition-colors bg-white"
                                  />
                                </div>
                                {type.price !== null && type.price > 0 && (
                                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                    <Check className="h-3 w-3" />
                                    Price set successfully
                                  </p>
                                )}
                              </div>

                              {/* Description Section */}
                              <div>
                                <FormLabel className="text-sm font-medium text-gray-700 mb-2 block ">
                                  Description (Optional)
                                </FormLabel>
                                <div className="relative">
                                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-5" />
                                  <Input
                                    value={type.description || ""}
                                    onChange={(e) =>
                                      updateItem("custom_slot_types", index, {
                                        ...type,
                                        description: e.target.value,
                                      })
                                    }
                                    placeholder={
                                      type.name === "custom"
                                        ? "e.g., Special pricing for VIP guests with exclusive amenities"
                                        : "e.g., Children under 3 travel free, includes meals"
                                    }
                                    className="pl-12 h-12 border-2 border-gray-300 focus:border-blue-600 focus:ring-blue-600/20 text-base transition-colors bg-white"
                                  />
                                </div>
                                {type.description && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Description added
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {/* Add new custom type button */}
                        <div
                          className="h-full min-h-[320px] border-2 border-dashed border-blue-300 hover:border-blue-400 hover:bg-blue-50/30 rounded-xl transition-all duration-300 group cursor-pointer bg-white"
                          onClick={() =>
                            addItem("custom_slot_types", {
                              name: "",
                              customName: "",
                              price: null,
                              description: "",
                            })
                          }
                        >
                          <div className="h-full flex flex-col items-center justify-center gap-5 p-8">
                            <div className="p-4 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                              <Plus className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="text-center">
                              <span className="text-lg font-bold text-blue-600 group-hover:text-blue-900 transition-colors">
                                Add Custom Type
                              </span>
                              <p className="text-sm text-gray-500 mt-2">
                                Create a new pricing category for different
                                custom types
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="min-h-[20px]">
                        <FormMessage />
                      </div>
                    </FormItem>
                  );
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Custom Fields Section - Always Visible */}
      <div className="space-y-8">
        <Card className="border border-gray-200 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Custom Fields{" "}
                  <span className="text-gray-500 text-xs -mt-5">
                    (Optional)
                  </span>
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Collect additional information from customers
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="custom_slot_fields"
              render={({ field }) => {
                const value = Array.isArray(field.value) ? field.value : [];
                return (
                  <FormItem>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      {value.map((field, index) => (
                        <div
                          key={index}
                          className="relative group bg-purple-50 border-2 border-dashed border-purple-200 rounded-xl p-6 transition-all duration-300 hover:border-purple-400"
                        >
                          {/* Remove Button */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              removeItem("custom_slot_fields", index)
                            }
                            className="absolute top-4 right-4 h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-full shadow-sm"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <div className="mb-6 border-b border-gray-200 pb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-purple-100 rounded-lg">
                                <FileText className="h-5 w-5 text-purple-600" />
                              </div>
                              <div>
                                <span className="font-bold text-gray-800 text-base">
                                  Custom Field {index + 1}
                                </span>
                                <p className="text-sm text-purple-600 font-medium">
                                  Configure field details
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                                Field Name
                              </FormLabel>
                              <div className="relative">
                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 z-5" />
                                <Input
                                  value={field.name || ""}
                                  onChange={(e) =>
                                    updateItem("custom_slot_fields", index, {
                                      ...field,
                                      name: e.target.value,
                                    })
                                  }
                                  placeholder="e.g., dietary_restrictions"
                                  className="pl-12 h-12 border-2 border-gray-300 focus:border-purple-600 focus:ring-purple-600/20 text-base font-bold transition-colors bg-white"
                                />
                              </div>
                            </div>
                            <div>
                              <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                                Display Label
                              </FormLabel>
                              <div className="relative">
                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 z-5" />
                                <Input
                                  value={field.label || ""}
                                  onChange={(e) =>
                                    updateItem("custom_slot_fields", index, {
                                      ...field,
                                      label: e.target.value,
                                    })
                                  }
                                  placeholder="e.g., Dietary Restrictions"
                                  className="pl-12 h-12 border-2 border-gray-300 focus:border-purple-600 focus:ring-purple-600/20 text-base font-bold transition-colors bg-white"
                                />
                              </div>
                            </div>
                            <div>
                              <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                                Field Type
                              </FormLabel>
                              <Select
                                value={field.type || "text"}
                                onValueChange={(value) =>
                                  updateItem("custom_slot_fields", index, {
                                    ...field,
                                    type: value,
                                  })
                                }
                              >
                                <SelectTrigger className="h-13 border-2 py-6 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 rounded-lg transition-all duration-200 bg-white">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="text">Text</SelectItem>
                                  <SelectItem value="number">Number</SelectItem>
                                  <SelectItem value="select">Select</SelectItem>
                                  <SelectItem value="checkbox">
                                    Checkbox
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex items-center space-x-3 pt-2">
                              <input
                                type="checkbox"
                                checked={field.required || false}
                                onChange={(e) =>
                                  updateItem("custom_slot_fields", index, {
                                    ...field,
                                    required: e.target.checked,
                                  })
                                }
                                className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                              />
                              <FormLabel className="text-sm text-gray-600 cursor-pointer">
                                Required field
                              </FormLabel>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Add new field button */}
                      <div
                        className="h-full min-h-[320px] border-2 border-dashed border-purple-300 hover:border-purple-400 hover:bg-purple-50/30 rounded-xl transition-all duration-300 group cursor-pointer bg-white"
                        onClick={() =>
                          addItem("custom_slot_fields", {
                            name: "",
                            type: "text",
                            required: false,
                            label: "",
                            placeholder: "",
                          })
                        }
                      >
                        <div className="h-full flex flex-col items-center justify-center gap-5 p-8">
                          <div className="p-4 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
                            <Plus className="h-8 w-8 text-purple-600" />
                          </div>
                          <div className="text-center">
                            <span className="text-lg font-bold text-purple-600 group-hover:text-purple-900 transition-colors">
                              Add Custom Field
                            </span>
                            <p className="text-sm text-gray-500 mt-2">
                              Create a new custom field to collect additional
                              information
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="min-h-[20px]">
                      <FormMessage />
                    </div>
                  </FormItem>
                );
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Return content directly (no card wrapper)
  return content;
};

export default TourPricing;
