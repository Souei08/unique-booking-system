import { UseFormRegister, FieldValues, Path } from "react-hook-form";

interface Option {
  value: string;
  label: string;
}

interface SelectInputProps<T extends FieldValues> {
  name: Path<T>;
  placeholder?: string;
  label: string;
  options: Option[];
  error?: boolean;
  errorMessage?: string;
  register: UseFormRegister<T>;
}

export default function SelectInput<T extends FieldValues>({
  name,
  placeholder,
  label,
  options,
  error,
  errorMessage,
  register,
}: SelectInputProps<T>) {
  return (
    <div>
      <label
        className={`block mb-1 text-sm/6 font-medium ${
          error ? "text-red-500" : "text-strong"
        }`}
      >
        {label}
      </label>
      <select
        {...register(name)}
        className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-strong outline-1 -outline-offset-1 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6 ${
          error
            ? "outline-red-500"
            : "outline-gray-300 focus:outline-indigo-600"
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && errorMessage && (
        <p className="mt-1 text-sm text-red-500">{errorMessage}</p>
      )}
    </div>
  );
}
