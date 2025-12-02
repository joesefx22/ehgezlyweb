// src/app/(player)/checkout/final/page.tsx
"use client";
import React, { useEffect, useState, useRef } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function FinalCheckoutPage({ searchParams }: { searchParams?: any }) {
  // try to read booking info from URL searchParams first (fallback to defaults)
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams("");
  const priceParam = params.get("price") || (searchParams && searchParams.price) || "300";
  const playgroundId = params.get("playgroundId") || (searchParams && searchParams.playgroundId) || null;
  const dateParam = params.get("date") || (searchParams && searchParams.date) || null;
  const timeParam = params.get("time") || (searchParams && searchParams.time) || null;

  const [price, setPrice] = useState<number>(Number(priceParam));
  const [finalPrice, setFinalPrice] = useState<number>(Number(priceParam));
  const [coupon, setCoupon] = useState<string>("");
  const [appliedCode, setAppliedCode] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [order, setOrder] = useState<any>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // for polling verify
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    setPrice(Number(priceParam));
    setFinalPrice(Number(priceParam));
  }, [priceParam]);

  async function applyCode() {
    if (!coupon) return alert("اكتب الكود أولاً");
    setLoading(true);
    try {
      const res = await fetch("/api/codes/validate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code: coupon, userId: null /* optional */ , price })
      });
      const j = await res.json();
      setLoading(false);
      if (!res.ok || !j.valid && !j.ok) {
        // try to handle different shapes
        const msg = j.message || j.error || j.reason || "الكود غير صالح";
        return alert(msg);
      }

      // j could be { valid:true, finalPrice, code } if using validateCode helper
      const newFinal = j.finalPrice ?? (j.data?.finalPrice) ?? price;
      setFinalPrice(newFinal);
      setAppliedCode(j.code ?? j.data?.code ?? { code: coupon });
      alert("تم تطبيق الكود");
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("خطأ أثناء التحقق من الكود");
    }
  }

  async function startPayment() {
    setLoading(true);

    try {
      // 1) create-order
      const createRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          userId: null,
          playgroundId,
          date: dateParam,
          time: timeParam,
          price,
          code: appliedCode?.code || null
        })
      });
      const createJson = await createRes.json();
      if (!createRes.ok || !createJson.ok) {
        const err = createJson.error || createJson;
        setLoading(false);
        return alert("فشل إنشاء الأوردر: " + (err?.message || err));
      }

      const createdOrder = createJson.data;
      setOrder(createdOrder);

      // 2) create payment key / iframe
      const keyRes = await fetch("/api/payment/create-payment-key", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId: createdOrder.id })
      });
      const keyJson = await keyRes.json();
      if (!keyRes.ok || !keyJson.ok) {
        setLoading(false);
        return alert("فشل تجهيز الدفع: " + (keyJson.error || keyJson));
      }

      const url = keyJson.data?.iframeUrl ?? keyJson.data?.iframe_url ?? keyJson.data?.iframeUrl;
      if (!url) {
        setLoading(false);
        return alert("لا يوجد رابط الدفع");
      }

      setIframeUrl(url);
      setPolling(true);
      setLoading(false);

      // start polling verify
      pollOrderStatus(createdOrder.id);

    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("حدث خطأ أثناء بدء الدفع");
    }
  }

  async function pollOrderStatus(orderId: number) {
    let attempts = 0;
    const maxAttempts = 40; // ~80 seconds
    const interval = 2000;

    const timer = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ orderId })
        });
        const j = await res.json();
        if (res.ok && (j.status === "PAID" || j.status === "paid")) {
          clearInterval(timer);
          setPolling(false);
          setIframeUrl(null);
          // register code usage (best via webhook — we call it here for fast UX)
          if (appliedCode?.code) {
            await fetch("/api/codes/use", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ code: appliedCode.code, userId: null, bookingId: orderId })
            });
          }
          // update local order if needed
          alert("تم الدفع بنجاح");
          window.location.href = "/payment/success";
        } else if (res.ok && (j.status === "FAILED" || j.status === "failed")) {
          clearInterval(timer);
          setPolling(false);
          setIframeUrl(null);
          alert("فشل الدفع");
          window.location.href = "/payment/failed";
        } else {
          // still pending
          if (attempts >= maxAttempts) {
            clearInterval(timer);
            setPolling(false);
            setIframeUrl(null);
            alert("انتهت مدة الانتظار، تحقق من حالة الدفع لاحقاً");
            // optionally redirect to status page
          }
        }
      } catch (err) {
        console.error("poll error", err);
      }
    }, interval);
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">الدفع النهائي</h1>

      <Card className="p-4 mb-4">
        <div className="mb-2">السعر الأصلي: <strong>{price} جنيه</strong></div>
        <div>السعر النهائي: <strong className="text-green-600">{finalPrice} جنيه</strong></div>
      </Card>

      <Card className="p-4 mb-4">
        <label className="block text-sm mb-1">كود الخصم / التعويض / الدفع</label>
        <div className="flex gap-2">
          <input className="input-lux flex-1" value={coupon} onChange={(e)=>setCoupon(e.target.value)} placeholder="اكتب الكود" />
          <Button onClick={applyCode} disabled={loading}>{loading ? "جارٍ..." : "تطبيق"}</Button>
        </div>
        {appliedCode && <div className="text-sm text-zinc-500 mt-2">مطبق: {appliedCode.code} — نوع: {appliedCode.type}</div>}
      </Card>

      <div className="flex gap-3">
        <Button onClick={startPayment} disabled={loading || !!iframeUrl}>{loading ? "جارٍ التجهيز..." : "ادفع الآن"}</Button>
        <a href="/player/bookings"><Button variant="secondary">رجوع للحجوزات</Button></a>
      </div>

      {/* iframe modal */}
      {iframeUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative w-full max-w-4xl h-[80vh] bg-white rounded shadow-lg overflow-hidden">
            <div className="p-2 flex justify-end">
              <button className="px-3 py-1 bg-white/6 rounded" onClick={() => { setIframeUrl(null); setPolling(false); }}>إغلاق</button>
            </div>
            <iframe ref={iframeRef} src={iframeUrl} className="w-full h-full border-0" title="payframe" />
          </div>
        </div>
      )}
    </div>
  );
}

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
