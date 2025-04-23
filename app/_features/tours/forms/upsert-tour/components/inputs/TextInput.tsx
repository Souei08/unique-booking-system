import { UseFormRegister, FieldValues, Path } from "react-hook-form";

interface TextInputProps<T extends FieldValues> {
  name: Path<T>;
  type?: "text" | "number";
  placeholder?: string;
  label: string;
  error?: boolean;
  errorMessage?: string;
  register: UseFormRegister<T>;
}

export default function TextInput<T extends FieldValues>({
  name,
  type = "text",
  placeholder,
  label,
  error,
  errorMessage,
  register,
}: TextInputProps<T>) {
  return (
    <div>
      <label
        className={`block mb-1 text-sm/6 font-medium ${
          error ? "text-red-500" : "text-strong"
        }`}
      >
        {label}
      </label>
      <input
        {...register(name, {
          setValueAs: (value) =>
            type === "number"
              ? value === ""
                ? undefined
                : Number(value)
              : value,
        })}
        type={type}
        className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-strong outline-1 -outline-offset-1 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6 ${
          error
            ? "outline-red-500"
            : "outline-gray-300 focus:outline-indigo-600"
        }`}
        placeholder={placeholder}
        step={type === "number" ? "any" : undefined}
        min={type === "number" ? "0" : undefined}
      />
      {error && errorMessage && (
        <p className="mt-1 text-sm text-red-500">{errorMessage}</p>
      )}
    </div>
  );
}
