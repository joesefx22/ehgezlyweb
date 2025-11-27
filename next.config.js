/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  // Disable PWA in development for faster rebuilds
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = withPWA({
  // تفعيل الوضع الصارم للمساعدة في اكتشاف المشاكل المحتملة
  reactStrictMode: true,
  // إعدادات App Router
  experimental: {
    serverActions: true,
  },
  // إعدادات اللغات والدعم العربي (إذا لزم الأمر)
  i18n: {
    locales: ['ar', 'en'],
    defaultLocale: 'ar',
  },
});

module.exports = nextConfig;
