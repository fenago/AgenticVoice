'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/app/components/ui/Toast';
import { 
  Search, 
  Users, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Eye, 
  Edit, 
  Trash2, 
  UserPlus, 
  Activity
} from 'lucide-react';
import { UserSyncData } from '@/app/admin/services/userSyncService';
import SyncStatusDashboard from '@/app/admin/components/SyncStatusDashboard';
import UserDetailsModal from '@/app/admin/components/UserDetailsModal';

interface User {
  _id: string;
  email: string;
  name: string;
  role: string;
  industryType: string;
  accountStatus: string;
  customerId?: string;
  isEmailVerified: boolean;
  loginCount: number;
  lastLoginAt: string;
  createdAt: string;
  syncStatus?: 'synced' | 'partial' | 'error' | 'unknown';
}

const UserManagementPage = () => {
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [syncIssues, setSyncIssues] = useState<UserSyncData[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [currentView, setCurrentView] = useState<'users' | 'sync'>('users');

  // Load users on component mount
  useEffect(() => {
    loadUsers();
    loadSyncIssues();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSyncIssues = async () => {
    try {
      const response = await fetch('/api/admin/users/sync-issues');
      if (response.ok) {
        const data = await response.json();
        setSyncIssues(data.issues || []);
      }
    } catch (error) {
      console.error('Error loading sync issues:', error);
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.accountStatus === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getSyncStatusIcon = (user: User) => {
    if (user.customerId) {
      return <CheckCircle className="w-4 h-4 text-green-500" aria-label="Synced with Stripe" />;
    } else {
      return <AlertCircle className="w-4 h-4 text-yellow-500" aria-label="Missing Stripe customer" />;
    }
  };

  const handleForceSync = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/sync`, {
        method: 'POST',
      });
      
      if (response.ok) {
        await loadUsers();
        await loadSyncIssues();
        toast.success('Sync Completed', 'User sync completed successfully');
      } else {
        const errorData = await response.json();
        toast.error('Sync Failed', errorData.message || 'Failed to sync user');
      }
    } catch (error: any) {
      toast.error('Sync Error', error.message || 'Failed to sync user');
    }
  };

  const handleUserAction = async (action: string, userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: 'POST',
      });
      
      if (response.ok) {
        await loadUsers();
        toast.success('Success', `User ${action} completed successfully`);
      } else {
        const errorData = await response.json();
        toast.error('Action Failed', errorData.message || `Failed to ${action} user`);
      }
    } catch (error: any) {
      toast.error('Error', error.message || `Failed to ${action} user`);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Cross-platform user synchronization dashboard</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Sync Issues Alert */}
      {syncIssues.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-800">Sync Issues Detected</h3>
          </div>
          <p className="text-yellow-700 mt-1">
            {syncIssues.length} users have cross-platform synchronization issues.{' '}
            <button 
              onClick={() => setCurrentView('sync')}
              className="underline hover:no-underline"
            >
              View Details
            </button>
          </p>
        </div>
      )}

      {/* View Toggle */}
      <div className="flex items-center gap-4 bg-white rounded-lg border border-gray-200 p-4">
        <button
          onClick={() => setCurrentView('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            currentView === 'users'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Users className="w-4 h-4" />
          User Management
        </button>
        <button
          onClick={() => setCurrentView('sync')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            currentView === 'sync'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          Sync Dashboard
        </button>
      </div>

      {/* Conditional Rendering Based on Current View */}
      {currentView === 'sync' ? (
        <SyncStatusDashboard />
      ) : (
        <>
          {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            <option value="FREE">Free</option>
            <option value="ESSENTIAL">Essential</option>
            <option value="PRO">Pro</option>
            <option value="ENTERPRISE">Enterprise</option>
            <option value="ADMIN">Admin</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="DELETED">Deleted</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={loadUsers}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role & Industry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sync Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {user.role}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">{user.industryType}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.accountStatus === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.accountStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getSyncStatusIcon(user)}
                        <span className="text-xs text-gray-500">
                          {user.customerId ? 'Synced' : 'Partial'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>Last login: {new Date(user.lastLoginAt).toLocaleDateString()}</div>
                      <div>Logins: {user.loginCount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleForceSync(user._id)}
                          className="text-green-600 hover:text-green-900"
                          title="Force Sync"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUserAction('suspend', user._id)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Suspend User"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Total Users</div>
          <div className="text-2xl font-bold text-gray-900">{users.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Active Users</div>
          <div className="text-2xl font-bold text-green-600">
            {users.filter(u => u.accountStatus === 'ACTIVE').length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Sync Issues</div>
          <div className="text-2xl font-bold text-yellow-600">{syncIssues.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Stripe Customers</div>
          <div className="text-2xl font-bold text-blue-600">
            {users.filter(u => u.customerId).length}
          </div>
        </div>
      </div>
        </>
      )}

      {/* User Details Modal */}
      <UserDetailsModal
        user={selectedUser ? { ...selectedUser, id: selectedUser._id } : undefined}
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setSelectedUser(null);
        }}
        onUserUpdate={() => {
          loadUsers();
          loadSyncIssues();
        }}
      />
    </div>
  );
};

export default UserManagementPage;
