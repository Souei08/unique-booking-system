// Types
import { DateValue } from "@internationalized/date";
import { format } from "date-fns";
import {
  CustomerInformation,
  PaymentInformation,
  SlotDetail,
} from "@/app/_features/booking/types/booking-types";

import { Tour } from "@/app/_features/tours/tour-types";
import { Product } from "@/app/_features/products/types/product-types";

import { useState, useEffect } from "react";
import { getAssignedToursByTourId } from "@/app/_features/products/api/getAssignedToursByTourId";
import { toast } from "sonner";
import { formatTime } from "@/app/_lib/utils/formatTime";
import SlotDetails, {
  CustomSlotType,
  CustomSlotField,
} from "@/app/_features/booking/components/CreateBookingv2/booking-steps/SlotDetails";
import PersonalInformation from "@/app/_features/booking/components/CreateBookingv2/booking-steps/PersonalInformation";
import AdditionalProducts from "@/app/_features/booking/components/CreateBookingv2/booking-steps/AdditionalProducts";
import { getRemainingSlots } from "@/app/_features/manage-additional-booking/api/getRemaningSlots";

const ManageCheckForm = ({
  selectedTour,
  selectedDate,
  selectedTime,
  numberOfPeople,
  setNumberOfPeople,
  customerInformation,
  paymentInformation,
  setPaymentInformation,
  setCustomerInformation,
  handleCompleteBooking,
  selectedProducts,
  setSelectedProducts,
  productQuantities,
  setProductQuantities,
  availableProducts,
  setAvailableProducts,
  isAdmin = false,
  isLoading = false,
  setSlotDetails,
  slotDetails,
  customSlotTypes,
  customSlotFields,
  handleNext,
  handleBack,
  calculateTotal,
  appliedPromo,
  onPromoApplied,
  onPromoRemoved,
  calculateSubtotal,
  originalBooking = null,
}: {
  selectedTour: Tour;
  selectedDate: DateValue;
  selectedTime: string;
  numberOfPeople: number;
  setNumberOfPeople: (number: number) => void;
  customerInformation: CustomerInformation;
  paymentInformation: PaymentInformation;
  setPaymentInformation: (paymentInformation: PaymentInformation) => void;
  setCustomerInformation: (
    customerInformation:
      | CustomerInformation
      | ((prev: CustomerInformation) => CustomerInformation)
  ) => void;
  handleCompleteBooking: (
    paymentId: string | null,
    existingBookingId: string | null
  ) => void;
  selectedProducts: string[];
  setSelectedProducts: (
    products: string[] | ((prev: string[]) => string[])
  ) => void;
  productQuantities: Record<string, number>;
  setProductQuantities: (
    quantities:
      | Record<string, number>
      | ((prev: Record<string, number>) => Record<string, number>)
  ) => void;
  availableProducts: Product[];
  setAvailableProducts: (
    products: Product[] | ((prev: Product[]) => Product[])
  ) => void;
  isAdmin?: boolean;
  isLoading?: boolean;
  setSlotDetails: React.Dispatch<React.SetStateAction<SlotDetail[]>>;
  slotDetails: SlotDetail[];
  customSlotTypes: CustomSlotType[] | null;
  customSlotFields: CustomSlotField[];
  handleNext: () => void;
  handleBack: () => void;
  calculateTotal: () => number;
  appliedPromo?: any;
  onPromoApplied?: (promoData: any) => void;
  onPromoRemoved?: () => void;
  calculateSubtotal: () => number;
  originalBooking?: any;
}) => {
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [validationErrors, setValidationErrors] = useState<{
    personalInfo: string[];
    slots: string[];
    payment: string[];
  }>({
    personalInfo: [],
    slots: [],
    payment: [],
  });
  const [remainingSlots, setRemainingSlots] = useState<number>(0);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);

  // Add state for secure promo calculations
  const [securePromoData, setSecurePromoData] = useState<{
    subtotal: number;
    discountAmount: number;
    total: number;
  } | null>(null);

  // Get remaining slots for selected date and time
  const fetchRemainingSlots = async () => {
    if (!selectedDate || !selectedTime || !selectedTour?.id) return;

    try {
      setLoadingTimeSlots(true);
      const remaining = await getRemainingSlots(
        selectedTour.id,
        selectedDate.toString(),
        selectedTime
      );
      setRemainingSlots(remaining);
    } catch (error) {
      console.error("Error fetching remaining slots:", error);
      setRemainingSlots(0);
      toast.error("Failed to fetch availability");
    } finally {
      setLoadingTimeSlots(false);
    }
  };

  // Update remaining slots when date, time, or tour changes
  useEffect(() => {
    if (selectedTour?.id && selectedDate && selectedTime) {
      fetchRemainingSlots();
    }
  }, [selectedTour?.id, selectedDate, selectedTime]);

  // Set initial group size from booking details if available
  // useEffect(() => {
  //   if (originalBooking && originalBooking.slots && numberOfPeople === 0) {
  //     // Use the remaining slots as the initial group size, but don't exceed it
  //     const initialSize = Math.min(originalBooking.slots, remainingSlots);
  //     if (initialSize > 0) {
  //       setNumberOfPeople(initialSize);
  //     }
  //   }
  // }, [originalBooking, remainingSlots, numberOfPeople, setNumberOfPeople]);

  // Handle slot details change
  const handleSlotDetailsChange = (
    details: SlotDetail[],
    totalPrice: number
  ) => {
    // Update slot details with prices
    const updatedSlotDetails = details.map((slot) => ({
      ...slot,
      price: getSlotPrice(slot),
    }));

    // Update the slot details state
    setSlotDetails(updatedSlotDetails);
  };

  // Handle adding a new slot
  const handleAddSlot = () => {
    // Check against remaining slots
    if (numberOfPeople >= remainingSlots) {
      toast.error("No more slots available", {
        description: `Only ${remainingSlots} slots remaining for this time.`,
      });
      return;
    }

    setNumberOfPeople(numberOfPeople + 1);
    setSlotDetails((prev) => [
      ...prev,
      {
        type: customSlotTypes?.[0]?.name || "",
        price: customSlotTypes?.[0]?.price || 0,
      },
    ]);
  };

  // Handle increasing regular group size
  const handleIncreaseGroupSize = () => {
    // Check against remaining slots
    if (numberOfPeople >= remainingSlots) {
      toast.error("No more slots available", {
        description: `Only ${remainingSlots} slots remaining for this time.`,
      });
      return;
    }
    setNumberOfPeople(numberOfPeople + 1);
  };

  // Handle removing a slot
  const handleRemoveSlot = (index: number) => {
    setNumberOfPeople(numberOfPeople - 1);
    setSlotDetails((prev) => {
      const newSlots = [...prev];
      newSlots.splice(index, 1);
      return newSlots;
    });
  };

  // Validate slots and return validation result
  const validateSlots = (slots: SlotDetail[]) => {
    const errors: string[] = [];

    // If no slots, that's valid (allows empty slotDetails)
    if (slots.length === 0) {
      return {
        isValid: true,
        errors: [],
      };
    }

    // Validate each slot
    slots.forEach((slot, index) => {
      // Validate custom slot fields
      customSlotFields.forEach((field) => {
        if (field.required) {
          const value = slot[field.name];
          if (value === undefined || value === null || value === "") {
            errors.push(`Slot ${index + 1}: ${field.label} is required`);
          } else {
            // Validate min/max constraints
            if (field.type === "text" && typeof value === "string") {
              if (field.min !== undefined && value.length < field.min) {
                errors.push(`Slot ${index + 1}: ${field.label} must be at least ${field.min} characters`);
              }
              if (field.max !== undefined && value.length > field.max) {
                errors.push(`Slot ${index + 1}: ${field.label} must be no more than ${field.max} characters`);
              }
            } else if (field.type === "number" && typeof value === "string") {
              const numValue = parseFloat(value);
              if (!isNaN(numValue)) {
                if (field.min !== undefined && numValue < field.min) {
                  errors.push(`Slot ${index + 1}: ${field.label} must be at least ${field.min}`);
                }
                if (field.max !== undefined && numValue > field.max) {
                  errors.push(`Slot ${index + 1}: ${field.label} must be no more than ${field.max}`);
                }
              }
            }
          }
        }
      });

      // Validate slot type if custom slot types exist and are not empty
      if (customSlotTypes && customSlotTypes.length > 0) {
        if (!slot.type) {
          errors.push(`Slot ${index + 1}: Type is required`);
        } else if (!customSlotTypes.find((t) => t.name === slot.type)) {
          errors.push(`Slot ${index + 1}: Invalid type selected`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  // Validate and complete booking
  const validateAndCompleteBooking = async (
    paymentId: string | null = null
  ) => {
    const errors = {
      personalInfo: [] as string[],
      slots: [] as string[],
      payment: [] as string[],
    };

    // Check if at least 1 product or 1 slot is added
    const hasProducts = selectedProducts.length > 0;
    const hasSlots = numberOfPeople > 0;

    if (!hasProducts && !hasSlots) {
      errors.slots.push("Please add at least 1 product or 1 slot to proceed");
    }

    // Only check if trying to book more than available (allow 0 slots)
    if (numberOfPeople > 0 && numberOfPeople > remainingSlots) {
      errors.slots.push(
        `Group size (${numberOfPeople}) exceeds available slots (${remainingSlots})`
      );
    }

    // Validate slots first
    const slotValidation = validateSlots(slotDetails);
    if (!slotValidation.isValid) {
      errors.slots = [...errors.slots, ...slotValidation.errors];
    }

    // Validate personal information
    const requiredFields: (keyof CustomerInformation)[] = [
      "first_name",
      "last_name",
      "email",
      "phone_number",
    ];

    const missingFields = requiredFields.filter(
      (field) =>
        !customerInformation[field] || customerInformation[field].trim() === ""
    );

    if (missingFields.length > 0) {
      errors.personalInfo = missingFields.map((field) =>
        field
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (
      customerInformation.email &&
      !emailRegex.test(customerInformation.email)
    ) {
      errors.personalInfo.push("Please enter a valid email address");
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (
      customerInformation.phone_number &&
      !phoneRegex.test(customerInformation.phone_number)
    ) {
      errors.personalInfo.push("Please enter a valid phone number");
    }

    // Validate payment information
    if (!paymentInformation.payment_method) {
      errors.payment.push("Please select a payment method");
    }

    setValidationErrors(errors);

    // If any errors exist, return false
    if (Object.values(errors).some((arr) => arr.length > 0)) {
      return false;
    }

    // If admin, proceed with booking
    if (isAdmin) {
      try {
        await handleCompleteBooking(paymentId, null);
        return true;
      } catch (error) {
        console.error("Error completing booking:", error);
        toast.error("Failed to complete booking. Please try again.");
        return false;
      }
    } else {
      handleNext();
    }
  };

  // Get price per slot
  const getSlotPrice = (slot: SlotDetail) => {
    if (customSlotTypes) {
      const typeDef = customSlotTypes.find((t) => t.name === slot.type);
      return typeDef ? typeDef.price : selectedTour.rate;
    }
    return selectedTour.rate;
  };

  // Fetch available products for the selected tour
  const fetchProducts = async () => {
    if (!selectedTour.id) return;

    try {
      setIsLoadingProducts(true);
      const assignedTours = await getAssignedToursByTourId(selectedTour.id);
      setAvailableProducts(assignedTours as unknown as Product[]);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch available products");
      setAvailableProducts([]); // Reset products on error
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Only fetch products when the component mounts or when explicitly needed
  useEffect(() => {
    if (selectedTour.id) {
      fetchProducts();
    }
  }, [selectedTour.id]);

  // Add useEffect to update total price
  useEffect(() => {
    const total = calculateTotal();
    setPaymentInformation({
      ...paymentInformation,
      total_price: total,
    });
  }, [
    selectedProducts,
    selectedTour.rate,
    slotDetails,
    numberOfPeople,
    appliedPromo,
  ]);

  // Calculate secure promo data when appliedPromo changes
  useEffect(() => {
    const calculateSecurePromo = async () => {
      if (!appliedPromo) {
        setSecurePromoData(null);
        return;
      }

      try {
        const response = await fetch("/api/validate-promo", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: appliedPromo.code,
            totalAmount: calculateSubtotal(),
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          const subtotal = calculateSubtotal();

          setSecurePromoData({
            subtotal,
            discountAmount: data.promo.discount_amount,
            total: data.promo.final_amount,
          });
        } else {
          // If validation fails, remove the promo
          onPromoRemoved?.();
          setSecurePromoData(null);
        }
      } catch (error) {
        console.error("Error calculating secure promo:", error);
        setSecurePromoData(null);
      }
    };

    calculateSecurePromo();
  }, [appliedPromo, calculateSubtotal, onPromoRemoved]);

  const tourImages = JSON.parse(selectedTour.images) as {
    url: string;
    isFeature: boolean;
  }[];
  const featuredImage = tourImages.find((image) => image.isFeature);

  const formattedDate = format(
    new Date(selectedDate.year, selectedDate.month - 1, selectedDate.day),
    "MMM dd, yyyy"
  );

  return (
    <div className="max-w-5xl mx-auto px-3 py-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-3">
          {/* Personal Information */}

          <PersonalInformation
            customerInformation={customerInformation}
            setCustomerInformation={setCustomerInformation}
            validationErrors={validationErrors}
          />

          {/* Slot Details */}
          {customSlotTypes || customSlotFields.length > 0 ? (
            <>
              {remainingSlots === 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="h-5 w-5 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-red-800">
                      Slot is fully booked
                    </span>
                  </div>
                  <p className="text-sm text-red-600 mt-1">
                    This time slot has no available spaces.
                  </p>
                </div>
              )}
              {numberOfPeople === 0 && remainingSlots > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="h-5 w-5 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-blue-800">
                      No slots selected
                    </span>
                  </div>
                  <p className="text-sm text-blue-600 mt-1">
                    You can proceed with additional products only, or add slots
                    to your booking.
                  </p>
                </div>
              )}
              <SlotDetails
                numberOfPeople={numberOfPeople}
                customSlotTypes={customSlotTypes}
                customSlotFields={customSlotFields}
                tourRate={selectedTour.rate}
                onSlotDetailsChange={handleSlotDetailsChange}
                setSlotDetails={setSlotDetails}
                slotDetails={slotDetails}
                readOnly={remainingSlots === 0}
                handleAddSlot={handleAddSlot}
                handleRemoveSlot={handleRemoveSlot}
              />
            </>
          ) : (
            <>
              {numberOfPeople === 0 && remainingSlots > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="h-5 w-5 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-blue-800">
                      No slots selected
                    </span>
                  </div>
                  <p className="text-sm text-blue-600 mt-1">
                    You can proceed with additional products only, or add slots
                    to your booking.
                  </p>
                </div>
              )}
              <SlotDetails
                numberOfPeople={numberOfPeople}
                customSlotTypes={customSlotTypes}
                customSlotFields={customSlotFields}
                tourRate={selectedTour.rate}
                onSlotDetailsChange={handleSlotDetailsChange}
                setSlotDetails={setSlotDetails}
                slotDetails={slotDetails}
                readOnly={remainingSlots === 0}
                handleAddSlot={handleAddSlot}
                handleRemoveSlot={handleRemoveSlot}
              />
            </>
          )}

          {/* Additional Products */}
          <AdditionalProducts
            isLoadingProducts={isLoadingProducts}
            availableProducts={availableProducts}
            selectedProducts={selectedProducts}
            setSelectedProducts={setSelectedProducts}
            productQuantities={productQuantities}
            setProductQuantities={setProductQuantities}
          />
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border bg-white shadow-sm p-4 sm:p-6 sticky top-4">
            <h2 className="text-lg font-bold text-strong mb-4">
              Order Summary
            </h2>
            <div className="space-y-4">
              {/* Selected Tour Summary */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                    <img
                      src={featuredImage?.url}
                      alt={selectedTour.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-[#1a1a1a] truncate">
                      {selectedTour.title}
                    </h3>
                    <p className="text-xs text-[#666666]">
                      {selectedTour.duration} hours
                    </p>
                  </div>
                </div>

                {/* Date and Time Section */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="h-4 w-4 text-[#0066cc]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <div>
                      <p className="text-xs font-medium text-[#666666]">
                        Selected Date
                      </p>
                      <p className="text-sm font-semibold text-[#1a1a1a]">
                        {formattedDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg
                      className="h-4 w-4 text-[#0066cc]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-xs font-medium text-[#666666]">
                        Selected Time
                      </p>
                      <p className="text-sm font-semibold text-[#1a1a1a]">
                        {formatTime(selectedTime)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Group Size Controls - Only show when custom slot types exist */}
                {customSlotTypes && (
                  <div className="flex items-center justify-between text-xs text-[#666666]">
                    <span>Slots</span>
                    <div className="flex items-center space-x-2 bg-white rounded-lg px-3 py-1.5 border border-gray-300">
                      <button
                        onClick={() => {
                          if (numberOfPeople > 0) {
                            setNumberOfPeople(numberOfPeople - 1);
                          }
                        }}
                        className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#0066cc]/10 transition-colors disabled:opacity-50 disabled:hover:bg-transparent text-sm font-medium"
                        disabled={numberOfPeople <= 0}
                        aria-label="Decrease group size"
                      >
                        -
                      </button>
                      <span className="font-medium w-6 text-center text-sm">
                        {numberOfPeople}
                      </span>
                      <button
                        onClick={handleIncreaseGroupSize}
                        className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#0066cc]/10 transition-colors disabled:opacity-50 disabled:hover:bg-transparent text-sm font-medium"
                        disabled={
                          remainingSlots === 0 ||
                          numberOfPeople >= remainingSlots
                        }
                        aria-label="Increase group size"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {/* Availability */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#666666]">Available Slots</span>
                  {loadingTimeSlots ? (
                    <span className="text-[#666666]">Loading...</span>
                  ) : (
                    <span
                      className={
                        remainingSlots > 0
                          ? "text-emerald-600 font-medium"
                          : "text-red-600 font-medium"
                      }
                    >
                      {remainingSlots} available
                    </span>
                  )}
                </div>
              </div>

              {/* Payment Breakdown */}
              <div className="border-t pt-6 ">
                {/* Tour Price Section */}
                <div className=" rounded-lg mb-4">
                  <h4 className="text-sm font-semibold text-[#666666]">
                    Tour Booking
                  </h4>
                  {customSlotTypes && customSlotTypes.length > 0 ? (
                    <div className="space-y-2">
                      {(() => {
                        const groupedSlots = slotDetails.reduce(
                          (acc, slot) => {
                            const slotType = customSlotTypes.find(
                              (type) => type.name === slot.type
                            );
                            const typeName = slotType?.name || "Default";
                            const price = slotType?.price || 0;

                            if (!acc[typeName]) {
                              acc[typeName] = {
                                count: 0,
                                price: price,
                              };
                            }
                            acc[typeName].count++;
                            return acc;
                          },
                          {} as Record<string, { count: number; price: number }>
                        );

                        return Object.entries(groupedSlots).map(
                          ([typeName, { count, price }], index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-[#0066cc]"></div>
                                <div>
                                  <span className="text-sm font-medium text-[#1a1a1a] capitalize">
                                    {typeName}
                                  </span>
                                  <p className="text-xs text-[#666666]">
                                    ${price} × {count}
                                  </p>
                                </div>
                              </div>
                              <span className="text-sm font-semibold text-[#1a1a1a]">
                                ${(price * count).toFixed(2)}
                              </span>
                            </div>
                          )
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-[#0066cc]"></div>
                        <div>
                          <span className="text-sm font-medium text-[#1a1a1a]">
                            Regular Price
                          </span>
                          <p className="text-xs text-[#666666]">
                            ${selectedTour.rate} × {numberOfPeople}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-[#1a1a1a]">
                        ${(selectedTour.rate * numberOfPeople).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Additional Products */}
                {selectedProducts.length > 0 && (
                  <div className="bg-gray-50 rounded-lg mb-4">
                    <h4 className="text-sm font-semibold text-[#666666]">
                      Additional Services
                    </h4>
                    <div className="space-y-2">
                      {selectedProducts.map((productId) => {
                        const product = availableProducts.find(
                          (p) => p.id === productId
                        );
                        const quantity = productQuantities[productId] || 1;
                        return product ? (
                          <div
                            key={product.id}
                            className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                              <div>
                                <span className="text-sm font-medium text-[#1a1a1a]">
                                  {product.name}
                                </span>
                                <p className="text-xs text-[#666666]">
                                  ${product.price} × {quantity}
                                </p>
                              </div>
                            </div>
                            <span className="text-sm font-semibold text-[#1a1a1a]">
                              ${(product.price * quantity).toFixed(2)}
                            </span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {/* Price Summary */}
                <div className="space-y-3">
                  {/* Subtotal */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-[#666666]">Subtotal</span>
                    <span className="text-sm font-semibold text-[#1a1a1a]">
                      $
                      {securePromoData
                        ? securePromoData.subtotal.toFixed(2)
                        : calculateSubtotal().toFixed(2)}
                    </span>
                  </div>

                  {/* Promo Code Discount */}
                  {appliedPromo && securePromoData && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#666666]">Discount</span>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
                          {appliedPromo.code}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-emerald-600">
                        -${securePromoData.discountAmount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* Total Amount */}
                  <div className="flex justify-between items-center pt-3">
                    <div>
                      <span className="text-base font-bold text-[#1a1a1a]">
                        Total Amount
                      </span>
                      <p className="text-xs text-[#666666] mt-1">
                        Including all taxes and fees
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-[#0066cc]">
                        $
                        {securePromoData
                          ? securePromoData.total.toFixed(2)
                          : calculateTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mt-6">
              {isAdmin ? (
                <button
                  onClick={() => validateAndCompleteBooking()}
                  className="w-full bg-[#0066cc] text-white hover:bg-[#0052a3] px-4 py-3 rounded-lg text-base font-semibold flex items-center justify-center disabled:bg-gray-400 disabled:hover:bg-gray-400 transition-all duration-300"
                  disabled={
                    isLoading ||
                    (selectedProducts.length === 0 && numberOfPeople === 0)
                  }
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>{" "}
                      Creating...
                    </span>
                  ) : (
                    "Create Booking"
                  )}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => validateAndCompleteBooking(null)}
                    className="w-full rounded-lg bg-[#0066cc] px-6 py-3 text-base font-semibold text-white hover:bg-[#0052a3] focus:ring-2 focus:ring-[#0066cc] focus:ring-offset-2 focus:outline-none disabled:bg-gray-400 disabled:hover:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300"
                    disabled={
                      !selectedTime ||
                      (selectedProducts.length === 0 && numberOfPeople === 0)
                    }
                  >
                    Continue to Payment
                  </button>
                  <button
                    onClick={handleBack}
                    className="w-full rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:outline-none transition-all duration-300"
                  >
                    Back
                  </button>
                </>
              )}
            </div>

            {/* Error Summary */}
            {(validationErrors.personalInfo.length > 0 ||
              validationErrors.slots.length > 0 ||
              validationErrors.payment.length > 0) && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-sm font-semibold text-red-800 mb-3">
                  Please fix the following errors:
                </h3>
                <ul className="text-sm text-red-600 space-y-2">
                  {validationErrors.personalInfo.map((error, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="mt-0.5 w-1 h-1 bg-red-600 rounded-full flex-shrink-0"></span>
                      <span>{error}</span>
                    </li>
                  ))}
                  {validationErrors.slots.map((error, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="mt-0.5 w-1 h-1 bg-red-600 rounded-full flex-shrink-0"></span>
                      <span>{error}</span>
                    </li>
                  ))}
                  {validationErrors.payment.map((error, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="mt-0.5 w-1 h-1 bg-red-600 rounded-full flex-shrink-0"></span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCheckForm;
