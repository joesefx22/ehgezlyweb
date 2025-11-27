import axios, { AxiosError } from 'axios';
import { ApiResponse } from '@/types';
import { useAuthStore } from '@/store/auth-store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * دالة مساعدة لطلب الـ API مع معالجة الأخطاء والمصادقة
 * @param endpoint - المسار في الـ API (مثل /login أو /stadiums)
 * @param method - طريقة الـ HTTP (GET, POST, PUT, DELETE)
 * @param data - البيانات المرسلة للجسم (في POST/PUT)
 * @returns - وعد (Promise) بالاستجابة
 */
export async function apiRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
  data: any = null,
): Promise<T> {
  const { token, logout } = useAuthStore.getState();
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await axios.request<ApiResponse<T>>({
      url,
      method,
      headers,
      data: method !== 'GET' ? data : undefined,
    });

    if (response.data.success) {
      return response.data.data;
    } else {
      // إرسال رسالة الخطأ من الباك إند
      throw new Error(response.data.message || 'حدث خطأ غير متوقع.');
    }
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    
    // معالجة خطأ المصادقة (401)
    if (axiosError.response?.status === 401) {
      logout();
      // توجيه المستخدم لصفحة تسجيل الدخول
      window.location.href = '/login';
    }

    // إرسال رسالة خطأ أكثر تحديداً
    const errorMessage = axiosError.response?.data?.message || axiosError.message || 'فشل في الاتصال بالخادم.';
    throw new Error(errorMessage);
  }
}
