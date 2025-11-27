// src/components/admin/UserEditModal.tsx
'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/fetcher';


export default function UserEditModal({ user, onClose, onSaved }: any) {
const [role, setRole] = useState(user.role);
const [assigned, setAssigned] = useState<string[]>([]);
const [allStadiums, setAllStadiums] = useState<any[]>([]);
const [saving, setSaving] = useState(false);
const [error, setError] = useState<string | null>(null);


useEffect(() => {
setRole(user.role);
// load assignments
apiFetch(`/api/admin/users/${user.id}`)
.then(res => {
setAssigned(res.assigned_stadiums || []);
}).catch(()=>{});


// load all stadiums for selector
apiFetch('/api/admin/stadiums').then(res => setAllStadiums(res.stadiums || [])).catch(()=>{});
}, [user]);


async function save() {
setSaving(true); setError(null);
try {
const payload = { role, assigned_stadiums: assigned };
const res = await apiFetch(`/api/admin/users/${user.id}`, { method: 'PUT', body: JSON.stringify(payload) });
onSaved(res.user);
} catch (e: any) {
setError(e.message || 'خطأ');
} finally { setSaving(false); }
}


function toggleAssign(id: string) {
setAssigned(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
}


return (
<div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
<div className="bg-white w-full max-w-2xl p-6 rounded shadow">
<h3 className="text-lg font-semibold mb-4">تعديل المستخدم: {user.name}</h3>


<div className="mb-4">
<label className="block text-sm mb-1">الدور</label>
<select value={role} onChange={(e) => setRole(e.target.value)} className="border p-2 rounded w-full">
<option value="player">Player</option>
<option value="staff">Staff</option>
<option value="owner">Owner</option>
<option value="manager">Manager</option>
<option value="admin">Admin</option>
</select>
</div>

