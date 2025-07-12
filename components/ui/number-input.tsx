"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { forwardRef, useCallback, useEffect, useState } from "react";
import { NumericFormat, NumericFormatProps } from "react-number-format";
import { Button } from "./button";
import { Input } from "./input";

export interface NumberInputProps
  extends Omit<NumericFormatProps, "value" | "onValueChange"> {
  stepper?: number;
  thousandSeparator?: string;
  placeholder?: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  value?: number; // Controlled value
  suffix?: string;
  prefix?: string;
  onValueChange?: (value: number | undefined) => void;
  fixedDecimalScale?: boolean;
  decimalScale?: number;
  startIcon?: React.ReactNode;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      stepper,
      thousandSeparator,
      placeholder,
      defaultValue,
      min = -Infinity,
      max = Infinity,
      onValueChange,
      fixedDecimalScale = false,
      decimalScale = 0,
      suffix,
      prefix,
      value: controlledValue,
      startIcon,
      ...props
    },
    ref
  ) => {
    const [value, setValue] = useState<number | undefined>(
      controlledValue ?? defaultValue
    );

    const handleIncrement = useCallback(() => {
      setValue((prev) =>
        prev === undefined
          ? (stepper ?? 1)
          : Math.min(prev + (stepper ?? 1), max)
      );
    }, [stepper, max]);

    const handleDecrement = useCallback(() => {
      setValue((prev) =>
        prev === undefined
          ? -(stepper ?? 1)
          : Math.max(prev - (stepper ?? 1), min)
      );
    }, [stepper, min]);

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        const currentRef = ref as React.RefObject<HTMLInputElement>;
        if (
          currentRef?.current &&
          document.activeElement === currentRef.current
        ) {
          if (e.key === "ArrowUp") {
            handleIncrement();
          } else if (e.key === "ArrowDown") {
            handleDecrement();
          }
        }
      };

      window.addEventListener("keydown", handleKeyDown);

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }, [handleIncrement, handleDecrement, ref]);

    useEffect(() => {
      if (controlledValue !== undefined) {
        setValue(controlledValue);
      }
    }, [controlledValue]);

    const handleChange = (values: {
      value: string;
      floatValue: number | undefined;
    }) => {
      const newValue =
        values.floatValue === undefined ? undefined : values.floatValue;
      setValue(newValue);
      if (onValueChange) {
        onValueChange(newValue);
      }
    };

    const handleBlur = () => {
      if (value !== undefined) {
        const currentRef = ref as React.RefObject<HTMLInputElement>;
        if (value < min) {
          setValue(min);
          if (currentRef?.current) {
            currentRef.current.value = String(min);
          }
        } else if (value > max) {
          setValue(max);
          if (currentRef?.current) {
            currentRef.current.value = String(max);
          }
        }
      }
    };

    return (
      <div className="flex items-center">
        <div className="relative flex-1">
          {startIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none flex items-center">
              {startIcon}
            </span>
          )}
          <NumericFormat
            value={value}
            onValueChange={handleChange}
            thousandSeparator={thousandSeparator}
            decimalScale={decimalScale}
            fixedDecimalScale={fixedDecimalScale}
            allowNegative={min < 0}
            valueIsNumericString
            onBlur={handleBlur}
            max={max}
            min={min}
            suffix={suffix}
            prefix={prefix}
            customInput={Input}
            placeholder={placeholder}
            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none rounded-r-none relative pl-9 w-full"
            getInputRef={ref}
            {...props}
            style={{
              borderTopRightRadius: "0px",
              borderBottomRightRadius: "0px",
              ...(props.style || {}),
            }}
          />
        </div>
        <div className="flex flex-col">
          <Button
            aria-label="Increase value"
            className="h-6 rounded-l-none rounded-br-none border-input border-l-0 border-b-[0.5px] focus-visible:relative px-1.5"
            variant="outline"
            onClick={handleIncrement}
            disabled={value === max}
            type="button"
            tabIndex={-1}
          >
            <ChevronUp size={15} />
          </Button>
          <Button
            aria-label="Decrease value"
            className="h-6 rounded-l-none rounded-tr-none border-input border-l-0 border-t-[0.5px] focus-visible:relative px-1.5"
            variant="outline"
            onClick={handleDecrement}
            disabled={value === min}
            type="button"
            tabIndex={-1}
          >
            <ChevronDown size={15} />
          </Button>
        </div>
      </div>
    );
  }
);
