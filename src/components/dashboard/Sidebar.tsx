{
  name: "سجل الأكواد",
  href: "/owner/codes-usage"
}
حط ده في مكانه 
import React from 'react';
import Link from 'next/link';
import { User, UserRole } from '@/types';
import { LayoutDashboard, Users, Zap, Settings, LogOut, SoccerBall, ListChecks, MapPin, BarChart } from 'lucide-react';
import { clearAuthData, getDashboardPath } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  role?: UserRole;
  user?: User | null;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { name: 'الرئيسية', href: '/dashboard', icon: LayoutDashboard, roles: ['player'] },
  { name: 'لوحة التحكم', href: '/admin/dashboard', icon: BarChart, roles: ['admin'] },
  { name: 'لوحة المالك', href: '/owner/dashboard', icon: BarChart, roles: ['owner', 'manager'] },
  
  // Player Routes
  { name: 'حجوزاتي', href: '/bookings', icon: ListChecks, roles: ['player'] },
  { name: 'طلبات اللاعبين', href: '/player-requests', icon: Users, roles: ['player'] },
  
  // Owner/Manager Routes
  { name: 'ملاعبي', href: '/owner/stadiums', icon: SoccerBall, roles: ['owner', 'manager'] },
  { name: 'حجوزات الملاعب', href: '/owner/bookings', icon: ListChecks, roles: ['owner', 'manager'] },
  
  // Admin Routes
  { name: 'إدارة المستخدمين', href: '/admin/users', icon: Users, roles: ['admin'] },
  { name: 'إدارة الملاعب', href: '/admin/stadiums', icon: MapPin, roles: ['admin'] },
  { name: 'أكواد التعويض', href: '/admin/codes', icon: Zap, roles: ['admin'] },
  { name: 'التقارير', href: '/admin/reports', icon: BarChart, roles: ['admin'] },
];

const Sidebar: React.FC<SidebarProps> = ({ role, user }) => {
  const router = useRouter();
  
  if (!role) return null;

  const filteredNavItems = navItems.filter(item => item.roles.includes(role));
  
  const handleLogout = () => {
    clearAuthData();
    router.push('/login');
  };

  return (
    <nav className="fixed top-0 right-0 w-64 h-full bg-dark-card text-white p-4 shadow-xl z-30 transition-all duration-300 transform rtl:translate-x-0 rtl:-translate-x-full lg:rtl:translate-x-0">
      <div className="flex items-center justify-center mb-6 border-b border-gray-700 pb-4">
        <h1 className="text-2xl font-bold text-secondary">
          <SoccerBall className="h-6 w-6 inline-block rtl:ml-2 ltr:mr-2" />
          {role === 'admin' ? 'الإدارة' : role === 'owner' ? 'المالك' : 'احجزلي'}
        </h1>
      </div>

      <div className="mb-8 p-3 bg-gray-700/50 rounded-lg">
        <p className="font-semibold">{user?.name || 'مستخدم'}</p>
        <p className="text-xs text-gray-400">الدور: {role}</p>
      </div>

      <ul className="space-y-2">
        {filteredNavItems.map((item) => (
          <li key={item.href}>
            <Link 
              href={item.href} 
              className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                router.pathname === item.href 
                  ? 'bg-primary text-white shadow-md' 
                  : 'hover:bg-gray-700 text-gray-300'
              }`}
            >
              <item.icon className="h-5 w-5 rtl:ml-3 ltr:mr-3" />
              <span className="font-medium">{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-10 pt-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center p-3 rounded-lg text-red-400 hover:bg-gray-700 transition-colors duration-200"
        >
          <LogOut className="h-5 w-5 rtl:ml-3 ltr:mr-3" />
          <span className="font-medium">تسجيل الخروج</span>
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
