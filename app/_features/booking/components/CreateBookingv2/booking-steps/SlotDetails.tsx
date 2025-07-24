import { useState, useEffect } from "react";
import { toast } from "sonner";
import { SlotDetail } from "@/app/_features/booking/types/booking-types";
import { Tooltip } from "@/components/ui/tooltip";
import {
  InfoIcon,
  CircleCheck,
  CircleDot,
  CircleDashed,
  Asterisk,
  Check,
  Plus,
  X,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  FileText,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CustomSlotType {
  name: string;
  price: number;
  description: string;
}

export interface CustomSlotField {
  name: string;
  type: string;
  required: boolean;
  label: string;
  placeholder: string;
  options?: string[]; // Added for select and checkbox
  min?: number;
  max?: number;
}

export interface SlotDetailsProps {
  numberOfPeople: number;
  customSlotTypes: CustomSlotType[] | null;
  customSlotFields: CustomSlotField[];
  tourRate: number;
  onSlotDetailsChange?: (details: SlotDetail[], totalPrice: number) => void;
  setSlotDetails: React.Dispatch<React.SetStateAction<SlotDetail[]>>;
  slotDetails: SlotDetail[];
  readOnly?: boolean;
  showCard?: boolean;
  showHeader?: boolean;
  handleAddSlot?: () => void;
  handleRemoveSlot?: (index: number) => void;
}

// Minimal Slot Details with Card Layout and Pagination
const SlotDetails = ({
  numberOfPeople,
  customSlotTypes,
  customSlotFields,
  tourRate,
  onSlotDetailsChange,
  setSlotDetails,
  slotDetails,
  readOnly = false,
  showCard = true,
  showHeader = true,
  handleAddSlot,
  handleRemoveSlot,
}: SlotDetailsProps) => {
  const [slotErrors, setSlotErrors] = useState<{
    [key: string]: string[];
  }>({});
  // Remove pagination state and logic
  // const [currentPage, setCurrentPage] = useState<number>(1);
  // const slotsPerPage = 2; // Show 2 slots per page

  // Update slot details when numberOfPeople changes
  useEffect(() => {
    if (!readOnly) {
      setSlotDetails((prev: SlotDetail[]) => {
        // Only update if the length is different
        if (prev.length === numberOfPeople) {
          return prev;
        }

        const arr = [...prev];
        // If we need to add slots
        while (arr.length < numberOfPeople) {
          arr.push({
            type: customSlotTypes?.[0]?.name || "",
            price: customSlotTypes?.[0]?.price || 0,
          });
        }
        // If we need to remove slots
        while (arr.length > numberOfPeople) {
          arr.pop();
        }
        return arr;
      });
    }
  }, [numberOfPeople, readOnly, customSlotTypes]);

  // Handle slot field change
  const handleSlotFieldChange = (slotIdx: number, key: string, value: any) => {
    if (readOnly) return;
    setSlotDetails((prev: SlotDetail[]) => {
      const updated = [...prev];
      updated[slotIdx] = { ...updated[slotIdx], [key]: value };
      return updated;
    });
  };

  // Effect to handle validation and price updates when slot details change
  useEffect(() => {
    if (!readOnly && slotDetails.length > 0) {
      const slotData = slotDetails.map((slot) => ({
        ...slot,
        price: getSlotPrice(slot),
      }));
      const totalPrice = slotData.reduce(
        (sum, slot) => sum + Number(slot.price),
        0
      );

      // Only call onSlotDetailsChange if the data has actually changed
      const currentData = JSON.stringify(slotData);
      const previousData = JSON.stringify(slotDetails);

      if (currentData !== previousData) {
        onSlotDetailsChange?.(slotData, totalPrice);
      }
    }
  }, [slotDetails, customSlotTypes, tourRate, readOnly]);

  // Effect to handle validation separately
  useEffect(() => {
    if (!readOnly) {
      validateSlots();
    }
  }, [slotDetails, customSlotFields, customSlotTypes, readOnly]);

  // Get price per slot
  const getSlotPrice = (slot: SlotDetail | undefined) => {
    if (!slot) return 0;

    if (customSlotTypes) {
      const typeDef = customSlotTypes.find((t) => t.name === slot.type);
      return typeDef ? typeDef.price : tourRate;
    }
    return tourRate;
  };

  // Check if a slot is complete
  const isSlotComplete = (slot: SlotDetail | undefined) => {
    if (!slot) return false;

    // If we have custom slot types, check if type is selected
    if (customSlotTypes && customSlotTypes.length > 0) {
      if (!slot.type) return false;
      // Verify the type exists in customSlotTypes
      const typeExists = customSlotTypes.some((t) => t.name === slot.type);
      if (!typeExists) return false;
    }

    // Check all custom fields as required
    return !customSlotFields.some(
      (field) => !slot[field.name] || slot[field.name] === ""
    );
  };

  // Validate slots and return validation result
  const validateSlots = () => {
    const errors: { [key: string]: string[] } = {};
    slotDetails.forEach((slot, idx) => {
      const slotErrors: string[] = [];

      // Validate all custom slot fields as required
      customSlotFields.forEach((field) => {
        const value = slot[field.name];
        if (value === undefined || value === null || value === "") {
          slotErrors.push(`${field.label} is required`);
        } else {
          // Validate min/max constraints
          if (field.type === "text" && typeof value === "string") {
            if (field.min !== undefined && value.length < field.min) {
              slotErrors.push(`${field.label} must be at least ${field.min} characters`);
            }
            if (field.max !== undefined && value.length > field.max) {
              slotErrors.push(`${field.label} must be no more than ${field.max} characters`);
            }
          } else if (field.type === "number" && typeof value === "string") {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
              if (field.min !== undefined && numValue < field.min) {
                slotErrors.push(`${field.label} must be at least ${field.min}`);
              }
              if (field.max !== undefined && numValue > field.max) {
                slotErrors.push(`${field.label} must be no more than ${field.max}`);
              }
            }
          }
        }
      });

      // Validate slot type if custom slot types exist and are not empty
      if (customSlotTypes && customSlotTypes.length > 0) {
        if (!slot.type) {
          slotErrors.push("Type is required");
        } else if (!customSlotTypes.find((t) => t.name === slot.type)) {
          slotErrors.push("Invalid type selected");
        }
      }

      if (slotErrors.length > 0) {
        errors[`slot-${idx}`] = slotErrors;
      }
    });
    setSlotErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Remove pagination calculations
  // const totalPages = Math.ceil(slotDetails.length / slotsPerPage);
  // const startIndex = (currentPage - 1) * slotsPerPage;
  // const endIndex = startIndex + slotsPerPage;
  // const currentSlots = slotDetails.slice(startIndex, endIndex);

  // Get errors for a specific slot
  const getSlotErrors = (slotIndex: number) => {
    return slotErrors[`slot-${slotIndex}`] || [];
  };

  // Helper function to get icon for field type
  const getFieldIcon = (fieldType: string, fieldName: string) => {
    const name = fieldName.toLowerCase();
    const type = fieldType.toLowerCase();

    if (name.includes("name") || name.includes("fullname"))
      return <User className="w-4 h-4" />;
    if (name.includes("email") || name.includes("mail"))
      return <Mail className="w-4 h-4" />;
    if (
      name.includes("phone") ||
      name.includes("mobile") ||
      name.includes("tel")
    )
      return <Phone className="w-4 h-4" />;
    if (name.includes("date") || name.includes("birth"))
      return <Calendar className="w-4 h-4" />;
    if (name.includes("address") || name.includes("location"))
      return <MapPin className="w-4 h-4" />;
    if (
      name.includes("notes") ||
      name.includes("comment") ||
      name.includes("description")
    )
      return <FileText className="w-4 h-4" />;
    if (type === "number" || name.includes("age") || name.includes("count"))
      return <Hash className="w-4 h-4" />;

    return <User className="w-4 h-4" />;
  };

  // Helper function to render input based on field type
  const renderFieldInput = (
    field: CustomSlotField,
    slot: SlotDetail,
    actualIndex: number
  ) => {
    const fieldValue = slot[field.name] || "";
    const slotErrors = getSlotErrors(actualIndex);
    const hasError = slotErrors.some(error => 
      error.includes(field.label) && (
        error.includes("is required") || 
        error.includes("must be at least") || 
        error.includes("must be no more than")
      )
    );
    const fieldIcon = getFieldIcon(field.type, field.name);

    switch (field.type) {
      case "select":
        return (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {fieldIcon}
            </div>
            <select
              className={`w-full px-3 py-2 pl-10 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs text-gray-800 transition-all duration-200 ${
                hasError
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              value={fieldValue}
              onChange={(e) =>
                handleSlotFieldChange(actualIndex, field.name, e.target.value)
              }
              required={true}
            >
              <option value="">Select {field.label}</option>
              {field.options &&
                field.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
            </select>
          </div>
        );

      case "checkbox":
        return (
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id={`${field.name}-${actualIndex}`}
              checked={fieldValue === "true" || fieldValue === true}
              onChange={(e) =>
                handleSlotFieldChange(
                  actualIndex,
                  field.name,
                  e.target.checked.toString()
                )
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor={`${field.name}-${actualIndex}`}
              className="text-xs text-gray-700 cursor-pointer"
            >
              {field.label}
            </label>
          </div>
        );

      case "number":
        return (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {fieldIcon}
            </div>
            <input
              type="number"
              className={`w-full px-3 py-2 pl-10 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs text-gray-800 placeholder:text-gray-400 transition-all duration-200 ${
                hasError
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              value={fieldValue}
              onChange={(e) =>
                handleSlotFieldChange(actualIndex, field.name, e.target.value)
              }
              required={true}
              placeholder={field.placeholder}
              min={field.min !== undefined ? field.min : undefined}
              max={field.max !== undefined ? field.max : undefined}
            />
            {/* Show min/max constraints if they exist */}
            {(field.min !== undefined || field.max !== undefined) && (
              <div className="mt-1 text-xs text-gray-500">
                {field.min !== undefined && field.max !== undefined && (
                  <span>Range: {field.min} - {field.max}</span>
                )}
                {field.min !== undefined && field.max === undefined && (
                  <span>Min: {field.min}</span>
                )}
                {field.min === undefined && field.max !== undefined && (
                  <span>Max: {field.max}</span>
                )}
              </div>
            )}
          </div>
        );

      default: // text
        return (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {fieldIcon}
            </div>
            <input
              type="text"
              className={`w-full px-3 py-2 pl-10 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs text-gray-800 placeholder:text-gray-400 transition-all duration-200 ${
                hasError
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              value={fieldValue}
              onChange={(e) =>
                handleSlotFieldChange(actualIndex, field.name, e.target.value)
              }
              required={true}
              placeholder={field.placeholder}
              minLength={field.min !== undefined ? field.min : undefined}
              maxLength={field.max !== undefined ? field.max : undefined}
            />
            {/* Show min/max constraints if they exist */}
            {(field.min !== undefined || field.max !== undefined) && (
              <div className="mt-1 text-xs text-gray-500 flex justify-between">
                <span>
                  {field.min !== undefined && field.max !== undefined && (
                    <span>Length: {field.min} - {field.max} characters</span>
                  )}
                  {field.min !== undefined && field.max === undefined && (
                    <span>Min length: {field.min} characters</span>
                  )}
                  {field.min === undefined && field.max !== undefined && (
                    <span>Max length: {field.max} characters</span>
                  )}
                </span>
                {field.max !== undefined && (
                  <span className={`${fieldValue.length > field.max ? 'text-red-500' : 'text-gray-400'}`}>
                    {fieldValue.length}/{field.max}
                  </span>
                )}
                {field.min !== undefined && field.max === undefined && (
                  <span className={`${fieldValue.length < field.min ? 'text-red-500' : 'text-gray-400'}`}>
                    {fieldValue.length}/{field.min} min
                  </span>
                )}
              </div>
            )}
          </div>
        );
    }
  };

  const content = (
    <>
      {showHeader && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-strong">Slot Details</h2>
              <p className="text-xs text-gray-600 mt-1">
                {readOnly
                  ? "View booking slot information"
                  : "Configure each slot with required information"}
              </p>
            </div>
            {!readOnly && (
              <Button
                variant="outline"
                onClick={() => handleAddSlot?.()}
                className="h-9 px-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Slot
              </Button>
            )}
          </div>

          {/* Progress Summary */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-700">
                {slotDetails.filter(isSlotComplete).length} of{" "}
                {slotDetails.length} slots complete
              </span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-600 transition-all duration-300"
                    style={{
                      width: `${(slotDetails.filter(isSlotComplete).length / slotDetails.length) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500">
                  {Math.round(
                    (slotDetails.filter(isSlotComplete).length /
                      slotDetails.length) *
                      100
                  )}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {readOnly ? (
        <div className="space-y-4">
          {/* Summary Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-3 h-3 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-xs">
                    Booking Summary
                  </h3>
                  <p className="text-xs text-gray-600">
                    {slotDetails.length} slot{slotDetails.length !== 1 ? 's' : ''} • Total: ${slotDetails.reduce((sum, slot) => sum + getSlotPrice(slot), 0).toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Total Amount</div>
                <div className="text-sm font-bold text-gray-900">
                  ${slotDetails.reduce((sum, slot) => sum + getSlotPrice(slot), 0).toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Slots Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {slotDetails.map((slot, idx) => (
              <div
                key={`slot-${idx}`}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
              >
                {/* Slot Header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">
                      {idx + 1}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-xs">
                    Slot {idx + 1}
                  </h3>
                </div>

                {/* Slot Type + Price */}
                {customSlotTypes && customSlotTypes.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center gap-1 mb-1">
                      <Hash className="w-3 h-3 text-gray-400" />
                      <span className="text-xs font-medium text-gray-700">Slot Type</span>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded p-2 flex items-center justify-between">
                      <span className="font-bold text-blue-900 text-xs uppercase">
                        {slot.type || "Not selected"}
                      </span>
                      <span className="font-semibold text-gray-900 text-xs ml-2 whitespace-nowrap">
                        ${getSlotPrice(slot)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Custom Fields */}
                {customSlotFields.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 mb-2">
                      <FileText className="w-3 h-3 text-gray-400" />
                      <span className="text-xs font-medium text-gray-700">Additional Details</span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      {customSlotFields.map((field) => {
                        const value = slot[field.name];
                        const hasValue = value && value.toString().trim() !== '';
                        // Render checkbox for checkbox fields
                        if (field.type === 'checkbox') {
                          return (
                            <div
                              key={field.name}
                              className={`rounded p-2 border bg-gray-50 border-gray-200 flex items-center gap-2`}
                            >
                              <input
                                type="checkbox"
                                checked={value === 'true' || value === true}
                                readOnly
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-xs font-medium text-gray-700">
                                {field.label}
                              </span>
                            </div>
                          );
                        }
                        // Default display for other fields
                        return (
                          <div
                            key={field.name}
                            className={`rounded p-2 border ${
                              hasValue 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-gray-700">
                                {field.label}
                              </span>
                            </div>
                            <div className={`text-xs ${
                              hasValue ? 'text-green-900 font-medium' : 'text-gray-500 italic'
                            }`}>
                              {hasValue ? value : "Not provided"}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Empty State for No Custom Fields */}
                {customSlotFields.length === 0 && (
                  <div className="text-center py-2 text-gray-500 text-xs">
                    No additional details required for this slot type
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Editable mode: use the same grid/card layout as readonly, but with inputs
        <div className="space-y-4">
          {/* Slots Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {slotDetails.map((slot, idx) => {
              const slotErrors = getSlotErrors(idx);
              const isComplete = isSlotComplete(slot);
              return (
                <div
                  key={`slot-${idx}`}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative"
                >
                  {/* Remove Button (top right, icon only) */}
                  {slotDetails.length > 1 && (
                    <button
                      onClick={() => handleRemoveSlot?.(idx)}
                      className="absolute top-2 right-2 p-1 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                      aria-label="Remove Slot"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  {/* Slot Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <span className="text-white font-bold text-xs">
                        {idx + 1}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-xs">
                      Slot {idx + 1}
                    </h3>
                    <span className={`ml-2 text-xs font-medium ${isComplete ? 'text-green-600' : 'text-red-500'}`}>{isComplete ? 'Complete' : 'Incomplete'}</span>
                  </div>

                  {/* Slot Type + Price (editable) */}
                  {customSlotTypes && customSlotTypes.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center gap-1 mb-1">
                        <Hash className="w-3 h-3 text-gray-400" />
                        <span className="text-xs font-medium text-gray-700">Slot Type</span>
                        {slotErrors.includes("Type is required") && (
                          <span className="text-red-500 text-xs ml-1">*</span>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        {customSlotTypes.map((type) => (
                          <label
                            key={`slot-type-${type.name}-${idx}`}
                            className={`relative cursor-pointer transition-all duration-200`}
                          >
                            <div
                              className={`p-2 rounded-lg border-2 transition-all duration-200 flex items-center justify-between ${
                                slot.type === type.name
                                  ? "bg-blue-50 border-blue-400"
                                  : "bg-white border-blue-200 hover:border-blue-300"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`slot-type-${idx}`}
                                  checked={slot.type === type.name}
                                  onChange={() =>
                                    handleSlotFieldChange(
                                      idx,
                                      "type",
                                      type.name
                                    )
                                  }
                                  className="w-4 h-4 text-gray-600 border-gray-300 focus:ring-gray-500"
                                />
                                <span className="font-semibold text-gray-900 capitalize text-xs">
                                  {type.name}
                                </span>
                              </div>
                              <span className="text-sm font-bold text-gray-900 ml-2">
                                ${type.price}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                      {slotErrors.includes("Type is required") && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-xs text-red-600">
                            Please select a slot type
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Custom Fields (editable) */}
                  {customSlotFields.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center gap-1 mb-2">
                        <FileText className="w-3 h-3 text-gray-400" />
                        <span className="text-xs font-medium text-gray-700">Additional Details</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {customSlotFields.map((field) => (
                          <div
                            key={`slot-field-${field.name}-${idx}`}
                            className="space-y-2"
                          >
                            <div className="flex items-center gap-2">
                              <label className="text-xs font-medium text-gray-800">
                                {field.label}
                              </label>
                              {field.required && (
                                <span className="text-red-500 text-xs">*</span>
                              )}
                            </div>
                            {renderFieldInput(field, slot, idx)}
                            {slotErrors.some(error => 
                              error.includes(field.label) && (
                                error.includes("is required") || 
                                error.includes("must be at least") || 
                                error.includes("must be no more than")
                              )
                            ) && (
                              <div className="mt-1 p-1.5">
                                <p className="text-xs text-right text-red-600">
                                  {slotErrors.find(error => 
                                    error.includes(field.label) && (
                                      error.includes("is required") || 
                                      error.includes("must be at least") || 
                                      error.includes("must be no more than")
                                    )
                                  )}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );

  if (showCard) {
    return (
      <div className="rounded-xl border bg-white shadow-sm p-6">{content}</div>
    );
  }

  return content;
};

export default SlotDetails;
