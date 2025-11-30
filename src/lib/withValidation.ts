// src/lib/withValidation.ts
import { z } from "zod";

export async function withValidation(req: Request, schema: z.ZodTypeAny) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const err = parsed.error.flatten();
    throw { status: 400, issues: err };
  }
  return parsed.data;
}
