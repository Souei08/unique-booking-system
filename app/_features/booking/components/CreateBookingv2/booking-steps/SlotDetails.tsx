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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const slotsPerPage = 2; // Show 2 slots per page

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

  // Pagination calculations
  const totalPages = Math.ceil(slotDetails.length / slotsPerPage);
  const startIndex = (currentPage - 1) * slotsPerPage;
  const endIndex = startIndex + slotsPerPage;
  const currentSlots = slotDetails.slice(startIndex, endIndex);

  // Get errors for a specific slot
  const getSlotErrors = (slotIndex: number) => {
    return slotErrors[`slot-${slotIndex}`] || [];
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {slotDetails.map((slot, idx) => (
            <div
              key={`slot-${idx}`}
              className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-700 font-semibold text-xs">
                      {idx + 1}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-xs">
                    Slot {idx + 1}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Price</div>
                  <div className="text-xs font-semibold text-gray-900">
                    ${getSlotPrice(slot)}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">
                    Selected Type
                  </div>
                  <div className="font-medium text-gray-900 text-xs">
                    {slot.type || "Not selected"}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {customSlotFields.map((field) => (
                    <div
                      key={field.name}
                      className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                    >
                      <div className="text-xs text-gray-500 mb-1">
                        {field.label}
                      </div>
                      <div className="text-gray-900 text-xs">
                        {slot[field.name] || "-"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Current Slots */}
          <div className="space-y-4">
            {currentSlots.map((slot, idx) => {
              const actualIndex = startIndex + idx;
              const slotErrors = getSlotErrors(actualIndex);
              const isComplete = isSlotComplete(slot);

              return (
                <div
                  key={`slot-${actualIndex}`}
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
                >
                  {/* Slot Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-700 font-bold text-xs">
                          {actualIndex + 1}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">
                          Slot {actualIndex + 1}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {isComplete ? "Complete" : "Incomplete"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Price</div>
                      <div className="text-sm font-semibold text-gray-900">
                        ${getSlotPrice(slot)}
                      </div>
                    </div>
                  </div>

                  {/* Slot Type Selection */}
                  {customSlotTypes && customSlotTypes.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <h4 className="text-xs font-semibold text-gray-900">
                          Select Type
                        </h4>
                        {slotErrors.includes("Type is required") && (
                          <span className="text-red-500 text-xs">*</span>
                        )}
                      </div>
                      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {customSlotTypes.map((type) => (
                          <label
                            key={`slot-type-${type.name}-${actualIndex}`}
                            className={`relative cursor-pointer transition-all duration-200 `}
                          >
                            <div
                              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                                slot.type === type.name
                                  ? "bg-blue-50 border-blue-400"
                                  : "bg-white border-blue-200 hover:border-blue-300"
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <input
                                      type="radio"
                                      name={`slot-type-${actualIndex}`}
                                      checked={slot.type === type.name}
                                      onChange={() =>
                                        handleSlotFieldChange(
                                          actualIndex,
                                          "type",
                                          type.name
                                        )
                                      }
                                      className="w-4 h-4 text-gray-600 border-gray-300 focus:ring-gray-500"
                                    />
                                    <h5 className="font-semibold text-gray-900 capitalize text-xs">
                                      {type.name}
                                    </h5>
                                  </div>
                                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                    {type.description}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-900">
                                      ${type.price}
                                    </span>
                                    {slot.type === type.name && (
                                      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                                        <Check className="w-4 h-4 text-white" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                      {slotErrors.includes("Type is required") && (
                        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-xs text-red-600">
                            Please select a slot type
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Custom Fields */}
                  {customSlotFields.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-xs font-semibold text-gray-900 mb-3">
                        Additional Information
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {customSlotFields.map((field) => (
                          <div
                            key={`slot-field-${field.name}-${actualIndex}`}
                            className="space-y-2"
                          >
                            <div className="flex items-center gap-2">
                              <label className="text-xs font-medium text-gray-800">
                                {field.label}
                              </label>
                              <span className="text-red-500 text-xs">*</span>
                            </div>
                            <input
                              className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-xs text-gray-800 placeholder:text-gray-400 transition-all duration-200 ${
                                slotErrors.includes(
                                  `${field.label} is required`
                                )
                                  ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50"
                                  : "border-gray-300 hover:border-gray-400"
                              }`}
                              type={field.type}
                              value={slot[field.name] || ""}
                              onChange={(e) =>
                                handleSlotFieldChange(
                                  actualIndex,
                                  field.name,
                                  e.target.value
                                )
                              }
                              required={true}
                              placeholder={field.placeholder}
                            />
                            {slotErrors.includes(
                              `${field.label} is required`
                            ) && (
                              <div className="mt-1 p-1.5 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-xs text-red-600">
                                  {field.label} is required
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Remove Button */}
                  {slotDetails.length > 1 && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleRemoveSlot?.(actualIndex)}
                        className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <X className="w-3 h-3" />
                        Remove Slot
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-blue-50 rounded-lg p-3 ">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>
                  Showing {startIndex + 1}-
                  {Math.min(endIndex, slotDetails.length)} of{" "}
                  {slotDetails.length} slots
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-6 h-6 rounded-lg text-xs font-medium transition-colors ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
                >
                  Next
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
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
