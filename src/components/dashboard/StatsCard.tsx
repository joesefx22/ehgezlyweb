import React from 'react';
import Card from '../ui/Card';
import { DashboardStats } from '@/types';
import { BarChart, Users, DollarSign, Zap, AlertTriangle } from 'lucide-react';

interface StatsProps {
  stats: DashboardStats;
}

const StatItem: React.FC<{ icon: React.ElementType, title: string, value: number | string, color: string }> = ({ icon: Icon, title, value, color }) => (
  <Card className="p-4 flex items-center justify-between">
    <div className="rtl:ml-4 ltr:mr-4">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-3xl font-bold dark:text-white mt-1">{value}</p>
    </div>
    <div className={`p-3 rounded-full bg-opacity-20 ${color} text-white`}>
      <Icon className={`h-6 w-6 ${color}`} />
    </div>
  </Card>
);

const Stats: React.FC<StatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatItem 
        icon={BarChart} 
        title="إجمالي الحجوزات" 
        value={stats.total_bookings.toLocaleString()} 
        color="text-primary bg-primary"
      />
      <StatItem 
        icon={DollarSign} 
        title="إجمالي الإيرادات" 
        value={`${stats.total_revenue.toLocaleString()} د.ع`} 
        color="text-green-500 bg-green-500"
      />
      <StatItem 
        icon={Users} 
        title="مستخدمون جدد (اليوم)" 
        value={stats.new_users.toLocaleString()} 
        color="text-blue-500 bg-blue-500"
      />
      <StatItem 
        icon={AlertTriangle} 
        title="المديرين بانتظار" 
        value={stats.pending_managers.toLocaleString()} 
        color="text-accent bg-accent"
      />
      <StatItem 
        icon={Zap} 
        title="الملاعب المتاحة" 
        value={stats.available_stadiums.toLocaleString()} 
        color="text-indigo-500 bg-indigo-500"
      />
    </div>
  );
};

export default Stats;
