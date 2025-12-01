// Final Checkout Page (Next.js) - Integrated Payment Flow
// Placeholder structure — please confirm required fields so I can complete the exact logic

import { useState } from "react";

export default function FinalCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Create Order API
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 100, currency: "EGP" }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.message);

      // 2. Get Payment Token from Paymob
      const tokenRes = await fetch("/api/payment/create-payment-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderData.order_id, amount: 100 }),
      });

      const tokenData = await tokenRes.json();
      if (!tokenRes.ok) throw new Error(tokenData.message);

      // 3. Redirect to Paymob iframe
      window.location.href = `https://accept.paymob.com/api/acceptance/iframes/000000?payment_token=${tokenData.payment_key}`;
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Final Checkout</h1>
      <p>Total: 100 EGP</p>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>Redirecting to payment...</p>}

      <button onClick={handleCheckout} disabled={loading}>
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </div>
  );
}
