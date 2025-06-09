import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { RefreshCw, UserCog } from "lucide-react";
import PersonalInformation from "../CreateBookingv2/booking-steps/PersonalInformation";
import { toast } from "sonner";
import { updateCustomerInfo } from "../../api/updateCustomerInfo";
import {
  AdditionalProduct,
  CustomerInformation,
} from "../../types/booking-types";

interface PersonalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bookingId: string;
  initialCustomerInfo: CustomerInformation;
  paymentLink?: string;
  handlePaymentLinkUpdate: (
    isUpdate: boolean,
    currentSlots: any[] | null,
    currentProducts: AdditionalProduct[] | null,
    currentCustomerInfo: CustomerInformation | null
  ) => Promise<boolean | undefined>;
}

const PersonalInfoModal: React.FC<PersonalInfoModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  bookingId,
  initialCustomerInfo,
  paymentLink,
  handlePaymentLinkUpdate,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [customerInformation, setCustomerInformation] =
    useState<CustomerInformation>(initialCustomerInfo);
  const [validationErrors, setValidationErrors] = useState<{
    personalInfo: string[];
  }>({
    personalInfo: [],
  });

  const handleUpdatePersonalInfo = async () => {
    setEditError(null);

    // Validate personal information
    const errors = {
      personalInfo: [] as string[],
    };

    // Check required fields
    const requiredFields: (keyof CustomerInformation)[] = [
      "first_name",
      "last_name",
      "email",
      "phone_number",
    ];

    const missingFields = requiredFields.filter(
      (field) =>
        !customerInformation[field] || customerInformation[field].trim() === ""
    );

    if (missingFields.length > 0) {
      errors.personalInfo = missingFields.map((field) =>
        field
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (
      customerInformation.email &&
      !emailRegex.test(customerInformation.email)
    ) {
      errors.personalInfo.push("Please enter a valid email address");
    }

    // Validate phone number format
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (
      customerInformation.phone_number &&
      !phoneRegex.test(customerInformation.phone_number)
    ) {
      errors.personalInfo.push("Please enter a valid phone number");
    }

    setValidationErrors(errors);

    if (errors.personalInfo.length > 0) {
      return;
    }

    setIsLoading(true);
    try {
      // Update customer information
      await updateCustomerInfo({
        booking_id: bookingId,
        first_name: customerInformation.first_name,
        last_name: customerInformation.last_name,
        email: customerInformation.email,
        phone_number: customerInformation.phone_number,
      });

      // If there's a payment link, update it
      if (paymentLink) {
        await handlePaymentLinkUpdate(true, [], [], customerInformation);
      }

      toast.success("Personal information updated successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Personal info update error:", error);
      setEditError(
        error instanceof Error
          ? error.message
          : "Failed to update personal information"
      );
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update personal information"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setEditError(null);
          setCustomerInformation(initialCustomerInfo);
          setValidationErrors({ personalInfo: [] });
        }
        onClose();
      }}
    >
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[800px] lg:max-w-[1500px] max-h-[95vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-2xl font-bold text-strong flex items-center gap-2">
            <UserCog className="w-5 h-5" />
            Edit Personal Information
          </DialogTitle>
          <p className="text-sm text-gray-500">
            Update the customer's personal information. All fields are required
            and must be valid.
          </p>
        </DialogHeader>
        {editError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{editError}</p>
          </div>
        )}
        <div className="py-4">
          <PersonalInformation
            customerInformation={customerInformation}
            setCustomerInformation={setCustomerInformation}
            validationErrors={validationErrors}
            showCard={false}
            showHeader={false}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setCustomerInformation(initialCustomerInfo);
              setValidationErrors({ personalInfo: [] });
              onClose();
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleUpdatePersonalInfo} disabled={isLoading}>
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PersonalInfoModal;
