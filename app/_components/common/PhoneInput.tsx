import React from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

interface Props {
  value: string;
  onChange: (value: string, country: any) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
}

export const CustomPhoneInput: React.FC<Props> = ({
  value,
  onChange,
  onBlur,
  error,
  disabled,
}) => (
  <div>
    <PhoneInput
      country={"us"}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      inputClass={error ? "border-destructive text-destructive" : ""}
      inputStyle={{ width: "100%" }}
      enableSearch
      autoFormat
      disableDropdown={false}
    />
    {error && <div className="text-destructive text-xs mt-1">{error}</div>}
  </div>
);

export default CustomPhoneInput;
