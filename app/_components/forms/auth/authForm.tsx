"use client";

import { useForm, FieldValues, Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { showErrorToast, showSuccessToast } from "@/utils/toastUtils";
import { ZodType } from "zod";

interface AuthFormProps<T extends FieldValues> {
  schema: ZodType<T>;
  onSubmit: (data: T) => Promise<void>;
  fields: { name: Path<T>; type: string; placeholder: string; label: string }[];
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
  } = useForm<T>({ resolver: zodResolver(schema) });

  const handleFormSubmit = async (data: T) => {
    try {
      await onSubmit(data);
    } catch (error) {
      showErrorToast("An error occurred. Please try again."); // ❌ Show error toast
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {fields.map(({ name, type, placeholder, label }) => (
        <div key={String(name)}>
          <label className="block mb-1 text-sm/6 font-medium text-strong">
            {label}
          </label>
          <input
            type={type}
            {...register(name)}
            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-strong outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
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
