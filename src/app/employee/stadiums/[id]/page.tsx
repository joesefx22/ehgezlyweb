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


apiFetch(`/api/employee/stadiums/${id}`)
.then((res) => {
if (!mounted) return;
setStadium(res.stadium);
setBookings(res.bookings || []);
setBlocked(res.blocked || []);
})
.catch((e) => setError(e.message || 'حدث خطأ'))
.finally(() => { if (mounted) setLoading(false); });


return () => { mounted = false; };
}, [id]);


if (loading) return <div className="p-6">جارٍ التحميل...</div>;
if (error) return <div className="p-6 text-red-500">خطأ: {error}</div>;
if (!stadium) return <div className="p-6">الملعب غير موجود</div>;


return (
<div className="p-6">
<button className="mb-4 text-sm text-blue-600" onClick={() => router.back()}>◀ عودة</button>


<div className="bg-white p-6 rounded-lg shadow">
<h1 className="text-2xl font-bold">{stadium.name}</h1>
<p className="text-sm text-gray-600">{stadium.location}</p>


<div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
<div className="p-3 border rounded">الحالة: {stadium.status}</div>
<div className="p-3 border rounded">السعر بالساعة: {stadium.price_per_hour}</div>
<div className="p-3 border rounded">الفترات: {stadium.opening_time} - {stadium.closing_time}</div>
</div>


<h2 className="mt-6 text-lg font-semibold">آخر الحجوزات</h2>
{bookings.length === 0 && <div className="text-gray-500">لا توجد حجوزات</div>}
<div className="mt-2 space-y-2">
{bookings.map((b) => (
<div key={b.id} className="p-3 border rounded flex justify-between">
<div>
<div className="font-medium">{b.date}</div>
<div className="text-sm text-gray-500">{b.start_time} — {b.end_time}</div>
</div>
<div className="text-sm text-gray-600">{b.status}</div>
</div>
))}
</div>


<h2 className="mt-6 text-lg font-semibold">الساعات المحظورة</h2>
{blocked.length === 0 && <div className="text-gray-500">لا توجد ساعات محظورة</div>}
<div className="mt-2 space-y-2">
{blocked.map((bs: any) => (
<div key={bs.id} className="p-3 border rounded">
<div className="font-medium">{bs.date}</div>
<div className="text-sm text-gray-500">{bs.start_time} — {bs.end_time}</div>
<div className="text-xs text-gray-400">{bs.reason}</div>
</div>
))}
</div>


</div>
</div>
);
}
