import { NextResponse } from "next/server";
import axios from "axios";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { bookingId } = await req.json();

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { playground: true, user: true }
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status === "PAID") {
      return NextResponse.json({ error: "Booking already paid" });
    }

    // 1) AUTH TOKEN
    const authRes = await axios.post(
      "https://accept.paymob.com/api/auth/tokens",
      { api_key: process.env.PAYMOB_API_KEY }
    );

    const token = authRes.data.token;

    // 2) ORDER REGISTRATION
    const orderRes = await axios.post(
      "https://accept.paymob.com/api/ecommerce/orders",
      {
        auth_token: token,
        delivery_needed: false,
        amount_cents: booking.totalPrice * 100,
        currency: "EGP",
        items: []
      }
    );

    const orderId = orderRes.data.id;

    // 3) PAYMENT KEY
    const paymentKeyRes = await axios.post(
      "https://accept.paymob.com/api/acceptance/payment_keys",
      {
        auth_token: token,
        amount_cents: booking.totalPrice * 100,
        expiration: 3600,
        order_id: orderId,
        billing_data: {
          apartment: "NA",
          email: booking.user.email,
          floor: "NA",
          first_name: booking.user.name || "User",
          last_name: "NA",
          phone_number: booking.user.phone || "NA",
          city: "NA",
          country: "EG",
          street: "NA"
        },
        currency: "EGP",
        integration_id: process.env.PAYMOB_CARD_INTEGRATION_ID,
      }
    );

    const paymentKey = paymentKeyRes.data.token;

    return NextResponse.json({
      iframe_url: `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`
    });

  } catch (e) {
    console.log(e);
    return NextResponse.json({ error: "Payment failed" }, { status: 500 });
  }
}
