import { AdditionalProduct } from "../types/booking-types";

export const handlePaymentLinkUpdate = async (
  isUpdate: boolean = false,
  currentSlots: any[] = [],
  currentProducts: AdditionalProduct[] = []
) => {
  try {
    const response = await fetch("/api/create-payment-link", {
      method: isUpdate ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        slots: currentSlots.length,
        tourProducts: currentProducts.map((product) => ({
          name: product.name,
          quantity: product.quantity,
          unit_price: Math.round(product.unit_price * 100),
        })),
        slotDetails: currentSlots,
        ...(isUpdate && {
          previousSessionId: window.location.pathname.split("/").pop(),
        }),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || `Failed to ${isUpdate ? "update" : "create"} payment link`
      );
    }

    return data;
  } catch (error) {
    console.error("Payment link error:", error);
    throw error;
  }
};
