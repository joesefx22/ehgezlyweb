"use client";

import { useState, useEffect } from "react";

export default function CheckoutPage() {
  const [price, setPrice] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [coupon, setCoupon] = useState("");
  const [appliedCode, setAppliedCode] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 👇 هنا بيكون userId من الجلسة – غيّره حسب نظامك
  const userId = "TEMP_USER_ID";

  useEffect(() => {
    // 👇 السعر الأصلي – يُجلب حسب الحجز
    const bookingPrice = 300;
    setPrice(bookingPrice);
    setFinalPrice(bookingPrice);
  }, []);

  async function applyCode() {
    if (!coupon) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/codes/validate", {
        method: "POST",
        body: JSON.stringify({ code: coupon, userId }),
      });

      const data = await res.json();
      setLoading(false);

      if (!data.valid) {
        if (data.reason === "INVALID_CODE") setError("الكود غير صالح");
        else if (data.reason === "EXPIRED") setError("الكود منتهي");
        else if (data.reason === "USAGE_LIMIT") setError("الكود وصل الحد الأقصى");
        else if (data.reason === "NOT_ALLOWED") setError("هذا الكود ليس لك");
        else setError("حدث خطأ");
        return;
      }

      // حفظ الكود المطبق
      setAppliedCode(data.code);

      // حساب الخصم حسب نوع الكود
      if (data.code.type === "DISCOUNT") {
        if (data.code.percent) {
          const newPrice = price - (price * data.code.percent) / 100;
          setFinalPrice(Math.max(0, newPrice));
        } else if (data.code.amount) {
          const newPrice = price - data.code.amount;
          setFinalPrice(Math.max(0, newPrice));
        }
      }

      if (data.code.type === "COMPENSATION") {
        const newPrice = price - data.code.amount;
        setFinalPrice(Math.max(0, newPrice));
      }

      if (data.code.type === "PAYMENT") {
        setFinalPrice(0);
      }

    } catch (e) {
      setLoading(false);
      setError("خطأ أثناء تطبيق الكود");
    }
  }

  async function confirmPayment() {
    if (!appliedCode) {
      alert("تم الدفع بدون كود");
      return;
    }

    // 👇 bookingId يتم توليده بعد إنشاء الحجز – هتحطه من نظامك
    const bookingId = "TEMP_BOOKING_ID";

    await fetch("/api/codes/use", {
      method: "POST",
      body: JSON.stringify({
        code: appliedCode.code,
        userId,
        bookingId,
      }),
    });

    alert("تم الدفع بنجاح");
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-4">الدفع</h1>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <p className="text-xl">
          السعر الأصلي: <strong>{price} جنيه</strong>
        </p>

        <p className="text-xl mt-2">
          السعر بعد الخصم:
          <strong className="text-green-600"> {finalPrice} جنيه</strong>
        </p>
      </div>

      {/* إدخال الكوبون */}
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <label className="font-semibold">إضافة كود خصم / تعويض / دفع:</label>
        <div className="flex gap-2 mt-2">
          <input
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            placeholder="اكتب الكود هنا"
            className="border p-2 rounded flex-1"
          />
          <button
            onClick={applyCode}
            className="bg-blue-600 text-white px-4 rounded"
            disabled={loading}
          >
            {loading ? "جارٍ التحقق..." : "تطبيق"}
          </button>
        </div>

        {error && <p className="text-red-600 mt-2">{error}</p>}

        {appliedCode && (
          <p className="text-green-600 mt-2">
            ✅ تم تطبيق الكود: {appliedCode.code}
          </p>
        )}
      </div>

      {/* زر الدفع النهائي */}
      <button
        onClick={confirmPayment}
        className="bg-green-600 text-white p-3 w-full rounded-lg text-lg mt-4"
      >
        تأكيد الدفع
      </button>
    </div>
  );
}
