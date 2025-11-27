// src/lib/fetcher.ts
export async function apiFetch<T = any>(input: RequestInfo, init?: RequestInit): Promise<T> {
const res = await fetch(input, {
credentials: 'include',
headers: { 'Content-Type': 'application/json' },
...init,
});


const text = await res.text();
const data = text ? JSON.parse(text) : null;


if (!res.ok) {
const err = new Error(data?.error || res.statusText || 'Request failed');
(err as any).status = res.status;
(err as any).data = data;
throw err;
}


return data;
}
