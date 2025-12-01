"use client";
import React, { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/toast";

export default function OwnerProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const toast = useToast();

  async function load() {
    const res = await fetch("/api/owner/profile");
    const j = await res.json();
    if (res.ok && j.ok) { setProfile(j.data); setForm(j.data); }
    else toast.show(j.error || "خطأ");
  }

  useEffect(()=>{ load(); }, []);

  async function save() {
    const res = await fetch("/api/owner/profile", { method: "PUT", headers: { "content-type":"application/json" }, body: JSON.stringify(form) });
    const j = await res.json();
    if (res.ok && j.ok) { toast.show("تم الحفظ","success"); setProfile(j.data); }
    else toast.show(j.error || "خطأ","error");
  }

  async function changePassword(oldP:string, newP:string) {
    const res = await fetch("/api/owner/profile", { method: "POST", headers: { "content-type":"application/json" }, body: JSON.stringify({ oldPassword: oldP, newPassword: newP }) });
    const j = await res.json();
    if (res.ok && j.ok) toast.show("تم تغيير كلمة المرور","success");
    else toast.show(j.error || "خطأ","error");
  }

  if (!profile) return <div className="p-6">جاري التحميل...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">حسابي — الإعدادات</h1>

      <Card className="p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input value={form.name || ""} onChange={e=>setForm({...form, name: e.target.value})} className="input-lux" placeholder="الاسم" />
          <input value={form.email || ""} onChange={e=>setForm({...form, email: e.target.value})} className="input-lux" placeholder="البريد" />
          <input value={form.phone || ""} onChange={e=>setForm({...form, phone: e.target.value})} className="input-lux" placeholder="الهاتف" />
          <input value={form.avatar || ""} onChange={e=>setForm({...form, avatar: e.target.value})} className="input-lux" placeholder="رابط الصورة" />
        </div>

        <div className="flex gap-3 justify-end mt-4">
          <Button onClick={save}>حفظ</Button>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="text-lg mb-3">تغيير كلمة المرور</h2>
        <ChangePasswordForm onChange={(oldP,newP)=>changePassword(oldP,newP)} />
      </Card>
    </div>
  );
}

function ChangePasswordForm({ onChange }: { onChange: (oldP:string,newP:string)=>void }) {
  const [oldP, setOldP] = useState("");
  const [newP, setNewP] = useState("");
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
      <input type="password" value={oldP} onChange={e=>setOldP(e.target.value)} placeholder="كلمة المرور الحالية" className="input-lux" />
      <input type="password" value={newP} onChange={e=>setNewP(e.target.value)} placeholder="كلمة المرور الجديدة" className="input-lux" />
      <Button onClick={()=>onChange(oldP,newP)}>تغيير</Button>
    </div>
  );
}
