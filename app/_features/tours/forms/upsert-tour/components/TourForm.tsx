"use client";

import { useForm, FieldValues, Path, DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodType } from "zod";
import { toast } from "react-hot-toast";
import { useModal } from "@/app/context/ModalContext/useModal";
import {
  TextInput,
  TextAreaInput,
  SelectInput,
  ArrayInput,
  FaqInput,
} from "./inputs";

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

  const renderInput = (field: TourFormProps<T>["fields"][0]) => {
    const { name, type, placeholder, label } = field;
    const error = !!errors[name];
    const errorMessage = errors[name]?.message as string;

    switch (type) {
      case "textarea":
        return (
          <TextAreaInput
            name={name}
            placeholder={placeholder}
            label={label}
            error={error}
            errorMessage={errorMessage}
            register={register}
          />
        );
      case "select":
        return (
          <SelectInput
            name={name}
            placeholder={placeholder}
            label={label}
            options={field.options || []}
            error={error}
            errorMessage={errorMessage}
            register={register}
          />
        );
      case "array":
        return (
          <ArrayInput
            name={name}
            placeholder={placeholder}
            label={label}
            error={error}
            errorMessage={errorMessage}
            register={register}
            setValue={setValue}
            watch={watch}
          />
        );
      case "faq":
        return (
          <FaqInput
            name={name}
            label={label}
            placeholder={placeholder}
            error={error}
            value={(watch(name) as string[]) || []}
            onChange={(value) => setValue(name, value as any)}
          />
        );
      default:
        return (
          <TextInput
            name={name}
            type={type as "text" | "number"}
            placeholder={placeholder}
            label={label}
            error={error}
            errorMessage={errorMessage}
            register={register}
          />
        );
    }
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
        {fields.map((field) => {
          const { colSpan = "full" } = field;
          const isEqual = colSpan === "equal";
          const isFull = colSpan === "full";
          const isTwoThirds = colSpan === "two-thirds";

          return (
            <div
              key={String(field.name)}
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
              {renderInput(field)}
            </div>
          );
        })}
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
