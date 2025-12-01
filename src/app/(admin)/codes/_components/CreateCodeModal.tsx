"use client";

import { useState } from "react";

export default function CreateCodeModal({ close, reload }) {
  const [form, setForm] = useState({
    code: "",
    type: "DISCOUNT",
    percent: "",
    amount: "",
    maxUsage: "",
    allowedUser: "",
  });

  const [loading, setLoading] = useState(false);

  function update(key, value) {
    setForm({ ...form, [key]: value });
  }

  async function create() {
    setLoading(true);

    const res = await fetch("/api/codes/create", {
      method: "POST",
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (res.status === 200) {
      alert("تم إنشاء الكود بنجاح");
      reload();
      close();
    } else {
      alert("حدث خطأ");
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">إنشاء كود جديد</h2>

        <input
          className="border p-2 rounded mb-3 w-full"
          placeholder="الكود"
          onChange={(e) => update("code", e.target.value)}
        />

        <select
          className="border p-2 rounded mb-3 w-full"
          onChange={(e) => update("type", e.target.value)}
        >
          <option value="DISCOUNT">كود خصم</option>
          <option value="COMPENSATION">كود تعويض</option>
          <option value="PAYMENT">كود دفع كامل</option>
        </select>

        {form.type === "DISCOUNT" && (
          <>
            <input
              type="number"
              className="border p-2 rounded mb-3 w-full"
              placeholder="نسبة الخصم % (اختياري)"
              onChange={(e) => update("percent", e.target.value)}
            />
            <input
              type="number"
              className="border p-2 rounded mb-3 w-full"
              placeholder="قيمة الخصم لعدد جنيهات (اختياري)"
              onChange={(e) => update("amount", e.target.value)}
            />
          </>
        )}

        {form.type === "COMPENSATION" && (
          <input
            type="number"
            className="border p-2 rounded mb-3 w-full"
            placeholder="قيمة التعويض"
            onChange={(e) => update("amount", e.target.value)}
          />
        )}

        {form.type === "PAYMENT" && (
          <p className="text-sm mb-3 text-gray-500">
            هذا الكود يجعل الدفع = 0 جنيه
          </p>
        )}

        <input
          type="number"
          className="border p-2 rounded mb-3 w-full"
          placeholder="الحد الأقصى لاستخدام الكود"
          onChange={(e) => update("maxUsage", e.target.value)}
        />

        <input
          className="border p-2 rounded mb-3 w-full"
          placeholder="ID المستخدم المسموح له (اختياري)"
          onChange={(e) => update("allowedUser", e.target.value)}
        />

        <div className="flex gap-2 mt-4">
          <button
            className="flex-1 bg-gray-300 p-2 rounded"
            onClick={close}
          >
            إلغاء
          </button>

          <button
            className="flex-1 bg-green-600 text-white p-2 rounded"
            onClick={create}
            disabled={loading}
          >
            {loading ? "جارٍ الإنشاء..." : "إنشاء"}
          </button>
        </div>
      </div>
    </div>
  );
}
