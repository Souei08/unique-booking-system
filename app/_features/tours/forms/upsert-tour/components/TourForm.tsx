"use client";

import { useForm, FieldValues, Path, DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodType } from "zod";
import { toast } from "react-hot-toast";
import { useModal } from "@/app/context/ModalContext/useModal";
import FaqInput from "./FaqInput";

interface TourFormProps<T extends FieldValues> {
  schema: ZodType<T>;
  onSubmit: (data: T) => Promise<void>;
  fields: {
    name: Path<T>;
    type: string;
    placeholder: string;
    label: string;
    colSpan?: "full" | "half" | "one-third" | "two-thirds" | "equal";
    options?: { value: string; label: string }[];
  }[];
  buttonText: string;
  initialData?: Partial<T>;
  onSuccess?: () => void;
}

export default function TourForm<T extends FieldValues>({
  schema,
  onSubmit,
  fields,
  buttonText,
  initialData,
  onSuccess,
}: TourFormProps<T>) {
  const { closeModal } = useModal();

  // Check if schema is valid
  if (!schema) {
    console.error("Schema is missing or invalid");
    return <div>Error: Form schema is missing or invalid</div>;
  }

  // Check if onSubmit function is defined
  if (typeof onSubmit !== "function") {
    console.error("onSubmit function is missing or invalid");
    return <div>Error: Form submission handler is missing or invalid</div>;
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    setValue,
    watch,
  } = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: initialData as DefaultValues<T>,
  });

  const handleFormSubmit = async (data: T) => {
    try {
      // Process numeric fields before submission
      const processedData = { ...data };

      // Find all numeric fields and convert them
      fields.forEach((field) => {
        if (field.type === "number") {
          const fieldName = field.name as keyof T;
          const value = data[fieldName];
          if (value !== undefined && value !== null) {
            processedData[fieldName] = Number(value) as any;
          }
        }
      });

      await onSubmit(processedData);
      toast.success("Operation completed successfully!");
      onSuccess?.();
      closeModal();
    } catch (error: any) {
      if (error.fieldErrors) {
        Object.entries(error.fieldErrors).forEach(([field, message]) => {
          setError(field as Path<T>, {
            type: "server",
            message: message as string,
          });
        });
      }
      toast.error(error.message || "An error occurred. Please try again.");
    }
  };

  const handleArrayInput = (name: Path<T>, value: string) => {
    const currentValue = (watch(name) as string[]) || [];
    if (value.trim()) {
      setValue(name, [...currentValue, value.trim()] as any);
    }
  };

  const removeArrayItem = (name: Path<T>, index: number) => {
    const currentValue = watch(name) as string[];
    setValue(name, currentValue.filter((_, i) => i !== index) as any);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        console.log("Form submit event triggered");
        handleSubmit(handleFormSubmit)(e);
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        {fields.map(
          ({ name, type, placeholder, label, colSpan = "full", options }) => {
            const isEqual = colSpan === "equal";
            const isFull = colSpan === "full";
            const isTwoThirds = colSpan === "two-thirds";

            return (
              <div
                key={String(name)}
                className={
                  isFull
                    ? "col-span-2"
                    : isTwoThirds
                    ? "col-span-2 lg:col-span-1"
                    : isEqual
                    ? "col-span-1"
                    : "col-span-2 md:col-span-1"
                }
              >
                {type === "faq" ? (
                  <FaqInput
                    name={name}
                    label={label}
                    placeholder={placeholder}
                    error={!!errors[name]}
                    value={(watch(name) as string[]) || []}
                    onChange={(value) => setValue(name, value as any)}
                  />
                ) : (
                  <>
                    <label
                      className={`block mb-1 text-sm/6 font-medium ${
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
                      >
                        <option value="">{placeholder}</option>
                        {options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : type === "array" ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-strong outline-1 -outline-offset-1 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6 ${
                              errors[name]
                                ? "outline-red-500"
                                : "outline-gray-300 focus:outline-indigo-600"
                            }`}
                            placeholder={placeholder}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleArrayInput(name, e.currentTarget.value);
                                e.currentTarget.value = "";
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              const input = e.currentTarget
                                .previousElementSibling as HTMLInputElement;
                              handleArrayInput(name, input.value);
                              input.value = "";
                            }}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          >
                            Add
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(Array.isArray(watch(name)) ? watch(name) : []).map(
                            (item, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md"
                              >
                                <span className="text-sm">{item}</span>
                                <button
                                  type="button"
                                  onClick={() => removeArrayItem(name, index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  ×
                                </button>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    ) : (
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
                          errors[name]
                            ? "outline-red-500"
                            : "outline-gray-300 focus:outline-indigo-600"
                        }`}
                        placeholder={placeholder}
                        step={type === "number" ? "any" : undefined}
                        min={type === "number" ? "0" : undefined}
                      />
                    )}
                  </>
                )}
                {errors[name] && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors[name]?.message as string}
                  </p>
                )}
              </div>
            );
          }
        )}
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={closeModal}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : buttonText}
        </button>
      </div>
    </form>
  );
}
