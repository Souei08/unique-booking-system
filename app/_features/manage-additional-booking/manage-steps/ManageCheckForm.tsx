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
import PromoCodeInput from "@/app/_features/booking/components/CreateBookingv2/booking-steps/PromoCodeInput";
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
    // Check against remaining slots first
    if (numberOfPeople >= remainingSlots) {
      toast.error("No more slots available", {
        description: `Only ${remainingSlots} slots remaining for this time.`,
      });
      return;
    }

    // Also check against group size limit
    if (
      selectedTour.group_size_limit &&
      numberOfPeople >= selectedTour.group_size_limit
    ) {
      toast.error("Group size limit reached", {
        description: `Maximum group size is ${selectedTour.group_size_limit} people.`,
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
    // Check against remaining slots first
    if (numberOfPeople >= remainingSlots) {
      toast.error("No more slots available", {
        description: `Only ${remainingSlots} slots remaining for this time.`,
      });
      return;
    }

    // Also check against group size limit
    if (
      selectedTour.group_size_limit &&
      numberOfPeople >= selectedTour.group_size_limit
    ) {
      toast.error("Group size limit reached", {
        description: `Maximum group size is ${selectedTour.group_size_limit} people.`,
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
          }
        }
      });

      // Validate slot type if custom slot types exist
      if (customSlotTypes) {
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

    // Allow 0 slots - only check if trying to book more than available
    if (numberOfPeople > remainingSlots) {
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
    "MMMM dd, yyyy"
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <PersonalInformation
              customerInformation={customerInformation}
              setCustomerInformation={setCustomerInformation}
              validationErrors={validationErrors}
            />
          </div>

          {/* Slot Details */}
          {(customSlotTypes || customSlotFields.length > 0) && (
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Slot Details</h2>
              <SlotDetails
                numberOfPeople={numberOfPeople}
                customSlotTypes={customSlotTypes}
                customSlotFields={customSlotFields}
                tourRate={selectedTour.rate}
                onSlotDetailsChange={handleSlotDetailsChange}
                setSlotDetails={setSlotDetails}
                slotDetails={slotDetails}
                readOnly={false}
                handleAddSlot={handleAddSlot}
                handleRemoveSlot={handleRemoveSlot}
              />
            </div>
          )}

          {/* Additional Products */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Additional Products</h2>
            <AdditionalProducts
              isLoadingProducts={isLoadingProducts}
              availableProducts={availableProducts}
              selectedProducts={selectedProducts}
              setSelectedProducts={setSelectedProducts}
              productQuantities={productQuantities}
              setProductQuantities={setProductQuantities}
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-lg p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            {/* Tour Info */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                {featuredImage && (
                  <img
                    src={featuredImage.url}
                    alt={selectedTour.title}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                <div>
                  <h3 className="font-medium">{selectedTour.title}</h3>
                  <p className="text-sm text-gray-600">
                    {formattedDate} at {formatTime(selectedTime)}
                  </p>
                </div>
              </div>

              {/* Group Size */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">Group Size</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (numberOfPeople > 0) {
                        setNumberOfPeople(numberOfPeople - 1);
                      }
                    }}
                    className="w-6 h-6 flex items-center justify-center border rounded disabled:opacity-50"
                    disabled={numberOfPeople <= 0}
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium">
                    {numberOfPeople}
                  </span>
                  <button
                    onClick={handleIncreaseGroupSize}
                    className="w-6 h-6 flex items-center justify-center border rounded disabled:opacity-50"
                    disabled={
                      selectedTour.group_size_limit
                        ? numberOfPeople >= selectedTour.group_size_limit
                        : false || numberOfPeople >= remainingSlots
                    }
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Availability */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Available Slots</span>
                {loadingTimeSlots ? (
                  <span>Loading...</span>
                ) : (
                  <span
                    className={
                      remainingSlots > 0 ? "text-green-600" : "text-red-600"
                    }
                  >
                    {remainingSlots} available
                  </span>
                )}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Tour Price</span>
                <span>${(selectedTour.rate * numberOfPeople).toFixed(2)}</span>
              </div>

              {selectedProducts.length > 0 && (
                <div className="flex justify-between">
                  <span>Additional Products</span>
                  <span>
                    $
                    {selectedProducts
                      .reduce((total, productId) => {
                        const product = availableProducts.find(
                          (p) => p.id === productId
                        );
                        const quantity = productQuantities[productId] || 1;
                        return total + (product ? product.price * quantity : 0);
                      }, 0)
                      .toFixed(2)}
                  </span>
                </div>
              )}

              {appliedPromo && securePromoData && (
                <>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>${securePromoData.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-${securePromoData.discountAmount.toFixed(2)}</span>
                  </div>
                </>
              )}

              <div className="border-t pt-3 flex justify-between font-semibold">
                <span>Total</span>
                <span>
                  $
                  {securePromoData
                    ? securePromoData.total.toFixed(2)
                    : calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {isAdmin ? (
                <button
                  onClick={() => validateAndCompleteBooking()}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating..." : "Create Booking"}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => validateAndCompleteBooking(null)}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium disabled:opacity-50"
                    disabled={
                      !selectedTime ||
                      (selectedProducts.length === 0 && numberOfPeople === 0)
                    }
                  >
                    Continue to Payment
                  </button>
                  <button
                    onClick={handleBack}
                    className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium"
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
                <h3 className="text-sm font-medium text-red-800 mb-2">
                  Please fix the following errors:
                </h3>
                <ul className="text-sm text-red-600 space-y-1">
                  {validationErrors.personalInfo.map((error, index) => (
                    <li key={`personal-${index}`}>• {error}</li>
                  ))}
                  {validationErrors.slots.map((error, index) => (
                    <li key={`slots-${index}`}>• {error}</li>
                  ))}
                  {validationErrors.payment.map((error, index) => (
                    <li key={`payment-${index}`}>• {error}</li>
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
