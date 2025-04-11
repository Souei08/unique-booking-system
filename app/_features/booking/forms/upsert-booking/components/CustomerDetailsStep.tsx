import { StepProps } from "../types";

export default function CustomerDetailsStep({ register, errors }: StepProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block mb-1 text-sm font-medium text-strong">
          Full Name
        </label>
        <input
          type="text"
          {...register("customerName")}
          className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-strong outline-1 -outline-offset-1 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6 ${
            errors.customerName
              ? "outline-red-500"
              : "outline-gray-300 focus:outline-indigo-600"
          }`}
        />
        {errors.customerName && (
          <p className="text-red-500 text-sm">{errors.customerName.message}</p>
        )}
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium text-strong">
          Email
        </label>
        <input
          type="email"
          {...register("customerEmail")}
          className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-strong outline-1 -outline-offset-1 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6 ${
            errors.customerEmail
              ? "outline-red-500"
              : "outline-gray-300 focus:outline-indigo-600"
          }`}
        />
        {errors.customerEmail && (
          <p className="text-red-500 text-sm">{errors.customerEmail.message}</p>
        )}
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium text-strong">
          Phone Number
        </label>
        <input
          type="tel"
          {...register("customerPhone")}
          className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-strong outline-1 -outline-offset-1 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6 ${
            errors.customerPhone
              ? "outline-red-500"
              : "outline-gray-300 focus:outline-indigo-600"
          }`}
        />
        {errors.customerPhone && (
          <p className="text-red-500 text-sm">{errors.customerPhone.message}</p>
        )}
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium text-strong">
          Address
        </label>
        <textarea
          {...register("customerAddress")}
          rows={3}
          className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-strong outline-1 -outline-offset-1 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6 ${
            errors.customerAddress
              ? "outline-red-500"
              : "outline-gray-300 focus:outline-indigo-600"
          }`}
        />
        {errors.customerAddress && (
          <p className="text-red-500 text-sm">
            {errors.customerAddress.message}
          </p>
        )}
      </div>
    </div>
  );
}
