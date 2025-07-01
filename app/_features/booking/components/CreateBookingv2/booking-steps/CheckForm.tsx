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
import OrderSummary from "./OrderSummary";
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

  // Add state for secure promo calculations
  const [securePromoData, setSecurePromoData] = useState<{
    subtotal: number;
    discountAmount: number;
    total: number;
  } | null>(null);

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

  // Update number of people when slot details change
  // useEffect(() => {
  //   if (customSlotTypes && customSlotTypes.length > 0) {
  //     setNumberOfPeople(slotDetails.length);
  //   }
  // }, [slotDetails, customSlotTypes]);

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

  // Handle group size change from OrderSummary
  const handleGroupSizeChange = (newSize: number) => {
    if (newSize < 1) return;

    if (
      selectedTour.group_size_limit &&
      newSize > selectedTour.group_size_limit
    ) {
      toast.error("Group size limit reached", {
        description: `Maximum group size is ${selectedTour.group_size_limit} people.`,
      });
      return;
    }

    setNumberOfPeople(newSize);

    // Update slot details based on the new size
    if (customSlotTypes && customSlotTypes.length > 0) {
      const newSlotDetails = [];
      for (let i = 0; i < newSize; i++) {
        newSlotDetails.push({
          type: customSlotTypes[0]?.name || "",
          price: customSlotTypes[0]?.price || 0,
        });
      }
      setSlotDetails(newSlotDetails);
    }
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
  }, [
    selectedProducts,
    selectedTour.rate,
    slotDetails,
    numberOfPeople,
    appliedPromo,
  ]);

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
          <OrderSummary
            selectedTour={selectedTour}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            numberOfPeople={numberOfPeople}
            selectedProducts={selectedProducts}
            productQuantities={productQuantities}
            availableProducts={availableProducts}
            slotDetails={slotDetails}
            customSlotTypes={customSlotTypes}
            customSlotFields={customSlotFields}
            totalAmount={
              securePromoData ? securePromoData.total : calculateTotal()
            }
            showGroupSizeControls={true}
            onGroupSizeChange={handleGroupSizeChange}
            appliedPromo={appliedPromo}
            securePromoData={securePromoData}
          />

          {/* Promo Code Section */}
          <div className="rounded-2xl sm:rounded-3xl border bg-card shadow-lg p-4 sm:p-8">
            <PromoCodeInput
              calculateTotal={calculateTotal}
              totalAmount={calculateSubtotal()}
              onPromoApplied={onPromoApplied || (() => {})}
              onPromoRemoved={onPromoRemoved || (() => {})}
              appliedPromo={appliedPromo}
            />
          </div>

          {/* Continue to Payment Button */}
          <div className="rounded-2xl sm:rounded-3xl border bg-card shadow-lg p-4 sm:p-8">
            {isAdmin ? (
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-medium text-strong mb-2">Payment Link</h3>
                  <p className="text-sm text-muted-foreground">
                    A payment link will be sent to the customer's email. Booking
                    will be pending until payment is completed.
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
                        {validationErrors.personalInfo.map((error, index) => (
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
                        {validationErrors.payment.map((error, index) => (
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
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckForm;
