import { UserRole } from "@/types";
import { useAuthStore } from "@/store/auth-store";

/**
 * دالة مساعدة لتخزين بيانات المصادقة محلياً (Token & User Data)
 * @param token - توكن JWT
 * @param user - بيانات المستخدم
 */
export const setAuthData = (token: string, user: any) => {
    localStorage.setItem('ehgzly_token', token);
    localStorage.setItem('ehgzly_user', JSON.stringify(user));
    useAuthStore.getState().setAuth({ token, user });
};

/**
 * دالة مساعدة لحذف بيانات المصادقة
 */
export const clearAuthData = () => {
    localStorage.removeItem('ehgzly_token');
    localStorage.removeItem('ehgzly_user');
    useAuthStore.getState().logout();
};

/**
 * دالة مساعدة للتحقق من صلاحية المستخدم
 * @param requiredRoles - قائمة الأدوار المسموح لها بالوصول
 * @param userRole - دور المستخدم الحالي
 */
export const hasPermission = (requiredRoles: UserRole[], userRole?: UserRole): boolean => {
    if (!userRole) return false;
    return requiredRoles.includes(userRole);
};

/**
 * دالة مساعدة للتوجيه بناءً على الدور
 * @param role - دور المستخدم
 * @returns مسار التوجيه
 */
export const getDashboardPath = (role: UserRole): string => {
    switch (role) {
        case 'admin':
            return '/admin/dashboard';
        case 'owner':
        case 'manager':
            return '/owner/dashboard';
        case 'player':
        default:
            return '/dashboard';
    }
};

مسار: src/lib/auth.ts (نفس الملف الموجود عندك — سنبدّل أي استيراد مباشر من @prisma/client ليشير إلى @/lib/prisma)

ابحث في src/lib/auth.ts عن أي سطر يشبه:

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


واستبدله بـ:

import prisma from "@/lib/prisma";


إذا الملف يستعمل UserRole من @/types فده تمام؛ مجرد تأكد إن كل الأماكن اللي تُنشئ PrismaClient تم حذفها واستُبدلت بالإستيراد الموحد أعلاه.
