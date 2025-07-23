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
  selectedDate: DateValue | null;
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
    new Date(
      selectedDate?.year || new Date().getFullYear(),
      (selectedDate?.month || new Date().getMonth()) - 1,
      selectedDate?.day || new Date().getDate()
    ),
    "MMMM dd, yyyy"
  );

  // Calculate subtotal
  const calculateSubtotal = () => {
    let tourPrice = 0;

    if (customSlotTypes && customSlotTypes.length > 0) {
      // Calculate from slot details
      tourPrice = slotDetails.reduce((sum, slot) => sum + slot.price, 0);
    } else {
      // Calculate from tour rate
      tourPrice = selectedTour.rate * numberOfPeople;
    }

    // Add product prices
    const productPrice = selectedProducts.reduce((sum, productId) => {
      const product = availableProducts.find((p) => p.id === productId);
      const quantity = productQuantities[productId] || 1;
      return sum + (product?.price || 0) * quantity;
    }, 0);

    return tourPrice + productPrice;
  };

  const subtotal = calculateSubtotal();
  const discountAmount = securePromoData?.discountAmount || 0;
  const finalTotal = securePromoData?.total || totalAmount;

  return (
    <div className="rounded-xl border bg-white shadow-sm p-4 sm:p-6">
      <h2 className="text-lg font-bold text-strong mb-4">Order Summary</h2>
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

          {/* {showGroupSizeControls && (
            <div className="flex items-center justify-between text-xs text-[#666666]">
              <span>Selected Slots</span>
              {customSlotTypes && customSlotTypes.length > 0 ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 bg-white rounded-lg px-3 py-1.5 border border-gray-300">
                    <button
                      onClick={() => onGroupSizeChange?.(numberOfPeople - 1)}
                      className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#0066cc]/10 transition-colors disabled:opacity-50 disabled:hover:bg-transparent text-sm font-medium"
                      disabled={numberOfPeople <= 1}
                      aria-label="Decrease slots"
                    >
                      -
                    </button>
                    <span className="font-medium w-6 text-center text-sm">
                      {numberOfPeople}
                    </span>
                    <button
                      onClick={() => onGroupSizeChange?.(numberOfPeople + 1)}
                      className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#0066cc]/10 transition-colors disabled:opacity-50 disabled:hover:bg-transparent text-sm font-medium"
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
                    <div className="w-2 h-2 rounded-full bg-[#0066cc]"></div>
                    <span className="text-xs text-[#666666]">
                      {slotDetails.length}{" "}
                      {slotDetails.length === 1 ? "Slot" : "Slots"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3 bg-white rounded-lg px-3 py-1.5 border border-gray-300">
                  <button
                    onClick={() => onGroupSizeChange?.(numberOfPeople - 1)}
                    className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#0066cc]/10 transition-colors disabled:opacity-50 disabled:hover:bg-transparent text-sm font-medium"
                    disabled={numberOfPeople <= 1}
                    aria-label="Decrease group size"
                  >
                    -
                  </button>
                  <span className="font-medium w-6 text-center text-sm">
                    {numberOfPeople}
                  </span>
                  <button
                    onClick={() => onGroupSizeChange?.(numberOfPeople + 1)}
                    className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#0066cc]/10 transition-colors disabled:opacity-50 disabled:hover:bg-transparent text-sm font-medium"
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
          )} */}
        </div>

        {/* Payment Breakdown */}
        <div className="border-t border-gray-200 pt-6">
          {/* Tour Price Section */}
          <div className="bg-gray-50 rounded-lg mb-4">
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
                ${subtotal.toFixed(2)}
              </span>
            </div>

            {/* Promo Code Discount */}
            {appliedPromo && securePromoData && discountAmount > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#666666]">Discount</span>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
                    {appliedPromo.code}
                  </span>
                </div>
                <span className="text-sm font-semibold text-emerald-600">
                  -${discountAmount.toFixed(2)}
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
                  ${finalTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
