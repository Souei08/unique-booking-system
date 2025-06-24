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
import { Separator } from "@/components/ui/separator";
import { X, Info } from "lucide-react";

interface SlotConfigurationProps {
  form: UseFormReturn<any>;
  addItem: (field: any, value?: any) => void;
  removeItem: (field: any, index: number) => void;
  updateItem: (field: any, index: number, value: any) => void;
}

const SlotConfiguration: React.FC<SlotConfigurationProps> = ({
  form,
  addItem,
  removeItem,
  updateItem,
}) => {
  return (
    <Card>
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl font-bold text-strong  gap-3">
          Slot Configuration
        </CardTitle>
        <p className="text-sm  text-weak">
          Set up your tour's capacity and pricing structure.
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Basic Slot Settings */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5  text-weak" />
            <h3 className="text-lg font-medium text-strong">Basic Settings</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="slots"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    htmlFor="slots"
                    className="flex items-center gap-2 text-strong font-semibold"
                  >
                    Available Slots
                    <span className="text-sm  text-weak">(total capacity)</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        id="slots"
                        type="number"
                        min="1"
                        placeholder="e.g., 20"
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
                        <span className=" text-weak">slots</span>
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription className="text-weak">
                    The total number of slots available for booking.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    htmlFor="rate"
                    className="flex items-center gap-2 text-strong font-semibold"
                  >
                    Base Rate
                    <span className="text-sm  text-weak">(per person)</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        id="rate"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="e.g., 99.99"
                        className="pl-8 pr-12 text-strong"
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
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className=" text-weak">$</span>
                      </div>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className=" text-weak">USD</span>
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription className="text-weak">
                    The default price per person.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator className="my-6" />

        {/* Custom Slot Types */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5  text-weak" />
            <h3 className="text-lg font-medium text-strong">
              Pricing Tiers (Optional)
            </h3>
          </div>
          <FormField
            control={form.control}
            name="custom_slot_types"
            render={({ field }) => {
              const value = Array.isArray(field.value) ? field.value : [];
              return (
                <FormItem>
                  <FormDescription className="mb-4 text-weak">
                    Create different pricing tiers for your tour.
                  </FormDescription>
                  <div className="space-y-4">
                    {value.map((type, index) => (
                      <div
                        key={index}
                        className="space-y-2 border rounded-lg p-4 bg-muted/50"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <FormLabel className="text-strong font-semibold">
                                  Name
                                </FormLabel>
                                <Input
                                  value={type.name || ""}
                                  onChange={(e) =>
                                    updateItem("custom_slot_types", index, {
                                      ...type,
                                      name: e.target.value,
                                    })
                                  }
                                  placeholder="e.g., Adult, Child, Senior"
                                  className="text-strong"
                                />
                              </div>
                              <div>
                                <FormLabel className="text-strong font-semibold">
                                  Price
                                </FormLabel>
                                <div className="relative">
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={
                                      type.price === null ? "" : type.price
                                    }
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      if (value === "") {
                                        updateItem("custom_slot_types", index, {
                                          ...type,
                                          price: null,
                                        });
                                      } else {
                                        const numValue = Number(value);
                                        updateItem("custom_slot_types", index, {
                                          ...type,
                                          price: isNaN(numValue)
                                            ? null
                                            : numValue,
                                        });
                                      }
                                    }}
                                    className="pl-8 text-strong"
                                  />
                                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <span className=" text-weak">$</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div>
                              <FormLabel className="text-strong font-semibold">
                                Description (Optional)
                              </FormLabel>
                              <Textarea
                                value={type.description || ""}
                                onChange={(e) =>
                                  updateItem("custom_slot_types", index, {
                                    ...type,
                                    description: e.target.value,
                                  })
                                }
                                placeholder="Describe this pricing tier"
                                className="text-strong"
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              removeItem("custom_slot_types", index)
                            }
                            className="ml-2"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        addItem("custom_slot_types", {
                          name: "",
                          price: null,
                          description: "",
                        })
                      }
                      className="w-full text-strong"
                    >
                      Add Pricing Tier
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>

        <Separator className="my-6" />

        {/* Custom Slot Fields */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5  text-weak" />
            <h3 className="text-lg font-medium text-strong">
              Additional Information Fields (Optional)
            </h3>
          </div>
          <FormField
            control={form.control}
            name="custom_slot_fields"
            render={({ field }) => {
              const value = Array.isArray(field.value) ? field.value : [];
              return (
                <FormItem>
                  <FormDescription className="mb-4 text-weak">
                    Add custom fields to collect additional information from
                    your customers.
                  </FormDescription>
                  <div className="space-y-4">
                    {value.map((field, index) => (
                      <div
                        key={index}
                        className="space-y-2 border rounded-lg p-4 bg-muted/50"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <FormLabel className="text-strong font-semibold">
                                  Field Name
                                </FormLabel>
                                <Input
                                  value={field.name || ""}
                                  onChange={(e) =>
                                    updateItem("custom_slot_fields", index, {
                                      ...field,
                                      name: e.target.value,
                                    })
                                  }
                                  placeholder="e.g., dietary_restrictions"
                                  className="text-strong"
                                />
                                <FormDescription className="mt-1 text-weak">
                                  Used internally (no spaces, lowercase)
                                </FormDescription>
                              </div>
                              <div>
                                <FormLabel className="text-strong font-semibold">
                                  Display Label
                                </FormLabel>
                                <Input
                                  value={field.label || ""}
                                  onChange={(e) =>
                                    updateItem("custom_slot_fields", index, {
                                      ...field,
                                      label: e.target.value,
                                    })
                                  }
                                  placeholder="e.g., Dietary Restrictions"
                                  className="text-strong"
                                />
                                <FormDescription className="mt-1 text-weak">
                                  Shown to users
                                </FormDescription>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <FormLabel className="text-strong font-semibold">
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
                                  <SelectTrigger className="text-strong">
                                    <SelectValue placeholder="Select field type" />
                                  </SelectTrigger>
                                  <SelectContent className="text-strong">
                                    <SelectItem value="text">Text</SelectItem>
                                    <SelectItem value="number">
                                      Number
                                    </SelectItem>
                                    <SelectItem value="select">
                                      Select
                                    </SelectItem>
                                    <SelectItem value="checkbox">
                                      Checkbox
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <FormLabel className="text-strong font-semibold">
                                  Placeholder (Optional)
                                </FormLabel>
                                <Input
                                  value={field.placeholder || ""}
                                  onChange={(e) =>
                                    updateItem("custom_slot_fields", index, {
                                      ...field,
                                      placeholder: e.target.value,
                                    })
                                  }
                                  placeholder="Enter placeholder text"
                                  className="text-strong"
                                />
                              </div>
                            </div>

                            {field.type === "select" && (
                              <div>
                                <FormLabel className="text-strong font-semibold">
                                  Options (one per line)
                                </FormLabel>
                                <Textarea
                                  value={field.options?.join("\n") || ""}
                                  onChange={(e) =>
                                    updateItem("custom_slot_fields", index, {
                                      ...field,
                                      options: e.target.value
                                        .split("\n")
                                        .filter(Boolean),
                                    })
                                  }
                                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                                  className="min-h-[100px] text-strong"
                                />
                                <FormDescription className="mt-1 text-weak">
                                  Enter each option on a new line
                                </FormDescription>
                              </div>
                            )}

                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={field.required || false}
                                onChange={(e) =>
                                  updateItem("custom_slot_fields", index, {
                                    ...field,
                                    required: e.target.checked,
                                  })
                                }
                                className="h-4 w-4"
                              />
                              <FormLabel className="text-strong font-semibold">
                                Required field
                              </FormLabel>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              removeItem("custom_slot_fields", index)
                            }
                            className="ml-2"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        addItem("custom_slot_fields", {
                          name: "",
                          type: "text",
                          required: false,
                          label: "",
                          placeholder: "",
                        })
                      }
                      className="w-full text-strong"
                    >
                      Add Information Field
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default SlotConfiguration;
