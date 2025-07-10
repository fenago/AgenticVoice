'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Badge, Input, Modal, LoadingSpinner } from '@/components/ui';
import { UserRole, IndustryType, AccountStatus } from '@/types/auth';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Ban, 
  CheckCircle, 
  XCircle, 
  Clock,
  Mail,
  Download,
  RefreshCw,
  User,
  Calendar
} from 'lucide-react';

interface RealUser {
  _id: string;
  name?: string;
  email: string;
  role: UserRole;
  accountStatus: AccountStatus;
  industryType?: IndustryType;
  createdAt: string;
  lastLoginAt?: string;
  loginCount?: number;
  emailVerified?: string;
  image?: string;
}

interface UsersResponse {
  users: RealUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export default function UserManagement() {
  const [users, setUsers] = useState<RealUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<RealUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: UserRole.FREE,
    industryType: IndustryType.OTHER,
    accountStatus: AccountStatus.ACTIVE
  });

  // Fetch users from API
  const fetchUsers = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(selectedRole && { role: selectedRole }),
        ...(selectedStatus && { status: selectedStatus })
      });

      const response = await fetch(`/api/admin/users?${params}`);
      if (response.ok) {
        const data: UsersResponse = await response.json();
        setUsers(data.users);
        setTotalUsers(data.pagination.total);
      } else {
        console.error('Failed to fetch users:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create new user
  const createUser = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchUsers();
        setShowUserModal(false);
        resetForm();
      } else {
        console.error('Failed to create user:', response.statusText);
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  // Update user
  const updateUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchUsers();
        setShowUserModal(false);
        resetForm();
        setSelectedUser(null);
      } else {
        console.error('Failed to update user:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  // Delete user
  const deleteUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser._id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchUsers();
        setShowDeleteConfirm(false);
        setSelectedUser(null);
      } else {
        console.error('Failed to delete user:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  // Export users data
  const exportUsers = async (format: 'csv' | 'json') => {
    try {
      const response = await fetch(`/api/admin/export?type=users&format=${format}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users-export.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting users:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: UserRole.FREE,
      industryType: IndustryType.OTHER,
      accountStatus: AccountStatus.ACTIVE
    });
    setIsCreating(false);
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreating(true);
    setSelectedUser(null);
    setShowUserModal(true);
  };

  const openEditModal = (user: RealUser) => {
    setFormData({
      name: user.name || '',
      email: user.email,
      role: user.role,
      industryType: user.industryType || IndustryType.OTHER,
      accountStatus: user.accountStatus
    });
    setSelectedUser(user);
    setIsCreating(false);
    setShowUserModal(true);
  };

  const openDeleteModal = (user: RealUser) => {
    setSelectedUser(user);
    setShowDeleteConfirm(true);
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    fetchUsers(1);
    setCurrentPage(1);
  }, [searchTerm, selectedRole, selectedStatus]);

  const getRoleColor = (role: UserRole): string => {
    const colors = {
      [UserRole.FREE]: 'bg-gray-100 text-gray-800',
      [UserRole.ESSENTIAL]: 'bg-blue-100 text-blue-800',
      [UserRole.PRO]: 'bg-purple-100 text-purple-800',
      [UserRole.ENTERPRISE]: 'bg-green-100 text-green-800',
      [UserRole.CUSTOM]: 'bg-yellow-100 text-yellow-800',
      [UserRole.ADMIN]: 'bg-red-100 text-red-800',
      [UserRole.MARKETING]: 'bg-pink-100 text-pink-800',
      [UserRole.GOD_MODE]: 'bg-black text-white'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: AccountStatus): string => {
    const colors = {
      [AccountStatus.ACTIVE]: 'bg-green-100 text-green-800',
      [AccountStatus.SUSPENDED]: 'bg-yellow-100 text-yellow-800',
      [AccountStatus.INACTIVE]: 'bg-red-100 text-red-800',
      [AccountStatus.PENDING]: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => exportUsers('csv')} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => exportUsers('json')} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            {Object.values(UserRole).map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            {Object.values(AccountStatus).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <Button onClick={() => fetchUsers()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="p-0">
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            {user.image ? (
                              <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full" />
                            ) : (
                              <User className="w-5 h-5 text-gray-500" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name || 'No Name'}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Badge className={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <Badge className={getStatusColor(user.accountStatus)}>
                          {user.accountStatus}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900">
                        {user.industryType || 'Not specified'}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500">
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => openEditModal(user)}
                            variant="outline"
                            size="sm"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => openDeleteModal(user)}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button
                  onClick={() => fetchUsers(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => fetchUsers(currentPage + 1)}
                  disabled={currentPage * 10 >= totalUsers}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(currentPage * 10, totalUsers)}</span> of{' '}
                    <span className="font-medium">{totalUsers}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <Button
                      onClick={() => fetchUsers(currentPage - 1)}
                      disabled={currentPage === 1}
                      variant="outline"
                      className="rounded-r-none"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => fetchUsers(currentPage + 1)}
                      disabled={currentPage * 10 >= totalUsers}
                      variant="outline"
                      className="rounded-l-none"
                    >
                      Next
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* User Modal */}
      <Modal 
        isOpen={showUserModal} 
        onClose={() => setShowUserModal(false)}
        title={isCreating ? 'Create New User' : 'Edit User'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter user name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.values(UserRole).map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
            <select
              value={formData.industryType}
              onChange={(e) => setFormData({ ...formData, industryType: e.target.value as IndustryType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.values(IndustryType).map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
            <select
              value={formData.accountStatus}
              onChange={(e) => setFormData({ ...formData, accountStatus: e.target.value as AccountStatus })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.values(AccountStatus).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div className="flex space-x-3 pt-4">
            <Button onClick={() => setShowUserModal(false)} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={isCreating ? createUser : updateUser} 
              className="flex-1"
            >
              {isCreating ? 'Create User' : 'Update User'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={showDeleteConfirm} 
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete User"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete user <strong>{selectedUser?.name || selectedUser?.email}</strong>? 
            This action cannot be undone.
          </p>
          <div className="flex space-x-3 pt-4">
            <Button onClick={() => setShowDeleteConfirm(false)} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button onClick={deleteUser} variant="destructive" className="flex-1">
              Delete User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
