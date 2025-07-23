import React from "react";
import { cn } from "@/lib/utils";

export interface StepperStep {
  id: number;
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface StepperV2Props {
  steps: StepperStep[];
  currentStep: number;
  completedSteps?: Set<number>;
  onStepClick?: (stepId: number) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "with-summary";
}

const StepperV2: React.FC<StepperV2Props> = ({
  steps,
  currentStep,
  onStepClick,
  className,
  size = "md",
}) => {
  const sizeClasses = {
    sm: {
      step: "w-7 h-7 text-xs px-0.5",
      icon: "w-3 h-3",
      text: "text-xs",
    },
    md: {
      step: "w-8 h-8 text-sm px-1.5",
      icon: "w-4 h-4",
      text: "text-sm",
    },
    lg: {
      step: "w-10 h-10 text-base px-2",
      icon: "w-5 h-5",
      text: "text-base",
    },
  };
  const currentSize = sizeClasses[size];
  const stepCount = steps.length;

  // Calculate the left position for each step as a percentage
  const getStepPosition = (index: number) => {
    if (stepCount === 1) return "50%";
    return `${(index / (stepCount - 1)) * 100}%`;
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="relative  rounded-lg py-8 px-4" style={{ minHeight: 70 }}>
        {/* Single continuous connector line */}
        <div
          className="absolute left-0 right-0 top-5 h-px bg-gray-300 z-0"
          style={{ transform: "translateY(-50%)" }}
        />
        {/* Step indicators */}
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isClickable = step.id < currentStep && !!onStepClick;
          const StepIcon = step.icon;
          const left = getStepPosition(index);

          return (
            <div
              key={step.id}
              className="absolute flex flex-col items-center z-10"
              style={{ left, top: "50%", transform: "translate(-50%, -50%)" }}
            >
              {/* Step indicator as rounded rectangle */}
              <div
                className={cn(
                  "flex items-center justify-center border transition-all duration-200 shadow-md rounded-md font-semibold",
                  currentSize.step,
                  isActive
                    ? "bg-brand border-brand text-white "
                    : "bg-gray-100 border-gray-200 text-gray-700",
                  isClickable &&
                    "cursor-pointer hover:border-brand hover:text-brand hover:bg-brand/10"
                )}
                onClick={() => isClickable && onStepClick?.(step.id)}
                style={{ minWidth: 32 }}
              >
                {StepIcon ? (
                  <StepIcon className={currentSize.icon} />
                ) : (
                  <span>{step.id}</span>
                )}
              </div>
              {/* Step label */}
              <div className="mt-2 text-center max-w-28">
                <div
                  className={cn(
                    "font-medium transition-colors",
                    currentSize.text,
                    isActive ? "text-gray-900" : "text-gray-700",
                    isClickable && "cursor-pointer hover:text-blue-900"
                  )}
                  onClick={() => isClickable && onStepClick?.(step.id)}
                >
                  {step.title}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepperV2;
