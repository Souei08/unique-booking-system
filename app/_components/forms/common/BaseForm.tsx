"use client";

import { useForm, FieldValues, Path, DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodType } from "zod";

interface BaseFormProps<T extends FieldValues> {
  schema: ZodType<T>;
  onSubmit: (data: T) => Promise<void>;
  fields: {
    name: Path<T>;
    type: string;
    placeholder: string;
    label: string;
    colSpan?: "full" | "half";
    options?: { value: string; label: string }[];
    onChange?: (value: string) => void;
    disabled?: boolean;
  }[];
  buttonText: string;
  initialData?: DefaultValues<T>;
}

export default function BaseForm<T extends FieldValues>({
  schema,
  onSubmit,
  fields,
  buttonText,
  initialData,
}: BaseFormProps<T>) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: initialData,
  });

  const handleFormSubmit = async (data: T) => {
    try {
      await onSubmit(data);
    } catch (error: any) {
      // If the error has a fieldErrors property, set field-level errors
      if (error.fieldErrors) {
        Object.entries(error.fieldErrors).forEach(([field, message]) => {
          setError(field as Path<T>, {
            type: "server",
            message: message as string,
          });
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map(({ name, type, placeholder, label, colSpan }) => (
          <div
            key={String(name)}
            className={colSpan === "full" ? "md:col-span-2" : ""}
          >
            <label
              className={`block mb-1 text-sm font-medium ${
                errors[name] ? "text-red-500" : "text-strong"
              }`}
            >
              {label}
            </label>
            {type === "textarea" ? (
              <textarea
                {...register(name)}
                className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-strong outline-1 -outline-offset-1 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6 ${
                  errors[name]
                    ? "outline-red-500"
                    : "outline-gray-300 focus:outline-indigo-600"
                }`}
                placeholder={placeholder}
                rows={4}
              />
            ) : type === "select" ? (
              <select
                {...register(name)}
                className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-strong outline-1 -outline-offset-1 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6 ${
                  errors[name]
                    ? "outline-red-500"
                    : "outline-gray-300 focus:outline-indigo-600"
                }`}
                disabled={fields.find((f) => f.name === name)?.disabled}
                onChange={(e) => {
                  register(name).onChange(e);
                  fields
                    .find((f) => f.name === name)
                    ?.onChange?.(e.target.value);
                }}
              >
                <option value="">{placeholder}</option>
                {fields
                  .find((f) => f.name === name)
                  ?.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
              </select>
            ) : type === "array" ? (
              <textarea
                {...register(name)}
                className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-strong outline-1 -outline-offset-1 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6 ${
                  errors[name]
                    ? "outline-red-500"
                    : "outline-gray-300 focus:outline-indigo-600"
                }`}
                placeholder={placeholder}
                rows={4}
              />
            ) : (
              <input
                type={type}
                {...register(
                  name,
                  type === "number" ? { valueAsNumber: true } : {}
                )}
                className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-strong outline-1 -outline-offset-1 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6 ${
                  errors[name]
                    ? "outline-red-500"
                    : "outline-gray-300 focus:outline-indigo-600"
                }`}
                placeholder={placeholder}
              />
            )}
            {errors[name] && (
              <p className="text-red-500 text-sm">
                {(errors[name] as any)?.message}
              </p>
            )}
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? "Processing..." : buttonText}
      </button>
    </form>
  );
}
