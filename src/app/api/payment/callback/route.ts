import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const success = url.searchParams.get("success");
  const orderId = url.searchParams.get("order_id");

  if (!orderId) return NextResponse.redirect("/payment/failed");

  await prisma.order.update({
    where: { id: Number(orderId) },
    data: { status: success === "true" ? "PAID" : "FAILED" },
  });

  return NextResponse.redirect(
    success === "true" ? "/payment/success" : "/payment/failed"
  );
}
