import React from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

interface Props {
  value: string;
  onChange: (value: string, country: any) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  className?: string;
  customInputStyle?: React.CSSProperties;
  customButtonStyle?: React.CSSProperties;
}

export const CustomPhoneInput: React.FC<Props> = ({
  value,
  onChange,
  onBlur,
  error,
  disabled,
  className,
  customInputStyle,
  customButtonStyle,
}) => (
  <div>
    <style jsx>{`
      .react-tel-input .selected-flag:focus {
        background-color: #f9fafb;
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        outline: none;
      }
    `}</style>
    <PhoneInput
      country={"us"}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      inputClass={`${className || ""} ${error ? "border-destructive text-destructive" : ""}`}
      inputStyle={{ width: "100%", ...customInputStyle }}
      buttonStyle={{ ...customButtonStyle }}
      enableSearch
      autoFormat
      disableDropdown={false}
    />
    {error && <div className="text-destructive text-xs mt-1">{error}</div>}
  </div>
);

export default CustomPhoneInput;
