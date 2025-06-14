import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { RefreshCw, Users } from "lucide-react";
import { toast } from "sonner";
import { updateBookingSlots } from "../../api/update-booking/UpdateBookingSlots";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/supabase/client";
import { updateRegularSlots } from "../../api/update-booking/UpdateRegularSlots";

interface UpdateSlotsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bookingId: string;
  currentSlots: number;
  slotDetails: any[];
  paymentStatus: string;
  paymentLink?: string;
  handlePaymentLinkUpdate: (
    isUpdate: boolean,
    currentSlots: any[] | null,
    currentProducts: any[] | null,
    currentCustomerInfo: any | null
  ) => Promise<boolean | undefined>;
  booking: any;
  editedProducts: any[];
}

const UpdateSlotsModal: React.FC<UpdateSlotsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  bookingId,
  currentSlots,
  slotDetails,
  paymentStatus,
  paymentLink,
  handlePaymentLinkUpdate,
  booking,
  editedProducts,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [newSlots, setNewSlots] = useState(currentSlots);

  const handleUpdateSlots = async () => {
    const supabase = await createClient();

    setEditError(null);

    // Validate input
    if (newSlots < 1) {
      setEditError("Number of slots must be at least 1");
      return;
    }

    setIsLoading(true);
    try {
      // Create new slot details array with the updated number of slots
      const updatedSlotDetails = [...slotDetails];
      while (updatedSlotDetails.length < newSlots) {
        updatedSlotDetails.push({
          type: slotDetails[0]?.type || "",
          price: slotDetails[0]?.price || 0,
        });
      }
      while (updatedSlotDetails.length > newSlots) {
        updatedSlotDetails.pop();
      }

      await updateRegularSlots(bookingId, newSlots);

      // If there's a payment link, update it
      if (paymentLink) {
        await handlePaymentLinkUpdate(true, updatedSlotDetails, null, null);
      }

      toast.success("Number of slots updated successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Slots update error:", error);
      setEditError(
        error instanceof Error
          ? error.message
          : "Failed to update number of slots"
      );
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update number of slots"
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
          setNewSlots(currentSlots);
        }
        onClose();
      }}
    >
      <DialogContent className="max-w-[95vw] sm:max-w-[500px]">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-2xl font-bold text-strong flex items-center gap-2">
            <Users className="w-5 h-5" />
            Update Number of Slots
          </DialogTitle>
          <p className="text-sm text-gray-500">
            Update the number of slots for this booking. The minimum number of
            slots is 1.
          </p>
        </DialogHeader>
        {editError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{editError}</p>
          </div>
        )}
        <div className="py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="slots">Number of Slots</Label>
              <Input
                id="slots"
                type="number"
                min={1}
                value={newSlots}
                onChange={(e) => setNewSlots(parseInt(e.target.value) || 1)}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setNewSlots(currentSlots);
              onClose();
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleUpdateSlots} disabled={isLoading}>
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

export default UpdateSlotsModal;
