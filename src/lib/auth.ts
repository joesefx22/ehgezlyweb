// src/lib/auth.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/nextauth"; // لو تستخدم next-auth - ضع إعداداتك هنا

// fallback: دالة افتراضية ترجع null لو مش معرف
export async function authUser(req?: Request) {
  try {
    // Next.js App Router server route: not having req object, so use getServerSession wrapper
    // تعديل حسب تنفيذك الفعلي. لو أنت تضع token في cookies أو header فاقرأها هنا.
    const session = await getServerSession(authOptions as any);
    if (!session || !session.user) return null;
    return {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
    };
  } catch (err) {
    return null;
  }
}
