import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface RefundAmountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
  totalAmount: number;
  isLoading?: boolean;
}

const RefundAmountModal: React.FC<RefundAmountModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  totalAmount,
  isLoading = false,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>("100");
  const [customAmount, setCustomAmount] = useState<string>("");

  const getRefundAmount = (): number => {
    if (selectedOption === "custom") {
      const amount = parseFloat(customAmount.trim());
      return isNaN(amount) ? 0 : Math.round(amount * 100) / 100;
    }
    const percentage = parseInt(selectedOption);
    return Math.round(totalAmount * percentage * 100) / 10000;
  };

  const handleConfirm = () => {
    const refundAmount = getRefundAmount();
    onConfirm(refundAmount);
  };

  const handleOptionChange = (value: string) => {
    setSelectedOption(value);
    if (value !== "custom") {
      setCustomAmount("");
    }
  };

  const formatAmount = (amount: number) => `$${amount.toFixed(2)}`;

  const refundAmount = getRefundAmount();

  const isConfirmDisabled =
    isLoading ||
    (selectedOption === "custom" &&
      (!customAmount.trim() ||
        isNaN(parseFloat(customAmount)) ||
        refundAmount <= 0 ||
        refundAmount > totalAmount));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Refund Amount</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup
            value={selectedOption}
            onValueChange={handleOptionChange}
            className="space-y-4"
          >
            {[
              { label: "Full Refund (100%)", value: "100", percent: 1 },
              { label: "Half Refund (50%)", value: "50", percent: 0.5 },
              { label: "Partial Refund (40%)", value: "40", percent: 0.4 },
            ].map(({ label, value, percent }) => (
              <div key={value} className="flex items-center space-x-2">
                <RadioGroupItem value={value} id={value} />
                <Label htmlFor={value} className="flex-1">
                  {label}
                  <span className="block text-sm text-gray-500">
                    {formatAmount(totalAmount * percent)}
                  </span>
                </Label>
              </div>
            ))}

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id="custom" />
              <Label htmlFor="custom" className="flex-1">
                Custom Amount
              </Label>
            </div>
          </RadioGroup>

          {selectedOption === "custom" && (
            <div className="mt-4">
              <Label htmlFor="customAmount">Enter Amount</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <Input
                  id="customAmount"
                  type="number"
                  min="0"
                  max={totalAmount}
                  step="0.01"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="pl-7"
                  placeholder="0.00"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Maximum refund amount: {formatAmount(totalAmount)}
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isConfirmDisabled}>
            {isLoading ? "Processing..." : "Confirm Refund"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RefundAmountModal;
