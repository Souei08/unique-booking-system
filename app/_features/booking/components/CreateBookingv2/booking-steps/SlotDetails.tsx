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
  const [activeSlot, setActiveSlot] = useState<number>(0);

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

    // Check required custom fields
    return !customSlotFields.some(
      (field) =>
        field.required && (!slot[field.name] || slot[field.name] === "")
    );
  };

  // Validate slots and return validation result
  const validateSlots = () => {
    const errors: { [key: string]: string[] } = {};
    slotDetails.forEach((slot, idx) => {
      const slotErrors: string[] = [];

      // Validate custom slot fields
      customSlotFields.forEach((field) => {
        if (field.required) {
          const value = slot[field.name];
          if (value === undefined || value === null || value === "") {
            slotErrors.push(`${field.label} is required`);
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

  // Get errors for current slot
  const getCurrentSlotErrors = () => {
    return slotErrors[`slot-${activeSlot}`] || [];
  };

  const content = (
    <>
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-strong">
              Slot Details
            </h2>
            <p className="text-xs text-weak mt-0.5">
              {readOnly
                ? "View booking slot information"
                : "Manage booking slots and their details"}
            </p>
          </div>
          {!readOnly && (
            <div className="flex items-center gap-3 justify-end">
              <div className="flex items-center gap-2 text-xs">
                <div className="text-gray-600">
                  {slotDetails.filter(isSlotComplete).length}/
                  {slotDetails.length} slots completed
                </div>
                <div className="h-1 w-16 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand transition-all duration-300"
                    style={{
                      width: `${
                        (slotDetails.filter(isSlotComplete).length /
                          slotDetails.length) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {readOnly ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {slotDetails.map((slot, idx) => (
            <div
              key={`slot-${idx}`}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center">
                    <span className="text-brand font-semibold">{idx + 1}</span>
                  </div>
                  <h3 className="font-bold text-strong text-base">
                    Slot {idx + 1}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-sm text-weak">Price</div>
                  <div className="text-base font-bold text-brand">
                    ${getSlotPrice(slot)}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="text-sm text-weak mb-1">Selected Type</div>
                  <div className="font-medium text-strong">
                    {slot.type || "Not selected"}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {customSlotFields.map((field) => (
                    <div
                      key={field.name}
                      className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                    >
                      <div className="text-sm text-weak mb-1">
                        {field.label}
                      </div>
                      <div className="text-strong">
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
        <>
          {/* Slot Navigation */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold text-strong">
                Select Slot
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddSlot?.()}
                  className="h-8 text-xs"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Slot
                </Button>
              </div>
            </div>
            <div
              className={`grid gap-2 ${
                slotDetails.length === 2
                  ? "grid-cols-2"
                  : slotDetails.length === 3
                    ? "grid-cols-1 sm:grid-cols-3"
                    : slotDetails.length === 4
                      ? "grid-cols-2 sm:grid-cols-4"
                      : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
              }`}
            >
              {slotDetails.map((slot, idx) => (
                <div key={`slot-nav-${idx}`} className="group relative">
                  <div
                    onClick={() => setActiveSlot(idx)}
                    className={`flex flex-col items-center p-2 rounded-lg border transition-all ${
                      activeSlot === idx
                        ? "bg-blue-50 text-brand border-blue-200 shadow-sm"
                        : isSlotComplete(slot)
                          ? "bg-green-50/50 text-green-700 border-green-200 hover:bg-green-50"
                          : slotErrors[`slot-${idx}`]?.length > 0
                            ? "bg-red-50/50 text-red-600 border-red-200 hover:bg-red-50"
                            : "bg-gray-50 hover:bg-gray-100 border-gray-200"
                    } cursor-pointer`}
                  >
                    <div
                      className={`flex items-center justify-center w-7 h-7 rounded-full mb-1 transition-colors ${
                        activeSlot === idx
                          ? "bg-brand/50 text-white"
                          : isSlotComplete(slot)
                            ? "bg-green-100 text-green-700"
                            : slotErrors[`slot-${idx}`]?.length > 0
                              ? "bg-red-100 text-red-600"
                              : "bg-gray-100 text-weak"
                      }`}
                    >
                      <span className="font-medium text-sm">{idx + 1}</span>
                    </div>
                    <span
                      className={`text-xs font-medium transition-colors ${
                        activeSlot === idx
                          ? "text-brand"
                          : isSlotComplete(slot)
                            ? "text-green-700"
                            : slotErrors[`slot-${idx}`]?.length > 0
                              ? "text-red-600"
                              : "text-weak"
                      }`}
                    >
                      Slot {idx + 1}
                    </span>
                    {slot?.type && (
                      <span
                        className={`text-xs mt-0.5 transition-colors ${
                          activeSlot === idx
                            ? "text-brand/80"
                            : isSlotComplete(slot)
                              ? "text-green-600/80"
                              : slotErrors[`slot-${idx}`]?.length > 0
                                ? "text-red-500/80"
                                : "text-weak/70"
                        } line-clamp-1`}
                      >
                        {slot.type}
                      </span>
                    )}
                  </div>
                  {slotDetails.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveSlot?.(idx);
                      }}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-100 text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Active Slot Form */}
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="mb-10">
                <div className="space-y-0.5">
                  <h4 className="text-base font-semibold text-strong">
                    Slot {activeSlot + 1} Information
                  </h4>
                  {!readOnly && (
                    <p className="text-xs text-weak">
                      {isSlotComplete(slotDetails[activeSlot])
                        ? "✓ All information completed"
                        : "Please fill in the required fields"}
                    </p>
                  )}
                </div>
              </div>

              {customSlotTypes && customSlotTypes.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2.5">
                    <label className="text-sm font-medium text-gray-800">
                      Select Slot Type
                    </label>
                    <Tooltip content="Choose the type of slot for this booking">
                      <InfoIcon className="w-3.5 h-3.5 text-gray-500" />
                    </Tooltip>
                    {!readOnly &&
                      getCurrentSlotErrors().includes("Type is required") && (
                        <span className="text-red-500">*</span>
                      )}
                  </div>
                  <div
                    className={`grid gap-2 ${
                      customSlotTypes.length === 2
                        ? "grid-cols-1 sm:grid-cols-2"
                        : customSlotTypes.length === 3
                          ? "grid-cols-1 sm:grid-cols-3"
                          : customSlotTypes.length === 4
                            ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
                            : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
                    }`}
                  >
                    {customSlotTypes.map((type) => (
                      <label
                        key={`slot-type-${type.name}`}
                        className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                          slotDetails[activeSlot]?.type === type.name
                            ? "bg-brand/5 border-brand/80"
                            : "bg-gray-50 hover:bg-gray-100 border-gray-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`slot-type-${activeSlot}`}
                          checked={slotDetails[activeSlot]?.type === type.name}
                          onChange={() =>
                            handleSlotFieldChange(activeSlot, "type", type.name)
                          }
                          className="w-4 h-4 text-brand border-gray-300 focus:ring-brand"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-strong truncate">
                            {type.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            ${type.price}
                          </div>
                        </div>
                        {slotDetails[activeSlot]?.type === type.name && (
                          <div className="w-5 h-5 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-brand" />
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                  {!readOnly &&
                    getCurrentSlotErrors().includes("Type is required") && (
                      <p className="mt-1.5 text-xs text-red-500">
                        Please select a slot type
                      </p>
                    )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {customSlotFields.map((field) => (
                  <div key={`slot-field-${field.name}`} className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <label className="text-sm font-medium text-gray-800">
                        {field.label}
                      </label>
                      {!readOnly && field.required && (
                        <span className="text-red-500">*</span>
                      )}
                      <Tooltip content={field.placeholder}>
                        <InfoIcon className="w-3.5 h-3.5 text-gray-500" />
                      </Tooltip>
                    </div>
                    {readOnly ? (
                      <div className="w-full px-3 py-2 bg-gray-50 border rounded-lg border-gray-200 text-sm text-strong">
                        {slotDetails[activeSlot][field.name] || "-"}
                      </div>
                    ) : (
                      <>
                        <input
                          className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm text-strong placeholder:text-gray-400 ${
                            getCurrentSlotErrors().includes(
                              `${field.label} is required`
                            )
                              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                              : "border-gray-200"
                          }`}
                          type={field.type}
                          value={slotDetails[activeSlot]?.[field.name] || ""}
                          onChange={(e) =>
                            handleSlotFieldChange(
                              activeSlot,
                              field.name,
                              e.target.value
                            )
                          }
                          required={field.required}
                          placeholder={field.placeholder}
                        />
                        {getCurrentSlotErrors().includes(
                          `${field.label} is required`
                        ) && (
                          <p className="text-xs text-red-500">
                            {field.label} is required
                          </p>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Navigation Buttons */}
              {!readOnly && (
                <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
                  <button
                    onClick={() =>
                      setActiveSlot((prev) => Math.max(0, prev - 1))
                    }
                    disabled={activeSlot === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
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
                    Previous Slot
                  </button>
                  <button
                    onClick={() =>
                      setActiveSlot((prev) =>
                        Math.min(numberOfPeople - 1, prev + 1)
                      )
                    }
                    disabled={activeSlot === numberOfPeople - 1}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                  >
                    Next Slot
                    <svg
                      className="w-4 h-4"
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
              )}
            </div>
          </div>
        </>
      )}
    </>
  );

  if (showCard) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-4 sm:p-6">
        {content}
      </div>
    );
  }

  return content;
};

export default SlotDetails;
