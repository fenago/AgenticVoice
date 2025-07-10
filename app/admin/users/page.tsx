'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/app/components/ui/Toast';
import { useSession } from 'next-auth/react';
import { Card, Button, Input, Badge } from '@/components/ui';
import { 
  Users, 
  Search, 
  RefreshCw, 
  UserCheck, 
  Activity,
  CreditCard,
  PhoneCall,
  Eye,
  Edit,
  Download,
  Upload,
  Filter,
  Plus,
  BarChart
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  subscriptionTier: string;
  accountStatus: string;
  isEmailVerified: boolean;
  customerId?: string;
  hubspotContactId?: string;
  vapiAssistantId?: string;
  createdAt: string;
  industryType: string;
  loginCount: number;
  lastLoginAt: string;
  vapi?: {
    usage: {
      monthlyMinutes: number;
      totalCalls: number;
      lastResetDate: string;
    };
    assistants: any[];
    phoneNumbers: string[];
  };
}

// Import the UserDetailsModal component
import UserDetailsModal from '../components/UserDetailsModal';
import SyncStatusDashboard from '../components/SyncStatusDashboard';

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [syncingUserId, setSyncingUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'sync'>('list');
  const [filterByRole, setFilterByRole] = useState<string>('all');
  const [filterByStatus, setFilterByStatus] = useState<string>('all');

  const isAdmin = session?.user?.role && ['ADMIN', 'SUPER_ADMIN', 'GOD_MODE'].includes(session.user.role);

  useEffect(() => {
    if (status === 'loading') return;
    if (!isAdmin) {
      window.location.href = '/admin';
      return;
    }
    loadUsers();
  }, [status, isAdmin]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        console.error('Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncUser = async (userId: string) => {
    setSyncingUserId(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}/sync`, {
        method: 'POST'
      });
      
      if (response.ok || response.status === 207) {
        const data = await response.json();
        
        if (response.status === 207) {
          // Partial success - show warnings
          toast.warning('Partial Sync', `Sync completed with some issues: ${data.errors?.join(', ') || 'Check logs for details'}`);
        } else {
          toast.success('Sync Success', 'User synced successfully across all platforms!');
        }
        
        // Reload users data immediately
        await loadUsers();
      } else {
        const error = await response.json();
        toast.error('Sync Failed', error.error || error.message || 'Failed to sync user');
      }
    } catch (error: any) {
      toast.error('Sync Error', error.message || 'Failed to sync user');
    } finally {
      setSyncingUserId(null);
    }
  };

  const testStripeSync = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/stripe/sync-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, forceUpdate: true })
      });
      if (response.ok) {
        const data = await response.json();
        toast.success('Stripe Sync Success', data.message);
      } else {
        const error = await response.json();
        toast.error('Stripe Sync Failed', error.error || 'Failed to sync with Stripe');
      }
    } catch (error: any) {
      toast.error('Stripe Sync Error', error.message || 'Failed to sync with Stripe');
    }
  };

  const testHubSpotSync = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/hubspot/sync-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (response.ok) {
        const data = await response.json();
        toast.success('HubSpot Sync Success', data.message);
      } else {
        const error = await response.json();
        toast.error('HubSpot Sync Failed', error.error || 'Failed to sync with HubSpot');
      }
    } catch (error: any) {
      toast.error('HubSpot Sync Error', error.message || 'Failed to sync with HubSpot');
    }
  };

  const getVapiUsage = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/vapi-usage`);
      if (response.ok) {
        const data = await response.json();
        toast.info('VAPI Usage Data', 'Usage data retrieved successfully');
        console.log('VAPI Usage:', data); 
      } else {
        const error = await response.json();
        toast.error('VAPI Usage Failed', error.error || 'Failed to retrieve usage data');
      }
    } catch (error: any) {
      toast.error('VAPI Usage Error', error.message || 'Failed to retrieve usage data');
    }
  };

  const testVapi = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/test-vapi`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('VAPI Test Successful', data.message);
        if (data.testResults) {
          console.log('VAPI Test Results:', data.testResults);
        }
      } else {
        if (!data.hasAssistant) {
          toast.warning('No VAPI Assistant', 'User needs a VAPI assistant first. Click "Create Assistant".');
        } else {
          toast.error('VAPI Test Failed', data.message || data.error);
        }
      }
    } catch (error: any) {
      toast.error('VAPI Test Error', error.message || 'Failed to test VAPI');
    }
  };

  const createVapiAssistant = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/vapi-assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Assistant Created', `VAPI assistant created successfully for user!`);
        console.log('New Assistant:', data.assistant);
        // Refresh users to show updated sync status
        window.location.reload();
      } else {
        if (response.status === 409) {
          toast.warning('Assistant Exists', 'User already has a VAPI assistant.');
        } else {
          toast.error('Assistant Creation Failed', data.error || data.details);
        }
      }
    } catch (error: any) {
      toast.error('Assistant Creation Error', error.message || 'Failed to create VAPI assistant');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterByRole === 'all' || user.role === filterByRole;
    const matchesStatus = filterByStatus === 'all' || user.accountStatus === filterByStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading users...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Button 
              onClick={() => setViewMode('list')}
              className={`${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-blue-700`}
            >
              <Users className="h-4 w-4 mr-2" />
              User Management
            </Button>
            <Button 
              onClick={() => setViewMode('sync')}
              className={`${viewMode === 'sync' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-blue-700`}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Dashboard
            </Button>
          </div>
          <Button 
            onClick={loadUsers}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {viewMode === 'sync' ? (
        <SyncStatusDashboard />
      ) : (
        <Card className="p-6">
          <div className="mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-row gap-3">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select
                    value={filterByRole}
                    onChange={(e) => setFilterByRole(e.target.value)}
                    className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Roles</option>
                    <option value="FREE">FREE</option>
                    <option value="ESSENTIAL">ESSENTIAL</option>
                    <option value="PRO">PRO</option>
                    <option value="ENTERPRISE">ENTERPRISE</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={filterByStatus}
                    onChange={(e) => setFilterByStatus(e.target.value)}
                    className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="PENDING">PENDING</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <Card className="p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Users ({filteredUsers.length})</h2>
              <p className="text-gray-600 text-sm">Manage users and test cross-platform integrations</p>
            </div>
        
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {user.name || 'No Name'}
                    </h3>
                    <Badge className={`${
                      user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'GOD_MODE' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </Badge>
                    <Badge className={user.accountStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {user.accountStatus}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    {user.email} • {user.subscriptionTier} • 
                    {user.isEmailVerified ? ' ✅ Verified' : ' ❌ Unverified'}
                  </div>
                  <div className="text-xs text-gray-500">
                    ID: {user.id} • Created: {new Date(user.createdAt).toLocaleDateString()}
                    {user.loginCount > 0 && ` • Logins: ${user.loginCount}`}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-gray-600">
                  <div className="grid grid-cols-1 gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">MongoDB ID:</span>
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{user.id}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Stripe ID:</span>
                      <span className={`font-mono text-xs px-2 py-1 rounded ${
                        user.customerId ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.customerId || 'Not Connected'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">HubSpot ID:</span>
                      <span className={`font-mono text-xs px-2 py-1 rounded ${
                        user.hubspotContactId ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.hubspotContactId || 'Not Connected'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">VAPI ID:</span>
                      <span className={`font-mono text-xs px-2 py-1 rounded ${
                        user.vapiAssistantId ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.vapiAssistantId || 'Not Connected'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedUser(user);
                    setShowUserModal(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View Details
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    console.log('User object:', user);
                    console.log('User.id:', user.id, 'Type:', typeof user.id);
                    syncUser(user.id);
                  }}
                  disabled={syncingUserId === user.id}
                >
                  {syncingUserId === user.id ? (
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <UserCheck className="h-3 w-3 mr-1" />
                  )}
                  Force Sync All
                </Button>
                
                <Button size="sm" variant="outline" onClick={() => testStripeSync(user.id)}>
                  <CreditCard className="h-3 w-3 mr-1" />Test Stripe
                </Button>
                
                <Button size="sm" variant="outline" onClick={() => testHubSpotSync(user.id)}>
                  <Activity className="h-3 w-3 mr-1" />Test HubSpot
                </Button>
                
                <Button size="sm" variant="outline" onClick={() => createVapiAssistant(user.id)}>
                  <Plus className="h-3 w-3 mr-1" />Create Assistant
                </Button>
                
                <Button size="sm" variant="outline" onClick={() => testVapi(user.id)}>
                  <PhoneCall className="h-3 w-3 mr-1" />Test VAPI
                </Button>
                
                <Button size="sm" variant="outline" onClick={() => getVapiUsage(user.id)}>
                  <BarChart className="h-3 w-3 mr-1" />VAPI Usage
                </Button>
              </div>
            </div>
          ))}
        </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No users match your search.' : 'No users found.'}
              </div>
            )}
          </Card>
        </Card>
      )}
      
      {/* User Details Modal */}
      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          isOpen={showUserModal}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }}
          onUserUpdate={() => {
            loadUsers(); // Refresh the user list
          }}
        />
      )}
    </div>
  );
}
