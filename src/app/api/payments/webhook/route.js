import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export async function POST(req) {
  const body = await req.json();
  const hmac = req.headers.get("hmac");

  const ordered = [
    body.amount_cents,
    body.created_at,
    body.currency,
    body.error_occured,
    body.has_parent_transaction,
    body.id,
    body.integration_id,
    body.is_3d_secure,
    body.is_auth,
    body.is_capture,
    body.is_refunded,
    body.is_standalone_payment,
    body.is_voided,
    body.order.id,
    body.owner,
    body.pending,
    body.source_data.pan,
    body.source_data.sub_type,
    body.source_data.type,
    body.success
  ].join("");

  const hash = crypto
    .createHmac("sha512", process.env.PAYMOB_HMAC_SECRET)
    .update(ordered)
    .digest("hex");

  if (hash !== hmac) {
    return NextResponse.json({ error: "Invalid HMAC" }, { status: 400 });
  }

  if (body.success === true) {
    await prisma.booking.update({
      where: { id: body.order.id },
      data: { status: "PAID" }
    });
  }

  return NextResponse.json({ status: "ok" });
}
