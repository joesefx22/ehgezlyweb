await sendMail(order.user.email, "🎉 تم تأكيد الدفع", `
  <h2>تم الدفع بنجاح</h2>
  <p>رقم الطلب: ${order.id}</p>
`);


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
import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { logError } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const raw = await req.text();
    const body = JSON.parse(raw);

    // verify HMAC if present:
    const receivedHmac = body.hmac;
    if (process.env.PAYMOB_HMAC_SECRET) {
      const secret = process.env.PAYMOB_HMAC_SECRET;
      // build canonical string as Paymob expects (already discussed earlier)
      const canon = [
        body.obj.amount_cents,
        body.obj.created_at,
        body.obj.currency,
        body.obj.error_occured,
        body.obj.has_parent_transaction,
        body.obj.id,
        body.obj.integration_id,
        body.obj.is_3d_secure,
        body.obj.is_auth,
        body.obj.is_capture,
        body.obj.is_refunded,
        body.obj.is_standalone_payment,
        body.obj.is_voided,
        body.obj.order?.id ?? "",
        body.obj.owner ?? "",
        body.obj.pending ?? "",
        body.obj.source_data?.pan ?? "",
        body.obj.source_data?.sub_type ?? "",
        body.obj.source_data?.type ?? "",
        body.obj.success ?? ""
      ].join("");
      const h = crypto.createHmac("sha512", secret).update(canon).digest("hex");
      if (h !== receivedHmac) return NextResponse.json({ error: "invalid_hmac" }, { status: 400 });
    }

    const success = !!body.obj.success;
    const paymobOrderId = body.obj.order?.id;
    const providerTxId = body.obj.id;

    if (!paymobOrderId) return NextResponse.json({ error: "no_order" }, { status: 400 });

    // Idempotency: ensure PaymentTransaction doesn't exist
    const existingTx = await prisma.paymentTransaction.findUnique({ where: { providerTxId } });
    if (existingTx) {
      return NextResponse.json({ status: "already_processed" });
    }

    // find our order by paymobOrderId (we saved it earlier)
    const order = await prisma.order.findFirst({ where: { paymobOrderId: String(paymobOrderId) }});
    if (!order) {
      // create paymentTransaction record anyway for tracing
      await prisma.paymentTransaction.create({
        data: { orderId: -1, provider: "paymob", providerTxId, status: success ? "SUCCESS" : "FAILED", payload: body }
      });
      return NextResponse.json({ status: "order_missing" }, { status: 404 });
    }

    // create transaction record and update order in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.paymentTransaction.create({
        data: {
          orderId: order.id,
          provider: "paymob",
          providerTxId,
          status: success ? "SUCCESS" : "FAILED",
          payload: body
        }
      });

      if (success) {
        await tx.order.update({
          where: { id: order.id },
          data: { status: "PAID", paymentTxId: providerTxId }
        });

        // If order has codeAppliedId => insert usage (upsert unique constraint prevents double)
        if (order.codeAppliedId) {
          await tx.codeUsage.upsert({
            where: { codeId_orderId: { codeId: order.codeAppliedId, orderId: order.id } },
            create: { codeId: order.codeAppliedId, orderId: order.id, userId: order.userId ?? null },
            update: {}
          });
          // increment usedCount atomically
          await tx.code.update({
            where: { id: order.codeAppliedId },
            data: { usedCount: { increment: 1 } }
          });
        }
      } else {
        await tx.order.update({ where: { id: order.id }, data: { status: "FAILED" }});
      }
    });

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    logError("webhook", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
