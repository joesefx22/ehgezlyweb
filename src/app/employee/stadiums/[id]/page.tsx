"use client";

import { useEffect, useState } from "react";

export default function StadiumPage({ params }) {
  const { id } = params;

  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/employee/stadiums/${id}`)
      .then(r => r.json())
      .then(d => setData(d));
  }, [id]);

  if (!data) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">{data.stadium.name}</h1>
      <p>{data.stadium.location}</p>

      <h2 className="mt-6 mb-2 text-lg">آخر الحجوزات</h2>

      {data.bookings?.map((b: any) => (
        <div key={b.id} className="border p-3 mb-2 rounded">
          <strong>{b.date}</strong> — {b.start_time} إلى {b.end_time}
        </div>
      ))}
    </div>
  );
}
