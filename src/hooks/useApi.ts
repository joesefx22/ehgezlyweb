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


import { useState, useCallback } from 'react';
import { apiRequest } from '@/lib/api';
import { ApiResponse } from '@/types';

/**
 * خطاف (Hook) مخصص لتبسيط وتنفيذ طلبات الـ API وإدارة حالة التحميل والخطأ.
 * @param initialLoading - الحالة الأولية للتحميل
 */
export function useApi<T>(initialLoading = false) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);

  /**
   * دالة لتنفيذ طلب الـ API
   * @param endpoint - المسار
   * @param method - الطريقة
   * @param body - الجسم
   */
  const execute = useCallback(async (
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
    body?: any,
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiRequest<T>(endpoint, method, body);
      setData(result);
      return result;
    } catch (e) {
      const err = e as Error;
      setError(err.message);
      setData(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error, execute, setData, setError };
}
