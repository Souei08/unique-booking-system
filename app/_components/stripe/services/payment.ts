export const createPaymentIntent = async (amount: number) => {
  const res = await fetch("/api/create-payment-intent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount, currency: "usd" }),
  });

  if (!res.ok) {
    throw new Error("Failed to create payment intent");
  }

  return res.json();
};
