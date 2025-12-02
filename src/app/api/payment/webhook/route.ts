import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const raw = await req.text();
    const data = JSON.parse(raw);

    // -------- 1) VERIFY HMAC SIGNATURE ----------
    const hmac = data.hmac;
    const secret = process.env.PAYMOB_HMAC || "";

    const sorted = [
      data.obj.id,
      data.obj.amount_cents,
      data.obj.created_at,
      data.obj.currency,
      data.obj.error_occured,
      data.obj.has_parent_transaction,
      data.obj.integration_id,
      data.obj.is_3d_secure,
      data.obj.is_auth,
      data.obj.is_capture,
      data.obj.is_refunded,
      data.obj.is_standalone_payment,
      data.obj.is_voided,
      data.obj.order.id,
      data.obj.owner,
      data.obj.pending,
      data.obj.source_data.pan,
      data.obj.source_data.sub_type,
      data.obj.source_data.type,
      data.obj.success
    ].join("");

    const hashed = crypto
      .createHmac("sha512", secret)
      .update(sorted)
      .digest("hex");

    if (hashed !== hmac) {
      return NextResponse.json({ error: "Invalid HMAC" }, { status: 400 });
    }

    // -------- 2) SUCCESS CHECK ----------
    if (!data.obj.success) {
      return NextResponse.json({ status: "IGNORED_NOT_SUCCESS" });
    }

    const paymobOrderId = data.obj.order.id;

    // -------- 3) FETCH OUR ORDER ----------
    const order = await prisma.order.findFirst({
      where: { paymobOrderId },
    });

    if (!order) {
      return NextResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });
    }

    // -------- 4) IDEMPOTENCY: prevent duplicate process ----------
    if (order.paymentStatus === "PAID") {
      return NextResponse.json({ status: "ALREADY_PROCESSED" });
    }

    // -------- 5) Mark as PAID ----------
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: "PAID" },
    });

    // -------- 6) HANDLE CODE USAGE ----------
    if (order.discountCodeId) {
      await prisma.codeUsage.upsert({
        where: {
          uniqueOrderCode: {
            orderId: order.id,
            codeId: order.discountCodeId
          }
        },
        update: {}, 
        create: {
          orderId: order.id,
          codeId: order.discountCodeId,
          userId: order.userId
        }
      });

      // reduce limit if usageLimit = 1
      await prisma.discountCode.update({
        where: { id: order.discountCodeId },
        data: {
          usedCount: { increment: 1 }
        }
      });
    }

    return NextResponse.json({ status: "PROCESSED_SUCCESS" });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
