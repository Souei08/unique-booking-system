import { StepProps } from "../types";

export default function PaymentDetailsStep({ register, errors }: StepProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block mb-1 text-sm font-medium text-strong">
          Card Number
        </label>
        <input
          type="text"
          {...register("cardNumber")}
          placeholder="1234 5678 9012 3456"
          className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-strong outline-1 -outline-offset-1 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6 ${
            errors.cardNumber
              ? "outline-red-500"
              : "outline-gray-300 focus:outline-indigo-600"
          }`}
        />
        {errors.cardNumber && (
          <p className="text-red-500 text-sm">{errors.cardNumber.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-strong">
            Expiry Date
          </label>
          <input
            type="text"
            {...register("cardExpiry")}
            placeholder="MM/YY"
            className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-strong outline-1 -outline-offset-1 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6 ${
              errors.cardExpiry
                ? "outline-red-500"
                : "outline-gray-300 focus:outline-indigo-600"
            }`}
          />
          {errors.cardExpiry && (
            <p className="text-red-500 text-sm">{errors.cardExpiry.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-strong">
            CVV
          </label>
          <input
            type="text"
            {...register("cardCvv")}
            placeholder="123"
            className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-strong outline-1 -outline-offset-1 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6 ${
              errors.cardCvv
                ? "outline-red-500"
                : "outline-gray-300 focus:outline-indigo-600"
            }`}
          />
          {errors.cardCvv && (
            <p className="text-red-500 text-sm">{errors.cardCvv.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium text-strong">
          Cardholder Name
        </label>
        <input
          type="text"
          {...register("cardName")}
          className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-strong outline-1 -outline-offset-1 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6 ${
            errors.cardName
              ? "outline-red-500"
              : "outline-gray-300 focus:outline-indigo-600"
          }`}
        />
        {errors.cardName && (
          <p className="text-red-500 text-sm">{errors.cardName.message}</p>
        )}
      </div>
    </div>
  );
}
