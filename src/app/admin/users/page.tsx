// src/app/employee/stadiums/[id]/page.tsx


apiFetch(`/api/employee/stadiums/${id}`)
.then((res) => {
if (!mounted) return;
setStadium(res.stadium);
setBookings(res.bookings || []);
setBlocked(res.blocked || []);
})
.catch((e) => setError(e.message || 'حدث خطأ'))
.finally(() => { if (mounted) setLoading(false); });


return () => { mounted = false; };
}, [id]);


if (loading) return <div className="p-6">جارٍ التحميل...</div>;
if (error) return <div className="p-6 text-red-500">خطأ: {error}</div>;
if (!stadium) return <div className="p-6">الملعب غير موجود</div>;


return (
<div className="p-6">
<button className="mb-4 text-sm text-blue-600" onClick={() => router.back()}>◀ عودة</button>


<div className="bg-white p-6 rounded-lg shadow">
<h1 className="text-2xl font-bold">{stadium.name}</h1>
<p className="text-sm text-gray-600">{stadium.location}</p>


<div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
<div className="p-3 border rounded">الحالة: {stadium.status}</div>
<div className="p-3 border rounded">السعر بالساعة: {stadium.price_per_hour}</div>
<div className="p-3 border rounded">الفترات: {stadium.opening_time} - {stadium.closing_time}</div>
</div>


<h2 className="mt-6 text-lg font-semibold">آخر الحجوزات</h2>
{bookings.length === 0 && <div className="text-gray-500">لا توجد حجوزات</div>}
<div className="mt-2 space-y-2">
{bookings.map((b) => (
<div key={b.id} className="p-3 border rounded flex justify-between">
<div>
<div className="font-medium">{b.date}</div>
<div className="text-sm text-gray-500">{b.start_time} — {b.end_time}</div>
</div>
<div className="text-sm text-gray-600">{b.status}</div>
</div>
))}
</div>


<h2 className="mt-6 text-lg font-semibold">الساعات المحظورة</h2>
{blocked.length === 0 && <div className="text-gray-500">لا توجد ساعات محظورة</div>}
<div className="mt-2 space-y-2">
{blocked.map((bs: any) => (
<div key={bs.id} className="p-3 border rounded">
<div className="font-medium">{bs.date}</div>
<div className="text-sm text-gray-500">{bs.start_time} — {bs.end_time}</div>
<div className="text-xs text-gray-400">{bs.reason}</div>
</div>
))}
</div>


</div>
</div>
);
}

// src/app/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';
import { adminAPI } from '@/lib/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pendingManagers, setPendingManagers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    loadUsers();
    loadPendingManagers();
  }, [roleFilter]);

  const loadUsers = async () => {
    try {
      const response = await adminAPI.getUsers(
        roleFilter === 'all' ? undefined : roleFilter
      );
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingManagers = async () => {
    try {
      const response = await adminAPI.getPendingManagers();
      setPendingManagers(response.data);
    } catch (error) {
      console.error('Error loading pending managers:', error);
    }
  };

  const handleApproveManager = async (userId: string) => {
    try {
      await adminAPI.approveManager(userId);
      alert('تمت الموافقة على المستخدم بنجاح');
      loadUsers();
      loadPendingManagers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'حدث خطأ أثناء الموافقة');
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'player': return 'لاعب';
      case 'owner': return 'صاحب ملعب';
      case 'manager': return 'مدير';
      case 'admin': return 'أدمن';
      default: return role;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h1>
        
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">جميع المستخدمين</option>
          <option value="player">لاعبين</option>
          <option value="owner">أصحاب ملاعب</option>
          <option value="manager">مديرين</option>
          <option value="admin">أدمن</option>
        </select>
      </div>

      {/* Pending Managers Section */}
      {pendingManagers.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-800 mb-4">
            طلبات انتظار الموافقة ({pendingManagers.length})
          </h2>
          <div className="space-y-3">
            {pendingManagers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-yellow-200">
                <div>
                  <h3 className="font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email} - {user.phone}</p>
                  <p className="text-sm text-yellow-600 mt-1">ينتظر الموافقة كـ {getRoleText(user.role)}</p>
                </div>
                <button
                  onClick={() => handleApproveManager(user.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  الموافقة
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المستخدم
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  البريد الإلكتروني
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الهاتف
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الدور
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التاريخ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div className="mr-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getRoleText(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.is_approved 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.is_approved ? 'مفعل' : 'بانتظار الموافقة'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('ar-EG')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">لا توجد مستخدمين</p>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import DashboardLayout from '@/components/dashboard/Layout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useApi } from '@/hooks/useApi';
import { User, UserRole } from '@/types';
import { useEffect, useState } from 'react';
import { Loader2, AlertCircle, Trash2, Edit } from 'lucide-react';

/**
 * صفحة إدارة المستخدمين (لـ Admin)
 */
const AdminUsersPage: React.FC = () => {
  const { data: users, isLoading, error, execute, setData } = useApi<User[]>(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    execute('/admin/users'); // جلب جميع المستخدمين
  }, [execute]);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Badge variant="danger">إداري</Badge>;
      case 'owner':
        return <Badge variant="warning">مالك ملعب</Badge>;
      case 'manager':
        return <Badge variant="info">مدير</Badge>;
      case 'player':
      default:
        return <Badge variant="primary">لاعب</Badge>;
    }
  };

  const filteredUsers = users?.filter(user => 
    user.name.includes(searchTerm) || user.email.includes(searchTerm) || user.role.includes(searchTerm)
  );

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold dark:text-white">إدارة المستخدمين</h1>
        
        {/* Search Bar */}
        <input 
            type="text" 
            placeholder="ابحث بالاسم أو البريد الإلكتروني..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
        />

        {isLoading && (
          <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        )}

        {error && (
          <Card className="bg-red-50 border-red-200 text-red-600 p-4 flex items-center">
            <AlertCircle className="h-5 w-5 rtl:ml-2 ltr:mr-2" />
            <span>خطأ في تحميل بيانات المستخدمين: {error}</span>
          </Card>
        )}

        {filteredUsers && filteredUsers.length > 0 ? (
          <Card>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">الاسم</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">البريد الإلكتروني</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">الدور</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">الحالة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">إجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium dark:text-white">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-300">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={user.is_approved ? 'success' : 'danger'}>
                            {user.is_approved ? 'موافق عليه' : 'بانتظار الموافقة'}
                        </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2 rtl:space-x-reverse">
                      <Button size="sm" variant="secondary" className="p-2"><Edit className="h-4 w-4" /></Button>
                      <Button size="sm" variant="danger" className="p-2" onClick={() => alert(`حذف المستخدم: ${user.name}`)}><Trash2 className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ) : (
          !isLoading && <Card className="text-center p-8 text-gray-500">لا يوجد مستخدمون لعرضهم.</Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminUsersPage;
