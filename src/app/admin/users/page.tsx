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
