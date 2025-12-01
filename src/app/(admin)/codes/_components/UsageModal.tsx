"use client";

import { useEffect, useState } from "react";

export default function UsageModal({ code, close }) {
  const [list, setList] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetch("/api/codes/usage?code=" + code);
    const data = await res.json();
    setList(data);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-[500px]">
        <h2 className="text-2xl font-bold mb-4">
          سجل استخدام الكود: {code}
        </h2>

        {list.length === 0 ? (
          <p className="text-gray-600">لا يوجد استخدامات لهذا الكود</p>
        ) : (
          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">المستخدم</th>
                <th className="p-2 border">الحجز</th>
                <th className="p-2 border">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {list.map((u, i) => (
                <tr key={i}>
                  <td className="p-2 border">{u.userId}</td>
                  <td className="p-2 border">{u.bookingId}</td>
                  <td className="p-2 border">{u.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <button
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded w-full"
          onClick={close}
        >
          إغلاق
        </button>
      </div>
    </div>
  );
}
