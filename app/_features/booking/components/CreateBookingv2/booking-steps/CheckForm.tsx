// Types
import { DateValue } from "@internationalized/date";
import { format } from "date-fns";
import {
  CustomerInformation,
  PaymentInformation,
  SlotDetail,
} from "@/app/_features/booking/types/booking-types";
// import { StripePayment } from "@/app/_components/stripe/StripePayment";
import { Elements } from "@stripe/react-stripe-js";

import { Tour } from "@/app/_features/tours/tour-types";
import { Product } from "@/app/_features/products/types/product-types";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { StripePaymentFormV2 } from "./StripePaymentFormv2";
import { getAssignedToursByTourId } from "@/app/_features/products/api/getAssignedToursByTourId";
import { toast } from "sonner";
import { formatTime } from "@/app/_lib/utils/formatTime";
import SlotDetails, { CustomSlotType, CustomSlotField } from "./SlotDetails";
import PersonalInformation from "./PersonalInformation";
import AdditionalProducts from "./AdditionalProducts";
import PromoCodeInput from "./PromoCodeInput";
import { Card, CardContent } from "@/components/ui/card";

const CheckForm = ({
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
  calculateTotal,
  appliedPromo,
  onPromoApplied,
  onPromoRemoved,
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
  calculateTotal: () => number;
  appliedPromo?: any;
  onPromoApplied?: (promoData: any) => void;
  onPromoRemoved?: () => void;
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

  // Update number of people when slot details change
  useEffect(() => {
    if (customSlotTypes && customSlotTypes.length > 0) {
      setNumberOfPeople(slotDetails.length);
    }
  }, [slotDetails, customSlotTypes]);

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

    // Update payment information with new total
    // setPaymentInformation({
    //   ...paymentInformation,
    //   total_price: totalPrice,
    // });
  };

  // Handle adding a new slot
  const handleAddSlot = () => {
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

  // Handle removing a slot
  const handleRemoveSlot = (index: number) => {
    if (numberOfPeople <= 1) return;

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

    // Validate slots first
    const slotValidation = validateSlots(slotDetails);
    if (!slotValidation.isValid) {
      errors.slots = slotValidation.errors;
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
  }, [selectedProducts, selectedTour.rate, slotDetails]);

  const tourImages = JSON.parse(selectedTour.images) as {
    url: string;
    isFeature: boolean;
  }[];
  const featuredImage = tourImages.find((image) => image.isFeature);

  const formattedDate = format(
    new Date(selectedDate.year, selectedDate.month - 1, selectedDate.day),
    "MMMM dd, yyyy"
  );

  const calculateSubtotal = () => {
    let subtotal = 0;

    // Calculate tour price based on slot types if they exist
    if (customSlotTypes && customSlotTypes.length > 0) {
      // Sum up prices from slot details
      subtotal = slotDetails.reduce((sum, slot) => {
        const slotType = customSlotTypes.find(
          (type: CustomSlotType) => type.name === slot.type
        );
        return sum + (slotType?.price || 0);
      }, 0);
    } else {
      // Use regular tour rate if no custom slot types
      subtotal = selectedTour.rate * numberOfPeople;
    }

    // Add product prices
    selectedProducts.forEach((productId) => {
      const product = availableProducts.find((p) => p.id === productId);
      if (product) {
        const quantity = productQuantities[productId] || 1;
        subtotal += product.price * quantity;
      }
    });

    // Round to 2 decimal places to avoid floating point issues
    return Math.round(subtotal * 100) / 100;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-12 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
      {/* Main Content - Left Column */}
      <div className="lg:col-span-2 space-y-6 sm:space-y-8">
        {/* User Information Section */}
        <PersonalInformation
          customerInformation={customerInformation}
          setCustomerInformation={setCustomerInformation}
          validationErrors={validationErrors}
        />

        {/* Slot Booking Section */}
        {(customSlotTypes || customSlotFields.length > 0) && (
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
        )}

        {/* Additional Products Section */}
        <AdditionalProducts
          isLoadingProducts={isLoadingProducts}
          availableProducts={availableProducts}
          selectedProducts={selectedProducts}
          setSelectedProducts={setSelectedProducts}
          productQuantities={productQuantities}
          setProductQuantities={setProductQuantities}
        />
      </div>

      {/* Order Summary - Right Column */}
      <div className="lg:col-span-1">
        <div className="space-y-6 sm:space-y-8">
          <div className="rounded-2xl sm:rounded-3xl border bg-card shadow-lg p-4 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-strong mb-4 sm:mb-8">
              Order Summary
            </h2>
            <div className="space-y-4 sm:space-y-6">
              {/* Selected Tour Summary */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="relative h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 overflow-hidden rounded-lg sm:rounded-xl">
                    <img
                      src={featuredImage?.url}
                      alt={selectedTour.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-strong truncate">
                      {selectedTour.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {selectedTour.duration} hours
                    </p>
                  </div>
                </div>

                {/* Date and Time Section */}
                <div className="bg-background rounded-lg sm:rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <svg
                      className="h-4 w-4 sm:h-5 sm:w-5 text-primary"
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
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                        Date
                      </p>
                      <p className="text-sm sm:text-base font-semibold text-strong">
                        {formattedDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <svg
                      className="h-4 w-4 sm:h-5 sm:w-5 text-primary"
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
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                        Time
                      </p>
                      <p className="text-sm sm:text-base font-semibold text-strong">
                        {formatTime(selectedTime)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
                  <span>Group Size</span>
                  {customSlotTypes && customSlotTypes.length > 0 ? (
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 bg-background rounded-lg px-3 py-1.5 border">
                        <button
                          onClick={() =>
                            handleRemoveSlot(slotDetails.length - 1)
                          }
                          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-brand/10 transition-colors disabled:bg-gray-200 disabled:hover:bg-gray-200 text-lg font-medium"
                          disabled={numberOfPeople <= 1}
                          aria-label="Decrease slots"
                        >
                          -
                        </button>
                        <span className="font-medium w-8 text-center text-base">
                          {numberOfPeople}
                        </span>
                        <button
                          onClick={handleAddSlot}
                          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-brand/10 transition-colors disabled:bg-gray-200 disabled:hover:bg-gray-200 text-lg font-medium"
                          disabled={
                            selectedTour.group_size_limit
                              ? numberOfPeople >= selectedTour.group_size_limit
                              : false
                          }
                          aria-label="Increase slots"
                        >
                          +
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-brand"></div>
                        <span className="text-sm text-weak">
                          {slotDetails.length}{" "}
                          {slotDetails.length === 1 ? "Slot" : "Slots"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3 bg-background rounded-lg px-3 py-1.5 border">
                      <button
                        onClick={() => {
                          if (numberOfPeople > 1) {
                            setNumberOfPeople(numberOfPeople - 1);
                          }
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-brand/10 transition-colors disabled:bg-gray-200 disabled:hover:bg-gray-200 text-lg font-medium"
                        disabled={numberOfPeople <= 1}
                        aria-label="Decrease group size"
                      >
                        -
                      </button>
                      <span className="font-medium w-8 text-center text-base">
                        {numberOfPeople}
                      </span>
                      <button
                        onClick={() => {
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
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-brand/10 transition-colors disabled:bg-gray-200 disabled:hover:bg-gray-200 text-lg font-medium"
                        disabled={
                          selectedTour.group_size_limit
                            ? numberOfPeople >= selectedTour.group_size_limit
                            : false
                        }
                        aria-label="Increase group size"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-stroke-weak pt-4 sm:pt-6 space-y-3 sm:space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-sm sm:text-base font-medium text-strong">
                        Tour Price
                      </span>
                      {customSlotTypes && customSlotTypes.length > 0 ? (
                        <div className="space-y-2 mt-2">
                          {(() => {
                            // Group slots by type and count occurrences
                            const groupedSlots = slotDetails.reduce(
                              (acc, slot) => {
                                const slotType = customSlotTypes.find(
                                  (type) => type.name === slot.type
                                );
                                const typeName = slotType?.name || "";
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
                              {} as Record<
                                string,
                                { count: number; price: number }
                              >
                            );

                            return Object.entries(groupedSlots).map(
                              ([typeName, { count, price }], index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between bg-fill/50 rounded-lg px-3 py-2"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-brand"></div>
                                    <span className="text-sm text-weak">
                                      {typeName} × {count}
                                    </span>
                                  </div>
                                  <span className="text-sm font-medium text-strong ml-2">
                                    ${price * count}
                                  </span>
                                </div>
                              )
                            );
                          })()}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between bg-fill/50 rounded-lg px-3 py-2 mt-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-brand"></div>
                            <span className="text-sm text-weak">
                              ${selectedTour.rate} × {numberOfPeople} people
                            </span>
                          </div>
                          <span className="text-sm font-medium text-strong ml-2">
                            $
                            {parseFloat(
                              (selectedTour.rate * numberOfPeople).toString()
                            ).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedProducts.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-sm sm:text-base font-medium text-strong">
                        Additional Products
                      </span>
                      <div className="space-y-2">
                        {selectedProducts.map((productId) => {
                          const product = availableProducts.find(
                            (p) => p.id === productId
                          );
                          const quantity = productQuantities[productId] || 1;
                          return product ? (
                            <div
                              key={product.id}
                              className="flex items-center justify-between bg-fill/50 rounded-lg px-3 py-2"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-stroke-strong"></div>
                                <div>
                                  <span className="text-sm text-weak">
                                    {product.name}
                                  </span>
                                  <p className="text-xs text-weak/70">
                                    {quantity} × $
                                    {parseFloat(
                                      product.price.toString()
                                    ).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                              <span className="text-sm font-medium text-strong ml-2">
                                $
                                {parseFloat(
                                  (product.price * quantity).toString()
                                ).toFixed(2)}
                              </span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Promo Code Section */}
                <div className="border-t border-stroke-weak pt-4">
                  <PromoCodeInput
                    totalAmount={calculateSubtotal()}
                    onPromoApplied={onPromoApplied || (() => {})}
                    onPromoRemoved={onPromoRemoved || (() => {})}
                    appliedPromo={appliedPromo}
                  />
                </div>

                <div className="border-t border-stroke-weak pt-4">
                  <span className="text-base sm:text-lg font-semibold text-strong">
                    Total Amount
                  </span>
                  <div className="text-right flex flex-col gap-2 mt-2">
                    {appliedPromo && (
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-muted-foreground">
                            Subtotal Amount
                          </span>
                          <span className="text-strong">
                            ${calculateSubtotal().toFixed(2)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm text-green-600">
                          <span>Discount Amount</span>
                          <span>
                            -${appliedPromo.discount_amount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                    <span className="text-xl sm:text-2xl font-bold text-brand">
                      ${calculateTotal().toFixed(2)}
                    </span>
                    <p className="text-xs text-weak">
                      Including all taxes and fees
                    </p>
                  </div>

                  {/* Continue to Payment Button */}
                  <div className="mt-6">
                    {isAdmin ? (
                      <div className="space-y-4">
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <h3 className="font-medium text-strong mb-2">
                            Payment Link
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            A payment link will be sent to the customer's email.
                            Booking will be pending until payment is completed.
                          </p>
                        </div>
                        <button
                          onClick={() => validateAndCompleteBooking()}
                          className="w-full bg-brand text-white hover:bg-brand/90 px-4 py-2 rounded-lg font-medium flex items-center justify-center disabled:bg-gray-400 disabled:hover:bg-gray-400"
                          disabled={isLoading}
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
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="w-full rounded-lg sm:rounded-xl lg:rounded-2xl bg-brand px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 text-sm sm:text-base lg:text-lg font-semibold text-white hover:bg-brand/90 focus:ring-4 focus:ring-brand focus:ring-offset-4 focus:outline-none disabled:bg-gray-400 disabled:hover:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300"
                        disabled={!selectedTime || !numberOfPeople}
                        onClick={() => validateAndCompleteBooking(null)}
                      >
                        Continue to Payment
                      </button>
                    )}

                    {/* Error Summary Section */}
                    {(validationErrors.personalInfo.length > 0 ||
                      validationErrors.slots.length > 0 ||
                      validationErrors.payment.length > 0) && (
                      <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <svg
                            className="h-5 w-5 text-red-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <h3 className="text-sm font-semibold text-red-800">
                            Please fix the following errors
                          </h3>
                        </div>
                        <div className="space-y-3">
                          {validationErrors.personalInfo.length > 0 && (
                            <div>
                              <h4 className="text-xs font-medium text-red-700 mb-1.5">
                                Personal Information
                              </h4>
                              <ul className="space-y-1">
                                {validationErrors.personalInfo.map(
                                  (error, index) => (
                                    <li
                                      key={index}
                                      className="text-xs text-red-600 flex items-start gap-1.5"
                                    >
                                      <span className="mt-1">•</span>
                                      <span>{error}</span>
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                          {validationErrors.slots.length > 0 && (
                            <div>
                              <h4 className="text-xs font-medium text-red-700 mb-1.5">
                                Slot Details
                              </h4>
                              <ul className="space-y-1">
                                {validationErrors.slots.map((error, index) => (
                                  <li
                                    key={index}
                                    className="text-xs text-red-600 flex items-start gap-1.5"
                                  >
                                    <span className="mt-1">•</span>
                                    <span>{error}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {validationErrors.payment.length > 0 && (
                            <div>
                              <h4 className="text-xs font-medium text-red-700 mb-1.5">
                                Payment Information
                              </h4>
                              <ul className="space-y-1">
                                {validationErrors.payment.map(
                                  (error, index) => (
                                    <li
                                      key={index}
                                      className="text-xs text-red-600 flex items-start gap-1.5"
                                    >
                                      <span className="mt-1">•</span>
                                      <span>{error}</span>
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckForm;
