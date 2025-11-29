// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/hooks/useAuth';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'احجزلي - نظام حجز الملاعب',
  description: 'منصة متكاملة لحجز الملاعب الرياضية',
  manifest: '/manifest.json',
  themeColor: '#3B82F6',
  viewport: 'minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

import './globals.css';
import { Cairo } from 'next/font/google';
import { ReactNode } from 'react';

// تهيئة خط القاهرة
const cairo = Cairo({ 
  subsets: ['arabic'], 
  variable: '--font-cairo' 
});

interface RootLayoutProps {
  children: ReactNode;
}

/**
 * الجذر الرئيسي لتطبيق Next.js
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable}`}>
      <head>
        <title>احجزلي - حجز ملاعب كرة القدم</title>
        <meta name="description" content="منصة حجز ملاعب كرة القدم بسهولة ويسر في المنطقة العربية." />
        <meta name="theme-color" content="#1a7f46" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="font-cairo bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}

// src/app/layout.tsx
import "./styles/globals.css";
import React from "react";
import { Inter } from "next/font/google";
import SiteHeader from "@/components/ui/SiteHeader";
import SiteFooter from "@/components/ui/SiteFooter";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "Ehgezly — احجزلي",
  description: "منصة حجز ملاعب وماتشات بتجربة فاخره"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" className={`${inter.variable} scroll-smooth`}>
      <body>
        <div className="min-h-screen flex flex-col">
          <SiteHeader />
          <main className="flex-1 w-full">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
