import React from "react";
import {
  CreditCardIcon,
  UserIcon,
  CalendarIcon,
  ShoppingBagIcon,
  GiftIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";

interface StepIndicatorProps {
  currentStep: number;
  handleStepClick: (step: number) => void;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  handleStepClick,
}) => {
  const steps = [
    { step: 1, label: "Select Tour", icon: ShoppingBagIcon },
    { step: 2, label: "Choose Date", icon: CalendarIcon },
    { step: 3, label: "Customer Details", icon: UserIcon },
    { step: 4, label: "Additional Options", icon: GiftIcon },
    { step: 5, label: "Payment", icon: CreditCardIcon },
    { step: 6, label: "Overview", icon: ClipboardDocumentCheckIcon },
  ];

  return (
    <div className="mb-8 overflow-x-auto">
      <div className="flex items-center justify-between min-w-[600px]">
        {steps.map((item) => (
          <div
            key={item.step}
            className={`flex flex-col items-center ${
              item.step <= currentStep
                ? "cursor-pointer"
                : "cursor-not-allowed opacity-50"
            }`}
            onClick={() => handleStepClick(item.step)}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                currentStep >= item.step
                  ? "bg-brand text-white hover:bg-brand-dark"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              <item.icon className="w-5 h-5" />
            </div>
            <span
              className={`text-xs font-medium ${
                currentStep >= item.step ? "text-brand" : "text-gray-500"
              }`}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
      <div className="relative mt-2 min-w-[600px]">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-between">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`w-3 h-3 rounded-full ${
                currentStep > step ? "bg-brand" : "bg-gray-300"
              }`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};
