"use client";
import { useState, useEffect } from "react";

export default function PaymentPage({ params }) {
  const { bookingId } = params;
  const [url, setUrl] = useState(null);

  useEffect(() => {
    fetch("/api/payments/create", {
      method: "POST",
      body: JSON.stringify({ bookingId })
    })
      .then(res => res.json())
      .then(data => setUrl(data.iframe_url));
  }, []);

  if (!url) return <div className="p-10 text-center">جاري تحميل الدفع…</div>;

  return (
    <iframe
      src={url}
      style={{ width: "100%", height: "95vh", border: "0" }}
      allow="payment"
    />
  );
}
