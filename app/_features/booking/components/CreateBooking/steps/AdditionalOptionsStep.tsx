import React from "react";

interface AdditionalOption {
  id: number;
  name: string;
  price: number;
  description: string;
}

interface AdditionalOptionsStepProps {
  additionalOptions: AdditionalOption[];
  selectedOptions: number[];
  toggleOption: (optionId: number) => void;
}

export const AdditionalOptionsStep: React.FC<AdditionalOptionsStepProps> = ({
  additionalOptions,
  selectedOptions,
  toggleOption,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">
        Additional Options
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {additionalOptions.map((option) => (
          <div
            key={option.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedOptions.includes(option.id)
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => toggleOption(option.id)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{option.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {option.description}
                </p>
              </div>
              <div className="flex items-center">
                <span className="text-blue-600 font-semibold mr-2">
                  ${option.price}
                </span>
                <input
                  type="checkbox"
                  checked={selectedOptions.includes(option.id)}
                  onChange={() => toggleOption(option.id)}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
