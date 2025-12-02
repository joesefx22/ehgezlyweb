// src/lib/payments/validateCode.ts
import prisma from "@/lib/prisma";

type ValidateInput = { code: string, userId?: string | null, price: number };

export async function validateCode({ code, userId, price }: ValidateInput) {
  if (!code) return { valid: false, message: "no_code" };

  const found = await prisma.code.findUnique({ where: { code } });
  if (!found || !found.isActive) return { valid: false, message: "INVALID_CODE" };

  if (found.expiresAt && found.expiresAt < new Date()) return { valid: false, message: "EXPIRED" };

  if (found.maxUsage && found.usedCount >= found.maxUsage) return { valid: false, message: "USAGE_LIMIT" };

  if (found.ownerId && userId && found.ownerId !== userId) return { valid: false, message: "NOT_ALLOWED" };

  // compute finalPrice depending on type
  let finalPrice = price;
  if (found.type === "DISCOUNT") {
    if (found.percent) finalPrice = Math.round((price * (100 - found.percent)) / 100);
    else if (found.amount) finalPrice = Math.max(0, price - found.amount);
  } else if (found.type === "COMPENSATION") {
    // compensation reduces price by amount (could be full)
    finalPrice = Math.max(0, price - (found.amount || 0));
  } else if (found.type === "PAYMENT") {
    finalPrice = 0;
  }

  return { valid: true, finalPrice, code: found };
}
