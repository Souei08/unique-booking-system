import React from "react";

const paymentMethods = [{ id: "credit-card", title: "Credit card" }];

const PaymentMethod = () => {
  return (
    <>
      <h2 className="text-lg font-medium text-gray-900">Payment</h2>

      <fieldset className="mt-4">
        <legend className="sr-only">Payment type</legend>
        <div className="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
          {paymentMethods.map((paymentMethod) => (
            <div key={paymentMethod.id} className="flex items-center">
              <input
                defaultChecked={true}
                id={paymentMethod.id}
                name="payment-type"
                type="radio"
                className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden"
                disabled
              />
              <label
                htmlFor={paymentMethod.id}
                className="ml-3 block text-sm/6 font-medium text-gray-700"
              >
                {paymentMethod.title}
              </label>
            </div>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 grid grid-cols-4 gap-x-4 gap-y-6">
        <div className="col-span-4">
          <label
            htmlFor="card-number"
            className="block text-sm/6 font-medium text-gray-700"
          >
            Card number
          </label>
          <div className="mt-2">
            <input
              id="card-number"
              name="card-number"
              type="text"
              autoComplete="cc-number"
              className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
            />
          </div>
        </div>

        <div className="col-span-4">
          <label
            htmlFor="name-on-card"
            className="block text-sm/6 font-medium text-gray-700"
          >
            Name on card
          </label>
          <div className="mt-2">
            <input
              id="name-on-card"
              name="name-on-card"
              type="text"
              autoComplete="cc-name"
              className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
            />
          </div>
        </div>

        <div className="col-span-3">
          <label
            htmlFor="expiration-date"
            className="block text-sm/6 font-medium text-gray-700"
          >
            Expiration date (MM/YY)
          </label>
          <div className="mt-2">
            <input
              id="expiration-date"
              name="expiration-date"
              type="text"
              autoComplete="cc-exp"
              className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="cvc"
            className="block text-sm/6 font-medium text-gray-700"
          >
            CVC
          </label>
          <div className="mt-2">
            <input
              id="cvc"
              name="cvc"
              type="text"
              autoComplete="csc"
              className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentMethod;
