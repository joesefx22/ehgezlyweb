export function logError(tag: string, err: any) {
  try {
    console.error(`[${tag}]`, err && err.stack ? err.stack : err);
  } catch {}
}
