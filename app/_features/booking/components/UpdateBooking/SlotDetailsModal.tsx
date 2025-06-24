import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { RefreshCw, Edit2 } from "lucide-react";
import SlotDetails from "../CreateBookingv2/booking-steps/SlotDetails";
import {
  CustomSlotType,
  CustomSlotField,
} from "../CreateBookingv2/booking-steps/SlotDetails";
import { toast } from "sonner";
import { updateBookingSlots } from "../../api/update-booking/UpdateBookingSlots";
import {
  AdditionalProduct,
  CustomerInformation,
  SlotDetail,
} from "../../types/booking-types";

interface SlotDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bookingId: string;
  initialSlotDetails: any[];
  customSlotTypes: CustomSlotType[] | null;
  customSlotFields: CustomSlotField[];
  tourRate: number;
  paymentStatus: string;
  paymentLink?: string;
  stripePaymentId?: string;
  handlePaymentLinkUpdate: (
    isUpdate: boolean,
    currentSlots: any[] | null,
    currentProducts: AdditionalProduct[] | null,
    currentCustomerInfo: CustomerInformation | null
  ) => Promise<boolean | undefined>;
}

const SlotDetailsModal: React.FC<SlotDetailsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  bookingId,
  initialSlotDetails,
  customSlotTypes,
  customSlotFields,
  tourRate,
  paymentStatus,
  paymentLink,
  stripePaymentId,
  handlePaymentLinkUpdate,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editedSlotDetails, setEditedSlotDetails] =
    useState<any[]>(initialSlotDetails);

  const handleAddSlot = () => {
    if (isLoading) return;
    setEditedSlotDetails((prev) => [
      ...prev,
      {
        type: customSlotTypes?.[0]?.name || "",
        price: customSlotTypes?.[0]?.price || 0,
      },
    ]);
  };

  const handleRemoveSlot = (index: number) => {
    if (isLoading || editedSlotDetails.length <= 1) return;
    setEditedSlotDetails((prev) => {
      const newSlots = [...prev];
      newSlots.splice(index, 1);
      return newSlots;
    });
  };

  const getSlotPrice = (slot: SlotDetail) => {
    if (customSlotTypes) {
      const typeDef = customSlotTypes.find((t) => t.name === slot.type);
      return typeDef ? typeDef.price : tourRate;
    }
    return tourRate;
  };

  // Handle slot details change
  const handleSlotDetailsChange = (
    details: SlotDetail[],
    totalPrice: number
  ) => {
    // Update slot details with prices
    const updatedSlotDetails = details.map((slot) => ({
      ...slot,
      price: getSlotPrice(slot),
    }));

    // Update the slot details state
    setEditedSlotDetails(updatedSlotDetails);

    // Update payment information with new total
    // setPaymentInformation({
    //   ...paymentInformation,
    //   total_price: totalPrice,
    // });
  };

  const handleUpdateSlotDetails = async () => {
    setEditError(null);

    // Validate that we have at least one slot
    if (editedSlotDetails.length === 0) {
      setEditError("At least one slot is required");
      return;
    }

    // Validate all slots
    const errors: string[] = [];
    editedSlotDetails.forEach((slot, index) => {
      // Validate custom slot fields
      customSlotFields.forEach((field) => {
        if (field.required) {
          const value = slot[field.name];
          if (value === undefined || value === null || value === "") {
            errors.push(`Slot ${index + 1}: ${field.label} is required`);
          }
        }
      });

      // Validate slot type if custom slot types exist and are not empty
      if (customSlotTypes && customSlotTypes.length > 0) {
        if (!slot.type) {
          errors.push(`Slot ${index + 1}: Type is required`);
        } else if (!customSlotTypes.find((t) => t.name === slot.type)) {
          errors.push(`Slot ${index + 1}: Invalid type selected`);
        }
      }
    });

    if (errors.length > 0) {
      setEditError(errors.join("\n"));
      return;
    }

    setIsLoading(true);
    try {
      // First update the booking slots
      await updateBookingSlots(
        bookingId,
        editedSlotDetails,
        editedSlotDetails.length
      );

      // If there's a payment link, update it
      if (paymentLink) {
        await handlePaymentLinkUpdate(true, editedSlotDetails, null, null);
      }

      toast.success("Slot details updated successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Slot update error:", error);
      setEditError(
        error instanceof Error ? error.message : "Failed to update slot details"
      );
      toast.error(
        error instanceof Error ? error.message : "Failed to update slot details"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalAmount = (
    slots: any[],
    products: any[],
    customTypes: CustomSlotType[] | null,
    baseRate: number
  ): number => {
    // Calculate total from custom slots
    const slotsTotal =
      customTypes && customTypes.length > 0
        ? slots.reduce((sum, slot) => {
            const slotType = customTypes.find((t) => t.name === slot.type);
            return sum + (slotType?.price || 0);
          }, 0)
        : baseRate * slots.length;

    // Calculate total from products
    const productsTotal = products.reduce(
      (sum, product) => sum + product.unit_price * product.quantity,
      0
    );

    return slotsTotal + productsTotal;
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setEditError(null);
          setEditedSlotDetails(initialSlotDetails);
        }
        onClose();
      }}
    >
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[800px] lg:max-w-[1500px] max-h-[95vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-2xl font-bold text-strong flex items-center gap-2">
            <Edit2 className="w-5 h-5" />
            Edit Slot Details
          </DialogTitle>
          <p className="text-sm text-gray-500">
            Update the slot details for this booking. Make sure all required
            fields are filled correctly.
          </p>
        </DialogHeader>
        {editError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{editError}</p>
          </div>
        )}
        <div className="py-4">
          <SlotDetails
            numberOfPeople={editedSlotDetails.length}
            customSlotTypes={customSlotTypes}
            customSlotFields={customSlotFields}
            tourRate={tourRate}
            setSlotDetails={setEditedSlotDetails}
            onSlotDetailsChange={handleSlotDetailsChange}
            slotDetails={editedSlotDetails}
            readOnly={false}
            showCard={false}
            showHeader={false}
            handleAddSlot={handleAddSlot}
            handleRemoveSlot={handleRemoveSlot}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setEditedSlotDetails(initialSlotDetails);
              onClose();
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleUpdateSlotDetails} disabled={isLoading}>
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

export default SlotDetailsModal;
