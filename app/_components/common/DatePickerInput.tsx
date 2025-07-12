import React, { useState } from "react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

interface DatePickerInputProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  minDate?: Date;
  maxDate?: Date;
}

const DatePickerInput: React.FC<DatePickerInputProps> = ({
  value,
  onChange,
  placeholder = "Select date",
  disabled = false,
  error,
  minDate,
  maxDate,
}) => {
  const [showCalendar, setShowCalendar] = useState(false);

  const handleSelect = (date: Date | undefined) => {
    onChange(date);
    setShowCalendar(false);
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        readOnly
        value={value ? format(value, "yyyy-MM-dd") : ""}
        placeholder={placeholder}
        disabled={disabled}
        onClick={() => !disabled && setShowCalendar((prev) => !prev)}
        className={`flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${
          error ? "border-red-500 text-red-500" : "border-gray-300"
        } ${disabled ? "bg-gray-100 cursor-not-allowed" : "cursor-pointer"}`}
      />

      {showCalendar && (
        <div
          className="absolute z-50 mt-2 rounded-md border border-gray-300 bg-white shadow-lg"
          style={{
            width: "100%",
            minWidth: "260px",
            maxWidth: "360px",
          }}
        >
          <DayPicker
            mode="single"
            selected={value}
            onSelect={handleSelect}
            disabled={(date: Date) => {
              if (minDate && date < minDate) return true;
              if (maxDate && date > maxDate) return true;
              return false;
            }}
            className="p-3"
            styles={{
              root: {
                width: "100%",
              },
              table: {
                width: "100%",
                minWidth: "260px",
                tableLayout: "fixed",
              },
              head_cell: {
                padding: "6px 0",
                fontWeight: 500,
                fontSize: "0.85rem",
                color: "#4B5563", // Tailwind gray-600
              },
              cell: {
                padding: "4px",
              },
              day: {
                width: "38px",
                height: "38px",
                lineHeight: "38px",
                fontSize: "0.85rem",
                borderRadius: "4px",
              },
            }}
          />
        </div>
      )}

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default DatePickerInput;
