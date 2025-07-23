import { CustomerInformation } from "@/app/_features/booking/types/booking-types";
import CustomPhoneInput from "@/app/_components/common/PhoneInput";

interface PersonalInformationProps {
  customerInformation: CustomerInformation;
  setCustomerInformation: (
    customerInformation:
      | CustomerInformation
      | ((prev: CustomerInformation) => CustomerInformation)
  ) => void;
  validationErrors: {
    personalInfo: string[];
  };
  showCard?: boolean;
  showHeader?: boolean;
}

const PersonalInformation = ({
  customerInformation,
  setCustomerInformation,
  validationErrors,
  showCard = true,
  showHeader = true,
}: PersonalInformationProps) => {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof CustomerInformation
  ) => {
    const { value } = e.target;

    setCustomerInformation((prev: CustomerInformation) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePhoneChange = (value: string, country: any) => {
    setCustomerInformation((prev: CustomerInformation) => ({
      ...prev,
      phone_number: value,
    }));
  };

  const content = (
    <>
      {showHeader && (
        <h2 className="text-lg font-bold text-strong mb-4">
          Personal Information
        </h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-[#666666] mb-1.5"
          >
            First Name
            {validationErrors.personalInfo.includes("First Name") && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={customerInformation.first_name}
            onChange={(e) => handleInputChange(e, "first_name")}
            className={`w-full px-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc] focus:border-[#0066cc] text-sm ${
              validationErrors.personalInfo.includes("First Name")
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300"
            }`}
            required
          />
          {validationErrors.personalInfo.includes("First Name") && (
            <p className="mt-1 text-xs text-red-500">First name is required</p>
          )}
        </div>
        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-[#666666] mb-1.5"
          >
            Last Name
            {validationErrors.personalInfo.includes("Last Name") && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={customerInformation.last_name}
            onChange={(e) => handleInputChange(e, "last_name")}
            className={`w-full px-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc] focus:border-[#0066cc] text-sm ${
              validationErrors.personalInfo.includes("Last Name")
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300"
            }`}
            required
          />
          {validationErrors.personalInfo.includes("Last Name") && (
            <p className="mt-1 text-xs text-red-500">Last name is required</p>
          )}
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-[#666666] mb-1.5"
          >
            Email
            {validationErrors.personalInfo.includes("Email") && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={customerInformation.email}
            onChange={(e) => handleInputChange(e, "email")}
            className={`w-full px-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc] focus:border-[#0066cc] text-sm ${
              validationErrors.personalInfo.includes("Email") ||
              validationErrors.personalInfo.includes(
                "Please enter a valid email address"
              )
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300"
            }`}
            required
          />
          {validationErrors.personalInfo.includes("Email") && (
            <p className="mt-1 text-xs text-red-500">Email is required</p>
          )}
          {validationErrors.personalInfo.includes(
            "Please enter a valid email address"
          ) && (
            <p className="mt-1 text-xs text-red-500">
              Please enter a valid email address
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-[#666666] mb-1.5"
          >
            Phone Number
            {validationErrors.personalInfo.includes("Phone Number") && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
          <CustomPhoneInput
            value={customerInformation.phone_number}
            onChange={handlePhoneChange}
            error={
              validationErrors.personalInfo.includes("Phone Number") ||
              validationErrors.personalInfo.includes(
                "Please enter a valid phone number"
              )
                ? validationErrors.personalInfo.includes("Phone Number")
                  ? "Phone number is required"
                  : "Please enter a valid phone number"
                : undefined
            }
            className="w-full px-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc] focus:border-[#0066cc] text-sm border-gray-300"
            customInputStyle={{
              height: "40px",
              fontSize: "14px",
              borderRadius: "8px",
            }}
          />
        </div>
      </div>
    </>
  );

  if (showCard) {
    return (
      <div className="rounded-xl border bg-white shadow-sm p-4 sm:p-6">
        {content}
      </div>
    );
  }

  return content;
};

export default PersonalInformation;
