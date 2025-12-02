"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function CodesUsagePage() {
  const [usage, setUsage] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/codes/usage").then(res => {
      setUsage(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📊 سجل استخدام الأكواد</h1>

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">الكود</th>
              <th className="p-3 text-left">النوع</th>
              <th className="p-3 text-left">القيمة</th>
              <th className="p-3 text-left">المستخدم</th>
              <th className="p-3 text-left">الحجز</th>
              <th className="p-3 text-left">تاريخ الاستخدام</th>
              <th className="p-3 text-left">تم الدفع؟</th>
            </tr>
          </thead>

          <tbody>
            {usage.map((u: any) => (
              <tr key={u.id} className="border-b">
                <td className="p-3 font-semibold">{u.code.code}</td>

                <td className="p-3">{u.code.type === "PERCENT" ? "نسبة %" : "خصم ثابت"}</td>

                <td className="p-3">
                  {u.code.type === "PERCENT"
                    ? `${u.code.value}%`
                    : `${u.code.value} جنيه`
                  }
                </td>

                <td className="p-3">
                  {u.user?.name || "—"}  
                  <br />
                  <span className="text-gray-500 text-xs">{u.user?.email}</span>
                </td>

                <td className="p-3">
                  #{u.orderId}
                  <br />
                  <span className="text-xs text-gray-500">
                    {u.order?.paymentStatus}
                  </span>
                </td>

                <td className="p-3">
                  {new Date(u.createdAt).toLocaleString()}
                </td>

                <td className="p-3">
                  {u.order?.paymentStatus === "PAID" ? 
                    <span className="text-green-600 font-bold">✔ مدفوع</span> :
                    <span className="text-red-600 font-bold">✘ لم يتم</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
