import React from "react";
import { Tour } from "@/app/_features/tours/tour-types";
import { Product } from "@/app/_features/products/types/product-types";
import { SlotDetail } from "@/app/_features/booking/types/booking-types";
import { CustomSlotType, CustomSlotField } from "./SlotDetails";
import { formatTime } from "@/app/_lib/utils/formatTime";
import { format } from "date-fns";
import { DateValue } from "@internationalized/date";

interface OrderSummaryProps {
  selectedTour: Tour;
  selectedDate: DateValue;
  selectedTime: string;
  numberOfPeople: number;
  selectedProducts: string[];
  productQuantities: Record<string, number>;
  availableProducts: Product[];
  slotDetails: SlotDetail[];
  customSlotTypes: CustomSlotType[] | null;
  customSlotFields: CustomSlotField[] | null;
  totalAmount: number;
  showGroupSizeControls?: boolean;
  onGroupSizeChange?: (newSize: number) => void;
  appliedPromo?: any;
  securePromoData?: {
    subtotal: number;
    discountAmount: number;
    total: number;
  } | null;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  selectedTour,
  selectedDate,
  selectedTime,
  numberOfPeople,
  selectedProducts,
  productQuantities,
  availableProducts,
  slotDetails,
  customSlotTypes,
  customSlotFields,
  totalAmount,
  showGroupSizeControls = false,
  onGroupSizeChange,
  appliedPromo,
  securePromoData,
}) => {
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

          {showGroupSizeControls && (
            <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
              <span>Group Size</span>
              {customSlotTypes && customSlotTypes.length > 0 ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 bg-background rounded-lg px-3 py-1.5 border">
                    <button
                      onClick={() => onGroupSizeChange?.(numberOfPeople - 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:hover:bg-transparent text-lg font-medium"
                      disabled={numberOfPeople <= 1}
                      aria-label="Decrease slots"
                    >
                      -
                    </button>
                    <span className="font-medium w-8 text-center text-base">
                      {numberOfPeople}
                    </span>
                    <button
                      onClick={() => onGroupSizeChange?.(numberOfPeople + 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:hover:bg-transparent text-lg font-medium"
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
                    onClick={() => onGroupSizeChange?.(numberOfPeople - 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:hover:bg-transparent text-lg font-medium"
                    disabled={numberOfPeople <= 1}
                    aria-label="Decrease group size"
                  >
                    -
                  </button>
                  <span className="font-medium w-8 text-center text-base">
                    {numberOfPeople}
                  </span>
                  <button
                    onClick={() => onGroupSizeChange?.(numberOfPeople + 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:hover:bg-transparent text-lg font-medium"
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
          )}
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
                            className="flex items-center justify-between w-full bg-fill/50 rounded-lg px-3 py-2"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-brand"></div>
                              <span className="text-sm text-weak">
                                {typeName} × {count}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-strong ml-2">
                              ${(price * count).toFixed(2)}
                            </span>
                          </div>
                        )
                      );
                    })()}
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full bg-fill/50 rounded-lg px-3 py-2 mt-2">
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

            {/* Additional Products */}
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
                          <div className="w-2 h-2 rounded-full bg-brand"></div>
                          <div>
                            <span className="text-sm text-weak">
                              {product.name}
                            </span>
                            <p className="text-xs text-weak/70">
                              {quantity} × ${product.price}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-strong ml-2">
                          ${(product.price * quantity).toFixed(2)}
                        </span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Promo Code Applied */}
          {appliedPromo && securePromoData && (
            <div className="border-t border-stroke-weak pt-4">
              <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-xl p-4 border border-emerald-200/60 shadow-sm">
                <div className="space-y-3">
                  {/* Promo Code Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-emerald-800">
                          Promo Code Applied
                        </span>
                        <p className="text-xs text-emerald-600 mt-0.5">
                          {appliedPromo.discount_type === "percentage"
                            ? `${appliedPromo.discount_value}% discount`
                            : `$${appliedPromo.discount_value} discount`}
                        </p>
                      </div>
                    </div>
                    <div className="bg-white border-2 border-emerald-300 rounded-lg px-3 py-1.5 shadow-sm">
                      <span className="text-sm font-bold text-emerald-700 tracking-wide">
                        {appliedPromo.code}
                      </span>
                    </div>
                  </div>

                  {/* Price Breakdown with Promo */}
                  <div className="bg-white/80 rounded-lg p-3 border border-emerald-200/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Subtotal</span>
                      <span className="text-sm font-medium text-gray-700">
                        ${securePromoData.subtotal.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-emerald-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-sm font-medium text-emerald-700">
                          Discount
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-emerald-600">
                        -${securePromoData.discountAmount.toFixed(2)}
                      </span>
                    </div>

                    <div className="border-t border-emerald-200/50 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-emerald-800">
                          Final Total
                        </span>
                        <span className="text-base font-bold text-emerald-700">
                          ${securePromoData.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Savings Highlight */}
                  <div className="bg-emerald-100 rounded-lg p-3 border border-emerald-300/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-emerald-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                          />
                        </svg>
                        <span className="text-sm font-semibold text-emerald-800">
                          You Save
                        </span>
                      </div>
                      <span className="text-lg font-bold text-emerald-700">
                        ${securePromoData.discountAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Total Amount */}
          <div className="border-t border-stroke-weak pt-4">
            <div className="flex justify-between items-center">
              <span className="text-base sm:text-lg font-semibold text-strong">
                Total Amount
              </span>
              <div className="text-right">
                <span className="text-xl sm:text-2xl font-bold text-brand">
                  ${totalAmount.toFixed(2)}
                </span>
                <p className="text-xs text-weak mt-1">
                  Including all taxes and fees
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
