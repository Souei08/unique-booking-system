"use client";

import { useForm, FieldValues, Path, DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodType } from "zod";
import { toast } from "react-hot-toast";
import { useModal } from "@/app/context/ModalContext/useModal";

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
      await onSubmit(data);
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
                    type={type}
                    {...register(name, {
                      setValueAs: (value) =>
                        type === "number"
                          ? value === ""
                            ? undefined
                            : Number(value)
                          : value,
                    })}
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
                {errors[name] && (
                  <p className="text-red-500 text-sm">
                    {(errors[name] as any)?.message}
                  </p>
                )}
              </div>
            );
          }
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? "Processing..." : buttonText}
      </button>

      {/* Debug button to show validation errors */}
      <button
        type="button"
        onClick={() => {
          console.log("Form validation errors:", errors);
          console.log("Form values:", watch());
        }}
        className="w-full p-2 mt-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
      >
        Debug Form
      </button>
    </form>
  );
}
