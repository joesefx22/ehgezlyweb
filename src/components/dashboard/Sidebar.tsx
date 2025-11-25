// src/components/dashboard/Sidebar.tsx
'use client';

import { User } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  user: User;
}

export default function DashboardSidebar({ user }: SidebarProps) {
  const { logout } = useAuth();
  const pathname = usePathname();

  const playerMenu = [
    { name: 'الرئيسية', href: '/dashboard', icon: '🏠' },
    { name: 'الحجوزات', href: '/dashboard/bookings', icon: '📅' },
    { name: 'طلبات اللاعبين', href: '/dashboard/player-requests', icon: '👥' },
  ];

  const ownerMenu = [
    { name: 'الرئيسية', href: '/owner/dashboard', icon: '🏠' },
    { name: 'ملاعبى', href: '/owner/stadiums', icon: '⚽' },
    { name: 'الحجوزات', href: '/owner/bookings', icon: '📅' },
    { name: 'التقارير', href: '/owner/reports', icon: '📊' },
  ];

  const adminMenu = [
    { name: 'الرئيسية', href: '/admin/dashboard', icon: '🏠' },
    { name: 'المستخدمين', href: '/admin/users', icon: '👥' },
    { name: 'الملاعب', href: '/admin/stadiums', icon: '⚽' },
    { name: 'الأكواد', href: '/admin/codes', icon: '🎫' },
    { name: 'التقارير', href: '/admin/reports', icon: '📊' },
  ];

  const employeeMenu = [
    { name: 'الرئيسية', href: '/employee/dashboard', icon: '🏠' },
    { name: 'الحجوزات', href: '/employee/bookings', icon: '📅' },
    { name: 'الملاعب', href: '/employee/stadiums', icon: '⚽' },
  ];

  const getMenu = () => {
    switch (user.role) {
      case 'player': return playerMenu;
      case 'owner': return ownerMenu;
      case 'admin': return adminMenu;
      case 'employee': return employeeMenu;
      default: return playerMenu;
    }
  };

  const menu = getMenu();

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-gray-800">احجزلي</h1>
        <p className="text-sm text-gray-600 mt-1">{user.name}</p>
        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
      </div>

      <nav className="mt-6">
        {menu.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 ${
                isActive ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : ''
              }`}
            >
              <span className="ml-3">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 w-64 p-4 border-t">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <span className="ml-3">🚪</span>
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
}
