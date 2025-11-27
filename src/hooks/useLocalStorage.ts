import { useState, useEffect } from 'react';

/**
 * خطاف (Hook) لإدارة حالة في التخزين المحلي (LocalStorage)
 * @param key - المفتاح في LocalStorage
 * @param initialValue - القيمة الأولية
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading localStorage key “' + key + '”: ', error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error('Error setting localStorage key “' + key + '”: ', error);
    }
  };

  // التأكد من تزامن الحالة عند الاستدعاء الأولي
  useEffect(() => {
    // هذه الدالة للتأكد من أن القيمة في الـ state هي نفسها في الـ localStorage بعد التهيئة
    const item = window.localStorage.getItem(key);
    if (item) {
        setStoredValue(JSON.parse(item));
    }
  }, [key]);

  return [storedValue, setValue] as const;
}
