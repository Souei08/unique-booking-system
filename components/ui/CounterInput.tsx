import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CounterInputProps<T = number> {
  value: T;
  onChange: (value: T) => void;
  min: number;
  max?: number | null;
  step?: number;
  icon?: React.ComponentType<{ className?: string }>;
  unitLabel?: string;
  className?: string;
  ariaLabel?: string;
  showLimits?: boolean;
  inputName: string;
  inputId: string;
  ariaInvalid?: boolean | string;
}

const CounterInput = <T = number,>({
  value,
  onChange,
  min,
  max,
  step,
  icon = Users,
  unitLabel = "slots",
  className = "",
  ariaLabel,
  inputName,
  inputId,
  showLimits = false,
  ariaInvalid,
}: CounterInputProps<T>) => {
  const isNumber = typeof value === "number" && !isNaN(value as number);
  const stepValue = step ?? 1;
  const hasMax = typeof max === "number" && isFinite(max);

  // Internal state for the input value as string
  const [inputValue, setInputValue] = useState<string>(
    isNumber ? String(value) : ""
  );

  // Set default value when component mounts and value is null/undefined
  useEffect(() => {
    if (!isNumber) {
      onChange(min as T);
    }
  }, []); // Only run on mount

  // Sync inputValue with value prop
  useEffect(() => {
    if (isNumber) {
      setInputValue(String(value));
    } else {
      setInputValue("");
    }
  }, [value, isNumber]);

  // Handler for direct input typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // On blur, validate and clamp
  const handleInputBlur = () => {
    if (inputValue === "") {
      setInputValue("");
      onChange(min as T);
      return;
    }
    const num = Number(inputValue);
    if (!isNaN(num)) {
      let clamped = Math.max(min, num);
      if (hasMax) clamped = Math.min(clamped, max as number);
      setInputValue(String(clamped));
      onChange(clamped as T);
    } else {
      setInputValue("");
      onChange(min as T);
    }
  };

  // Increment/Decrement handlers
  const handleDecrement = () => {
    const currentValue = isNumber ? (value as number) : min;
    const newValue = Math.max(currentValue - stepValue, min);
    onChange(newValue as T);
  };

  const handleIncrement = () => {
    const currentValue = isNumber ? (value as number) : min;
    let newValue = currentValue + stepValue;
    if (hasMax) newValue = Math.min(newValue, max as number);
    onChange(newValue as T);
  };

  return (
    <div className={cn("flex flex-col", className)} aria-label={ariaLabel}>
      {/* Main container with clean, professional design */}
      <div className="flex items-center gap-4">
        {/* Decrement button */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleDecrement}
          disabled={isNumber && (value as number) <= min}
          className="h-10 w-10 p-0 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="decrement"
        >
          <Minus className="h-5 w-5 text-gray-600" />
        </Button>

        {/* Main display container */}
        <div className="flex items-center bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 h-14 min-w-[200px]">
          {/* Icon section */}
          <div className="flex items-center justify-center bg-blue-50 border-r border-blue-200 rounded-l-lg w-14 h-14">
            {icon &&
              React.createElement(icon, {
                className: "h-5 w-5 text-blue-600",
              })}
          </div>

          {/* Input section */}
          <div className="flex flex-col items-center justify-center min-w-[200px]  px-3">
            <div className="relative text-center">
              <input
                type="number"
                min={min}
                {...(hasMax ? { max } : {})}
                step={stepValue}
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                className="font-semibold text-center bg-transparent border-0 focus:outline-none w-auto cursor-pointer [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none hover:bg-gray-50 focus:bg-gray-50 rounded transition-colors duration-200 text-xl text-gray-900"
                aria-label={unitLabel}
                name={inputName}
                id={inputId}
                aria-invalid={
                  typeof ariaInvalid === "boolean"
                    ? ariaInvalid
                    : ariaInvalid === "true"
                      ? true
                      : ariaInvalid === "false"
                        ? false
                        : undefined
                }
              />
            </div>
            <div className="font-medium mt-1 tracking-wide text-xs text-gray-500">
              {unitLabel}
            </div>
          </div>
        </div>

        {/* Increment button */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleIncrement}
          disabled={isNumber && hasMax && (value as number) >= (max as number)}
          className="h-10 w-10 p-0 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="increment"
        >
          <Plus className="h-5 w-5 text-gray-600" />
        </Button>
      </div>

      {/* Optional limits display */}
      {isNumber && showLimits && (
        <div className="w-full flex justify-center text-xs text-gray-500 mt-3 gap-2">
          <span className="px-2 py-1 bg-gray-100 rounded-md text-gray-600">
            Min: {min}
          </span>
          <span className="px-2 py-1 bg-gray-100 rounded-md text-gray-600">
            {hasMax ? `Max: ${max}` : "Unlimited"}
          </span>
        </div>
      )}
    </div>
  );
};

export default CounterInput;
