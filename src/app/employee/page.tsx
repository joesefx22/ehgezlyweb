"use client";

import { useEffect, useState } from "react";

export default function EmployeeDashboard() {
  const [stadiums, setStadiums] = useState([]);

  useEffect(() => {
    fetch("/api/employee/stadiums")
      .then(r => r.json())
      .then(d => setStadiums(d.stadiums));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">ملاعبك</h1>

      {stadiums.map((s: any) => (
        <a
          key={s.id}
          href={`/employee/stadiums/${s.id}`}
          className="block p-4 bg-gray-100 rounded mb-2"
        >
          {s.name}
        </a>
      ))}
    </div>
  );
}
