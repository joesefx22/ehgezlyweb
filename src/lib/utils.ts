import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * دمج أسماء فئات Tailwind CSS بشكل ذكي
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * تحويل وقت "HH:MM" إلى عرض محلي (مثال: 14:00 -> 2:00 م)
 */
export function formatTimeDisplay(time: string): string {
  try {
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    
    if (isNaN(hour) || isNaN(parseInt(m))) {
        return time; // في حالة وجود خطأ في التنسيق
    }

    const date = new Date();
    date.setHours(hour, parseInt(m), 0, 0);

    return date.toLocaleTimeString('ar-EG', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch (e) {
    return time;
  }
}

/**
 * تحويل تاريخ "YYYY-MM-DD" إلى عرض محلي
 */
export function formatDateDisplay(dateStr: string): string {
    try {
        const date = new Date(dateStr + 'T00:00:00'); // إضافة T00:00:00 لتجنب مشاكل المنطقة الزمنية
        return date.toLocaleDateString('ar-EG', {
            weekday: 'long', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    } catch (e) {
        return dateStr;
    }
}
