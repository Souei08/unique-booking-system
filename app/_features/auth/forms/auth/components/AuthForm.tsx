"use client";

import { useForm, FieldValues, Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodType } from "zod";
import { AuthFormField } from "../types";

interface AuthFormProps<T extends FieldValues> {
  schema: ZodType<T>;
  onSubmit: (data: T) => Promise<void>;
  fields: AuthFormField[];
  buttonText: string;
}

export default function AuthForm<T extends FieldValues>({
  schema,
  onSubmit,
  fields,
  buttonText,
}: AuthFormProps<T>) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<T>({ resolver: zodResolver(schema) });

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
      {fields.map(({ name, type, placeholder, label }) => (
        <div key={String(name)}>
          <label
            className={`block mb-1 text-sm/6 font-medium ${
              errors[name] ? "text-red-500" : "text-strong"
            }`}
          >
            {label}
          </label>
          <input
            type={type}
            {...register(name as Path<T>)}
            className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-strong outline-1 -outline-offset-1 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6 ${
              errors[name]
                ? "outline-red-500"
                : "outline-gray-300 focus:outline-indigo-600"
            }`}
            placeholder={placeholder}
          />
          {errors[name] && (
            <p className="text-red-500 text-sm">
              {(errors[name] as any)?.message}
            </p>
          )}
        </div>
      ))}

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
