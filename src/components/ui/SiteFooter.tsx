// src/components/ui/SiteFooter.tsx
import React from "react";

export default function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-white/6">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between text-zinc-400">
        <div>© {new Date().getFullYear()} Ehgezly — كل الحقوق محفوظة</div>
        <div className="flex items-center gap-4 mt-3 md:mt-0">
          <a href="#" className="hover:text-white">شروط الاستخدام</a>
          <a href="#" className="hover:text-white">الخصوصية</a>
        </div>
      </div>
    </footer>
  );
}
