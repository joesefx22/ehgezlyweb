"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export default function StadiumSlots() {
  const { id } = useParams(); // stadium id
  const { toast } = useToast();

  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    startTime: "",
    endTime: "",
    price: "",
    days: [], // ["Saturday", "Sunday", ...]
  });

  const weekDays = [
    "Saturday", "Sunday", "Monday", "Tuesday",
    "Wednesday", "Thursday", "Friday"
  ];

  useEffect(() => {
    fetchSlots();
  }, []);

  async function fetchSlots() {
    try {
      const res = await axios.get(`/api/stadium/${id}/slots`);
      setSlots(res.data);
    } catch {
      toast({ title: "Error", description: "Failed to load slots", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function addSlot() {
    try {
      await axios.post(`/api/stadium/${id}/slots`, form);
      toast({ title: "Success", description: "Slot added successfully" });
      setForm({ startTime: "", endTime: "", price: "", days: [] });
      fetchSlots();
    } catch {
      toast({ title: "Error", description: "Failed to add slot", variant: "destructive" });
    }
  }

  async function deleteSlot(slotId) {
    try {
      await axios.delete(`/api/stadium/${id}/slots/${slotId}`);
      toast({ title: "Deleted", description: "Slot deleted" });
      fetchSlots();
    } catch {
      toast({ title: "Error", description: "Delete failed", variant: "destructive" });
    }
  }

  function toggleDay(day) {
    const selected = form.days.includes(day)
      ? form.days.filter((d) => d !== day)
      : [...form.days, day];

    setForm({ ...form, days: selected });
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">إدارة مواعيد الملعب</h1>

      {/* إضافة موعد */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>إضافة موعد</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <Input
            type="time"
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            placeholder="بداية الوقت"
          />

          <Input
            type="time"
            value={form.endTime}
            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            placeholder="نهاية الوقت"
          />

          <Input
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="السعر"
          />

          <div className="col-span-2 flex flex-wrap gap-4">
            {weekDays.map((day) => (
              <label key={day} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={form.days.includes(day)}
                  onCheckedChange={() => toggleDay(day)}
                />
                {day}
              </label>
            ))}
          </div>

          <Button className="col-span-2" onClick={addSlot}>
            إضافة الموعد
          </Button>
        </CardContent>
      </Card>

      {/* عرض المواعيد */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {slots.map((slot) => (
          <Card key={slot.id}>
            <CardHeader>
              <CardTitle>{slot.startTime} - {slot.endTime}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>💲 السعر: {slot.price}</p>
              <p>🗓 الأيام: {slot.days.join(", ")}</p>

              <Button
                variant="destructive"
                className="mt-4"
                onClick={() => deleteSlot(slot.id)}
              >
                حذف
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading && <p className="mt-4">جاري التحميل...</p>}
    </div>
  );
}
