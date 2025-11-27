// src/hooks/useApi.ts
'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/fetcher';


export function useApi<T = any>(url: string, deps: any[] = []) {
const [data, setData] = useState<T | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<any>(null);


useEffect(() => {
let mounted = true;
setLoading(true);
setError(null);


apiFetch(url)
.then((d) => { if (mounted) setData(d); })
.catch((e) => { if (mounted) setError(e); })
.finally(() => { if (mounted) setLoading(false); });


return () => { mounted = false; };
// eslint-disable-next-line react-hooks/exhaustive-deps
}, deps);


return { data, loading, error };
}
