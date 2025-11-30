"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";

export default function SingleStadiumPage() {
  const { id } = useParams();
  const { toast } = useToast();

  const [stadium, setStadium] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    price: "",
    location: "",
    size: "",
    active: true,
  });

  useEffect(() => {
    fetchStadium();
  }, []);

  async function fetchStadium() {
    try {
      const res = await axios.get(`/api/stadium/${id}`);
      setStadium(res.data);

      // Fill form
      setForm({
        name: res.data.name,
        price: res.data.price,
        location: res.data.location,
        size: res.data.size,
        active: res.data.active,
      });

    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load stadium data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function updateStadium() {
    try {
      await axios.put(`/api/stadium/${id}`, form);

      toast({
        title: "Success",
        description: "Stadium updated successfully",
      });

      fetchStadium();
    } catch (err) {
      toast({
        title: "Error",
        description: "Update failed",
        variant: "destructive",
      });
    }
  }

  async function deleteStadium() {
    if (!confirm("هل أنت متأكد أنك تريد حذف هذا الملعب؟")) return;

    try {
      await axios.delete(`/api/stadium/${id}`);

      toast({ title: "Deleted", description: "Stadium deleted successfully" });

      window.location.href = "/owner";
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete stadium",
        variant: "destructive",
      });
    }
  }

  if (loading) return <p className="p-6">جاري التحميل...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">إدارة الملعب: {stadium.name}</h1>

      {/* تعديل بيانات الملعب */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>تعديل بيانات الملعب</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <Input
            placeholder="اسم الملعب"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <Input
            placeholder="السعر"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />

          <Input
            placeholder="الموقع"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />

          <Input
            placeholder="المساحة"
            value={form.size}
            onChange={(e) => setForm({ ...form, size: e.target.value })}
          />

          <div className="flex items-center gap-3">
            <span>تفعيل الملعب</span>
            <Switch
              checked={form.active}
              onCheckedChange={(v) => setForm({ ...form, active: v })}
            />
          </div>

          <Button onClick={updateStadium}>حفظ التعديلات</Button>
        </CardContent>
      </Card>

      {/* صور الملعب */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>صور الملعب</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stadium.images?.map((img) => (
              <div key={img.id} className="relative h-32 bg-gray-200 rounded-lg overflow-hidden">
                <Image src={img.url} fill alt="stadium" className="object-cover" />
              </div>
            ))}
          </div>

          <Button className="mt-4">رفع صور جديدة</Button>
        </CardContent>
      </Card>

      {/* إدارة المواعيد */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>مواعيد الملعب</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => alert("فتح إدارة المواعيد")}>
            إدارة المواعيد
          </Button>
        </CardContent>
      </Card>

      {/* حذف */}
      <Button variant="destructive" onClick={deleteStadium}>
        حذف الملعب نهائيًا
      </Button>
    </div>
  );
}
