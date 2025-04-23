import React from "react";

interface CustomerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface ValidationErrors {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface CustomerDetailsStepProps {
  customerDetails: CustomerDetails;
  setCustomerDetails: (details: CustomerDetails) => void;
  validationErrors: ValidationErrors;
}

export const CustomerDetailsStep: React.FC<CustomerDetailsStepProps> = ({
  customerDetails,
  setCustomerDetails,
  validationErrors,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Customer Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            value={customerDetails.firstName}
            onChange={(e) =>
              setCustomerDetails({
                ...customerDetails,
                firstName: e.target.value,
              })
            }
            className={`w-full px-3 py-2 border ${
              validationErrors.firstName ? "border-red-500" : "border-gray-300"
            } rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
            required
          />
          {validationErrors.firstName && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.firstName}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            value={customerDetails.lastName}
            onChange={(e) =>
              setCustomerDetails({
                ...customerDetails,
                lastName: e.target.value,
              })
            }
            className={`w-full px-3 py-2 border ${
              validationErrors.lastName ? "border-red-500" : "border-gray-300"
            } rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
            required
          />
          {validationErrors.lastName && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.lastName}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={customerDetails.email}
            onChange={(e) =>
              setCustomerDetails({
                ...customerDetails,
                email: e.target.value,
              })
            }
            className={`w-full px-3 py-2 border ${
              validationErrors.email ? "border-red-500" : "border-gray-300"
            } rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
            required
          />
          {validationErrors.email && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.email}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            value={customerDetails.phone}
            onChange={(e) =>
              setCustomerDetails({
                ...customerDetails,
                phone: e.target.value,
              })
            }
            className={`w-full px-3 py-2 border ${
              validationErrors.phone ? "border-red-500" : "border-gray-300"
            } rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
            required
          />
          {validationErrors.phone && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.phone}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
