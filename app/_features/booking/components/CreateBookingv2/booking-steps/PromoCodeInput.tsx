"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Check, X, Tag } from "lucide-react";

interface PromoCodeInputProps {
  totalAmount: number;
  onPromoApplied: (promoData: any) => void;
  onPromoRemoved: () => void;
  appliedPromo?: any;
}

const PromoCodeInput: React.FC<PromoCodeInputProps> = ({
  totalAmount,
  onPromoApplied,
  onPromoRemoved,
  appliedPromo,
}) => {
  const [promoCode, setPromoCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setError("Please enter a promo code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/validate-promo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: promoCode.trim(),
          totalAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to validate promo code");
        return;
      }

      if (data.success) {
        // Calculate discount client-side for display purposes only
        const promo = data.promo;
        let discountAmount = 0;

        if (promo.discount_type === "percentage") {
          // discount_value is a whole number percent (e.g. 20 means 20%)
          discountAmount = (totalAmount * promo.discount_value) / 100;
        } else if (promo.discount_type === "fixed_amount") {
          // discount_value is a fixed dollar amount
          discountAmount = promo.discount_value;
        } else {
          discountAmount = 0; // fallback if unknown type
        }

        // Ensure discount doesn't exceed total amount
        discountAmount = Math.min(discountAmount, totalAmount);

        const promoData = {
          ...promo,
          discount_amount: discountAmount,
          final_amount: totalAmount - discountAmount,
        };

        onPromoApplied(promoData);
        setPromoCode("");
        toast.success("Promo code applied successfully!");
      }
    } catch (error) {
      console.error("Error applying promo code:", error);
      setError("Failed to apply promo code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePromo = () => {
    onPromoRemoved();
    toast.success("Promo code removed");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleApplyPromo();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-strong">Promo Code</span>
      </div>

      {appliedPromo ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  {appliedPromo.code} Applied
                </p>
                <p className="text-xs text-green-600">
                  {appliedPromo.discount_type === "percentage"
                    ? `${appliedPromo.discount_value}% off`
                    : `$${appliedPromo.discount_value} off`}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemovePromo}
              className="h-8 w-8 p-0 text-green-600 hover:text-green-800 hover:bg-green-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={handleApplyPromo}
              disabled={isLoading || !promoCode.trim()}
              className="px-4"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Applying...
                </div>
              ) : (
                "Apply"
              )}
            </Button>
          </div>
          {error && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <X className="h-3 w-3" />
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PromoCodeInput;
