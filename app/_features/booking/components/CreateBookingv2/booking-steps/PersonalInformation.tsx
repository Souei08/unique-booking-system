import { CustomerInformation } from "@/app/_features/booking/types/booking-types";

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

  const content = (
    <>
      {showHeader && (
        <h2 className="text-xl sm:text-2xl font-bold text-strong mb-4 sm:mb-8">
          Personal Information
        </h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2"
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
            className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-background border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm sm:text-base ${
              validationErrors.personalInfo.includes("First Name")
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : ""
            }`}
            required
          />
          {validationErrors.personalInfo.includes("First Name") && (
            <p className="mt-1 text-sm text-red-500">First name is required</p>
          )}
        </div>
        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2"
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
            className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-background border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm sm:text-base ${
              validationErrors.personalInfo.includes("Last Name")
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : ""
            }`}
            required
          />
          {validationErrors.personalInfo.includes("Last Name") && (
            <p className="mt-1 text-sm text-red-500">Last name is required</p>
          )}
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2"
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
            className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-background border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm sm:text-base ${
              validationErrors.personalInfo.includes("Email") ||
              validationErrors.personalInfo.includes(
                "Please enter a valid email address"
              )
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : ""
            }`}
            required
          />
          {validationErrors.personalInfo.includes("Email") && (
            <p className="mt-1 text-sm text-red-500">Email is required</p>
          )}
          {validationErrors.personalInfo.includes(
            "Please enter a valid email address"
          ) && (
            <p className="mt-1 text-sm text-red-500">
              Please enter a valid email address
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2"
          >
            Phone Number
            {validationErrors.personalInfo.includes("Phone Number") && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={customerInformation.phone_number}
            onChange={(e) => handleInputChange(e, "phone_number")}
            className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-background border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm sm:text-base ${
              validationErrors.personalInfo.includes("Phone Number") ||
              validationErrors.personalInfo.includes(
                "Please enter a valid phone number"
              )
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : ""
            }`}
            required
          />
          {validationErrors.personalInfo.includes("Phone Number") && (
            <p className="mt-1 text-sm text-red-500">
              Phone number is required
            </p>
          )}
          {validationErrors.personalInfo.includes(
            "Please enter a valid phone number"
          ) && (
            <p className="mt-1 text-sm text-red-500">
              Please enter a valid phone number
            </p>
          )}
        </div>
      </div>
    </>
  );

  if (showCard) {
    return (
      <div className="rounded-2xl sm:rounded-3xl border bg-card shadow-lg p-4 sm:p-8">
        {content}
      </div>
    );
  }

  return content;
};

export default PersonalInformation;
