"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

export default function StadiumBookings() {
  const { id } = useParams(); // stadium ID
  const { toast } = useToast();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      const res = await axios.get(`/api/stadium/${id}/bookings`);
      setBookings(res.data);
    } catch {
      toast({ title: "Error", description: "Failed to load bookings", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function approveBooking(bookingId) {
    try {
      await axios.put(`/api/stadium/${id}/bookings/${bookingId}`, {
        status: "approved",
      });

      toast({ title: "Success", description: "Booking approved" });
      fetchBookings();
    } catch {
      toast({ title: "Error", description: "Action failed", variant: "destructive" });
    }
  }

  async function rejectBooking(bookingId) {
    try {
      await axios.put(`/api/stadium/${id}/bookings/${bookingId}`, {
        status: "rejected",
      });

      toast({ title: "Rejected", description: "Booking rejected" });
      fetchBookings();
    } catch {
      toast({ title: "Error", description: "Action failed", variant: "destructive" });
    }
  }

  async function deleteBooking(bookingId) {
    try {
      await axios.delete(`/api/stadium/${id}/bookings/${bookingId}`);

      toast({ title: "Deleted", description: "Booking cancelled" });
      fetchBookings();
    } catch {
      toast({ title: "Error", description: "Delete failed", variant: "destructive" });
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">إدارة الحجوزات</h1>

      {loading && <p>جاري التحميل...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bookings.map((b) => (
          <Card key={b.id}>
            <CardHeader>
              <CardTitle>
                اللاعب: {b.user.name}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p>📞 رقم اللاعب: {b.user.phone}</p>
              <p>🏟 الموعد: {b.slot.startTime} - {b.slot.endTime}</p>
              <p>💲 السعر: {b.slot.price} جنيه</p>
              <p>📅 التاريخ: {b.date}</p>

              <div className="flex items-center gap-2 mt-3">
                <Badge variant={b.status === "pending" ? "outline" : b.status === "approved" ? "default" : "destructive"}>
                  {b.status}
                </Badge>

                <Badge variant={b.paid ? "default" : "outline"}>
                  {b.paid ? "مدفوع" : "غير مدفوع"}
                </Badge>
              </div>

              {b.status === "pending" && (
                <div className="flex gap-3 mt-4">
                  <Button onClick={() => approveBooking(b.id)} className="w-full">
                    موافقة
                  </Button>

                  <Button onClick={() => rejectBooking(b.id)} variant="destructive" className="w-full">
                    رفض
                  </Button>
                </div>
              )}

              <Button
                className="mt-4 w-full"
                variant="secondary"
                onClick={() => deleteBooking(b.id)}
              >
                حذف الحجز
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
