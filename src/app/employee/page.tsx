// src/app/employee/page.tsx
'use client';
import Link from 'next/link';
import { useApi } from '@/hooks/useApi';


export default function EmployeePage() {
const { data, loading, error } = useApi<{ stadiums: any[] }>('/api/employee/stadiums', []);


if (loading) return <div className="p-6">جارٍ التحميل...</div>;
if (error) return <div className="p-6 text-red-500">خطأ: {error.message}</div>;


const stadiums = data?.stadiums || [];


return (
<div className="p-6">
<h1 className="text-2xl font-semibold mb-4">لوحة الموظف</h1>


{stadiums.length === 0 && (
<div className="text-gray-600">ليس لديك ملاعب مخصصة بعد.</div>
)}


<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-4">
{stadiums.map((s: any) => (
<Link key={s.id} href={`/employee/stadiums/${s.id}`} className="block">
<div className="p-4 bg-white rounded-lg shadow hover:shadow-md transition">
<h3 className="font-bold">{s.name}</h3>
<p className="text-sm text-gray-500">{s.location}</p>
<div className="mt-2 text-xs text-gray-400">{s.type} • {s.is_active ? 'نشط' : 'غير نشط'}</div>
</div>
</Link>
))}
</div>
</div>
);
}
