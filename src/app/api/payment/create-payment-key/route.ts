// after const paymobOrderId = orderRes.data.id;
await prisma.order.update({ where: { id: order.id }, data: { paymobOrderId: String(paymobOrderId) }});


// src/app/api/payment/create-payment-key/route.ts
import { NextResponse } from "next/server";
import axios from "axios";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();
    if (!orderId) return NextResponse.json({ error: "orderId_required" }, { status: 400 });

    const order = await prisma.order.findUnique({ where: { id: Number(orderId) } });
    if (!order) return NextResponse.json({ error: "order_not_found" }, { status: 404 });

    // Paymob auth
    const authRes = await axios.post("https://accept.paymob.com/api/auth/tokens", { api_key: process.env.PAYMOB_API_KEY });
    const authToken = authRes.data.token;

    // register order in Paymob ecommerce/orders (merchant_order_id optional; we'll keep mapping via our orderId)
    const orderRes = await axios.post("https://accept.paymob.com/api/ecommerce/orders", {
      auth_token: authToken,
      delivery_needed: false,
      amount_cents: Math.round(order.finalPrice * 100),
      currency: "EGP",
      merchant_order_id: String(order.id),
      items: []
    });

    const paymobOrderId = orderRes.data.id;

    // payment key
    const paymentKeyRes = await axios.post("https://accept.paymob.com/api/acceptance/payment_keys", {
      auth_token: authToken,
      amount_cents: Math.round(order.finalPrice * 100),
      expiration: 3600,
      order_id: paymobOrderId,
      billing_data: {
        first_name: "User",
        last_name: "",
        email: "no-reply@yourapp.com",
        phone_number: "0000000000",
        city: "Cairo",
        country: "EG"
      },
      currency: "EGP",
      integration_id: Number(process.env.PAYMOB_CARD_ID)
    });

    const paymentToken = paymentKeyRes.data.token;
    const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentToken}`;

    // return iframe
    return NextResponse.json({ ok: true, data: { iframeUrl, paymentToken, paymobOrderId } });
  } catch (err) {
    console.error("create-payment-key err:", err?.response?.data || err);
    return NextResponse.json({ ok: false, error: "payment_key_failed" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import axios from "axios";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 1) auth
    const auth = await axios.post(
      "https://accept.paymob.com/api/auth/tokens",
      { api_key: process.env.PAYMOB_API_KEY }
    );

    // 2) register order at Paymob
    const paymobOrder = await axios.post(
      "https://accept.paymob.com/api/ecommerce/orders",
      {
        auth_token: auth.data.token,
        delivery_needed: false,
        amount_cents: order.finalPrice * 100,
        currency: "EGP",
        items: [],
      }
    );

    // 3) payment key
    const payment = await axios.post(
      "https://accept.paymob.com/api/acceptance/payment_keys",
      {
        auth_token: auth.data.token,
        amount_cents: order.finalPrice * 100,
        expiration: 3600,
        order_id: paymobOrder.data.id,
        billing_data: {
          first_name: "User",
          last_name: "Checkout",
          email: "test@test.com",
          phone_number: "01000000000",
          country: "EG",
          city: "cairo",
          street: "N/A",
        },
        currency: "EGP",
        integration_id: Number(process.env.PAYMOB_CARD_ID),
      }
    );

    return NextResponse.json({
      paymentKey: payment.data.token,
      iframeUrl: `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${payment.data.token}`
    });

  } catch (err) {
    return NextResponse.json({ error: "PAYMENT_FAILED" }, { status: 500 });
  }
}
