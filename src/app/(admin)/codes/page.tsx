"use client";

import { useEffect, useState } from "react";
import CreateCodeModal from "./_components/CreateCodeModal";
import UsageModal from "./_components/UsageModal";

export default function CodesPage() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showUsage, setShowUsage] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  useEffect(() => {
    loadCodes();
  }, []);

  async function loadCodes() {
    setLoading(true);
    const res = await fetch("/api/codes/list");
    const data = await res.json();
    setCodes(data);
    setLoading(false);
  }

  async function deleteCode(code) {
    if (!confirm("هل تريد حذف هذا الكود؟")) return;
    await fetch("/api/codes/delete", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
    loadCodes();
  }

  const filtered = codes.filter((c) => {
    const matchSearch = c.code.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "ALL" ? true : c.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">إدارة الأكواد</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <input
          placeholder="ابحث عن كود..."
          className="border p-2 rounded flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="ALL">الكل</option>
          <option value="DISCOUNT">خصم</option>
          <option value="COMPENSATION">تعويض</option>
          <option value="PAYMENT">دفع</option>
        </select>

        <button
          className="bg-green-600 text-white px-4 rounded"
          onClick={() => setShowCreate(true)}
        >
          + إنشاء كود
        </button>
      </div>

      {loading ? (
        <p>جاري التحميل...</p>
      ) : (
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">الكود</th>
              <th className="p-2 border">النوع</th>
              <th className="p-2 border">القيمة</th>
              <th className="p-2 border">الحد</th>
              <th className="p-2 border">المستخدم</th>
              <th className="p-2 border">العمليات</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((c, i) => (
              <tr key={i}>
                <td className="p-2 border">{c.code}</td>
                <td className="p-2 border">{c.type}</td>
                <td className="p-2 border">
                  {c.percent
                    ? c.percent + "%"
                    : c.amount
                    ? c.amount + " ج"
                    : "-"}
                </td>
                <td className="p-2 border">{c.maxUsage || "-"}</td>
                <td className="p-2 border">{c.allowedUser || "الكل"}</td>

                <td className="p-2 border flex gap-2">
                  <button
                    className="bg-blue-600 text-white px-2 rounded"
                    onClick={() => setShowUsage(c.code)}
                  >
                    سجل الاستخدام
                  </button>

                  <button
                    className="bg-red-600 text-white px-2 rounded"
                    onClick={() => deleteCode(c.code)}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showCreate && (
        <CreateCodeModal close={() => setShowCreate(false)} reload={loadCodes} />
      )}

      {showUsage && (
        <UsageModal code={showUsage} close={() => setShowUsage(null)} />
      )}
    </div>
  );
}
