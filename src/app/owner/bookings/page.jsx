"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

export default function OwnerBookings() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      const res = await axios.get("/api/owner/bookings");
      setBookings(res.data);
    } catch {
      toast({ title: "خطأ", description: "تعذّر تحميل الحجوزات", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status) {
    try {
      await axios.put(`/api/bookings/${id}/status`, { status });
      toast({ title: "تم التحديث", description: "تم تحديث حالة الحجز" });
      loadBookings();
    } catch {
      toast({ title: "خطأ", description: "تعذّر تحديث الحالة", variant: "destructive" });
    }
  }

  const statusColors = {
    pending: "bg-yellow-500",
    approved: "bg-green-600",
    rejected: "bg-red-600",
    completed: "bg-blue-600",
  };

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">إدارة الحجوزات</h1>

      {loading && <p>جاري التحميل...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {bookings.map((b) => (
          <Card key={b.id}>
            <CardHeader>
              <CardTitle className="flex justify-between">
                <span>حجز رقم #{b.id}</span>
                <Badge className={statusColors[b.status]}>
                  {b.status}
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent>

              <p><strong>👤 اللاعب:</strong> {b.user.name}</p>
              <p><strong>📞 الهاتف:</strong> {b.user.phone}</p>

              <p className="mt-3">
                <strong>🏟 الملعب:</strong> {b.stadium.name}
              </p>

              <p>
                <strong>⏰ الموعد:</strong> {b.slot.startTime} - {b.slot.endTime}
              </p>

              <p>
                <strong>💲 السعر:</strong> {b.slot.price} EGP
              </p>

              <p className="mt-3">
                <strong>💳 الدفع:</strong> {b.paymentStatus}
              </p>

              <p>
                <strong>📅 تاريخ الحجز:</strong> {new Date(b.createdAt).toLocaleString()}
              </p>

              {/* أزرار التحكم */}
              <div className="flex gap-2 mt-4">
                {b.status === "pending" && (
                  <>
                    <Button onClick={() => updateStatus(b.id, "approved")} className="bg-green-600">
                      قبول
                    </Button>
                    <Button onClick={() => updateStatus(b.id, "rejected")} variant="destructive">
                      رفض
                    </Button>
                  </>
                )}

                {b.status === "approved" && (
                  <Button onClick={() => updateStatus(b.id, "completed")} className="bg-blue-600">
                    إنهاء الحجز
                  </Button>
                )}
              </div>

            </CardContent>
          </Card>
        ))}

      </div>

    </div>
  );
}
