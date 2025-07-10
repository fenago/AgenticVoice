'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/app/components/ui/Toast';
import { 
  X, 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Building, 
  CreditCard, 
  Mic, 
  Database,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Edit,
  Save,
  Ban,
  Trash2,
  BarChart,
  Users,
  Link,
  Copy,
  Hash,
  Clock,
  Phone,
  DollarSign,
  Activity
} from 'lucide-react';
import ClientSafeDate from './ClientSafeDate';
import { UserSyncData } from '@/app/admin/services/userSyncService';

interface UserDetailsModalProps {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    industryType: string;
    accountStatus: string;
    customerId?: string;
    hubspotContactId?: string;
    vapiAssistantId?: string;
    isEmailVerified: boolean;
    loginCount: number;
    lastLoginAt: string;
    createdAt: string;
    vapi?: {
      usage: {
        monthlyMinutes: number;
        totalCalls: number;
        lastResetDate: string;
      };
      assistants: any[];
      phoneNumbers: string[];
    };
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdate?: () => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ 
  user, 
  isOpen, 
  onClose, 
  onUserUpdate 
}) => {
  const toast = useToast();
  const [syncData, setSyncData] = useState<UserSyncData | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [hubspotSyncing, setHubspotSyncing] = useState(false);
  const [showHubspotAnalytics, setShowHubspotAnalytics] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    role: '',
    industryType: '',
  });

  const [vapiUsage, setVapiUsage] = useState(null);
  const [usageLoading, setUsageLoading] = useState(false);
  const [usageError, setUsageError] = useState('');
  const [vapiTesting, setVapiTesting] = useState(false);
  const [vapiTestResult, setVapiTestResult] = useState<any>(null);
  const [vapiUsageData, setVapiUsageData] = useState<any>(null);
  const [loadingVapiUsage, setLoadingVapiUsage] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      loadUserSyncData();
      setEditForm({
        name: user.name,
        role: user.role,
        industryType: user.industryType,
      });
      fetchVapiUsage();
    }
  }, [user, isOpen]);

  const loadUserSyncData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${user.id}/sync-status`);
      if (response.ok) {
        const data = await response.json();
        setSyncData(data.syncData);
      }
    } catch (error) {
      console.error('Error loading user sync data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVapiUsage = async () => {
    setUsageLoading(true);
    setUsageError('');
    try {
      const response = await fetch(`/api/admin/users/${user.id}/vapi-usage`);
      if (response.ok) {
        const data = await response.json();
        setVapiUsage(data);
      } else {
        setUsageError('Failed to load usage data');
      }
    } catch (error) {
      console.error('Error fetching VAPI usage:', error);
      setUsageError('Error loading usage data');
    } finally {
      setUsageLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        setEditing(false);
        onUserUpdate?.();
        toast.success('User Updated', 'User updated successfully');
      } else {
        const error = await response.json();
        toast.error('Update Failed', error.message || 'Failed to update user');
      }
    } catch (error: any) {
      toast.error('Error', error.message || 'An unexpected error occurred');
    }
  };

  const handleForceSync = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/admin/users/${user.id}/sync`, {
        method: 'POST',
      });

      if (response.ok || response.status === 207) {
        const data = await response.json();
        await loadUserSyncData();
        onUserUpdate?.();
        
        if (response.status === 207) {
          // Partial success - show warnings
          toast.warning('Partial Sync Success', `Sync completed with some issues: ${data.errors?.join(', ') || 'Check console for details'}`);
        } else {
          toast.success('Sync Completed', 'User synchronized successfully across all platforms!');
        }
      } else {
        const error = await response.json();
        toast.error('Sync Failed', error.error || error.message || 'Failed to sync user');
      }
    } catch (error: any) {
      toast.error('Sync Error', error.message || 'Failed to sync user');
    }
  };

  const handleHubSpotSync = async () => {
    if (!user) return;

    setHubspotSyncing(true);
    try {
      const response = await fetch('/api/admin/hubspot/sync-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        const data = await response.json();
        await loadUserSyncData();
        onUserUpdate?.();
        toast.success('HubSpot Sync Success', `Contact synced successfully! Contact ID: ${data.hubspotContactId}`);
      } else {
        const error = await response.json();
        toast.error('HubSpot Sync Failed', error.error || 'Failed to sync with HubSpot');
      }
    } catch (error: any) {
      toast.error('HubSpot Sync Error', error.message || 'Failed to sync with HubSpot');
    } finally {
      setHubspotSyncing(false);
    }
  };

  const handleTrackEvent = async (eventName: string, properties?: any) => {
    if (!user) return;

    try {
      const response = await fetch('/api/admin/hubspot/track-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName,
          email: user.email,
          properties: properties || {}
        }),
      });

      if (response.ok) {
        toast.success('Event Tracked', `Event '${eventName}' tracked successfully!`);
      } else {
        const error = await response.json();
        toast.error('Event Tracking Failed', error.error || 'Internal server error');
      }
    } catch (error: any) {
      toast.error('Event Tracking Error', error.message || 'Failed to track event');
    }
  };

  const handleVapiTest = async () => {
    setVapiTesting(true);
    setVapiTestResult(null);
    
    try {
      const response = await fetch('/api/admin/vapi/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();
      setVapiTestResult(result);
      
      if (result.success) {
        toast.success('VAPI Test Successful', result.message);
      } else {
        toast.error('VAPI Test Failed', result.message);
      }
    } catch (error: any) {
      const errorResult = {
        success: false,
        message: error.message || 'Failed to test VAPI connection',
        timestamp: new Date().toISOString(),
      };
      setVapiTestResult(errorResult);
      toast.error('VAPI Test Error', error.message);
    } finally {
      setVapiTesting(false);
    }
  };

  const loadVapiUsage = async () => {
    if (!user?.customerId) {
      return;
    }

    setLoadingVapiUsage(true);
    
    try {
      const response = await fetch(`/api/admin/vapi/usage/${user.customerId}`);
      
      if (response.ok) {
        const data = await response.json();
        setVapiUsageData(data);
      } else {
        const error = await response.json();
        toast.error('VAPI Usage Error', error.message || 'Failed to load VAPI usage data');
      }
    } catch (error: any) {
      toast.error('VAPI Usage Error', error.message || 'Failed to load VAPI usage data');
    } finally {
      setLoadingVapiUsage(false);
    }
  };

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'synced':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'mongodb':
        return <Database className="w-4 h-4 text-green-600" />;
      case 'stripe':
        return <CreditCard className="w-4 h-4 text-blue-600" />;
      case 'vapi':
        return <Mic className="w-4 h-4 text-purple-600" />;
      case 'hubspot':
        return <BarChart className="w-4 h-4 text-orange-600" />;
      default:
        return <Database className="w-4 h-4 text-gray-600" />;
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">User Details</h2>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600">Name</div>
                    {editing ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <div className="font-medium text-gray-900">{user.name}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600">Email</div>
                    <div className="font-medium text-gray-900">{user.email}</div>
                    {user.isEmailVerified && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600">Role</div>
                    {editing ? (
                      <select
                        value={editForm.role}
                        onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="FREE">Free</option>
                        <option value="ESSENTIAL">Essential</option>
                        <option value="PRO">Pro</option>
                        <option value="ENTERPRISE">Enterprise</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {user.role}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Building className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600">Industry</div>
                    {editing ? (
                      <select
                        value={editForm.industryType}
                        onChange={(e) => setEditForm({...editForm, industryType: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="MEDICAL">Medical</option>
                        <option value="LEGAL">Legal</option>
                        <option value="SALES">Sales</option>
                        <option value="OTHER">Other</option>
                      </select>
                    ) : (
                      <div className="font-medium text-gray-900">{user.industryType}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Account Status</h3>
              
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600">Status</div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.accountStatus === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.accountStatus}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600">Member Since</div>
                    <div className="font-medium text-gray-900">
                      <ClientSafeDate date={user.createdAt} format="date" />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600">Last Login</div>
                  <div className="font-medium text-gray-900">
                    <ClientSafeDate date={user.lastLoginAt} format="datetime" />
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600">Login Count</div>
                  <div className="font-medium text-gray-900">{user.loginCount}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Unique User IDs */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Hash className="w-5 h-5 text-blue-600" />
              Unique User IDs
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              {/* MongoDB Primary ID */}
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div className="flex items-center gap-3">
                  <Database className="w-4 h-4 text-green-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">MongoDB ID</div>
                    <div className="text-xs text-gray-600">Primary Universal Identifier</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{user.id}</code>
                  <button
                    onClick={() => navigator.clipboard.writeText(user.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Copy MongoDB ID"
                  >
                    <Copy className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Generated VAPI User ID */}
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div className="flex items-center gap-3">
                  <Mic className="w-4 h-4 text-purple-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">VAPI User ID</div>
                    <div className="text-xs text-gray-600">Voice AI Platform Identifier</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                    {user.vapiAssistantId || 'Not Connected'}
                  </code>
                  {user.vapiAssistantId && (
                    <button
                      onClick={() => navigator.clipboard.writeText(user.vapiAssistantId!)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Copy VAPI Assistant ID"
                    >
                      <Copy className="w-4 h-4 text-gray-500" />
                    </button>
                  )}
                </div>
              </div>

              {/* Stripe Customer ID */}
              {user.customerId && (
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Stripe Customer ID</div>
                      <div className="text-xs text-gray-600">Billing & Payment Identifier</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{user.customerId}</code>
                    <button
                      onClick={() => navigator.clipboard.writeText(user.customerId!)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Copy Stripe Customer ID"
                    >
                      <Copy className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              )}

              {/* HubSpot Contact ID */}
              {user.hubspotContactId && (
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex items-center gap-3">
                    <BarChart className="w-4 h-4 text-orange-600" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">HubSpot Contact ID</div>
                      <div className="text-xs text-gray-600">CRM & Marketing Identifier</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{user.hubspotContactId}</code>
                    <button
                      onClick={() => navigator.clipboard.writeText(user.hubspotContactId!)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Copy HubSpot Contact ID"
                    >
                      <Copy className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* VAPI Usage & Billing */}
          {user.role !== 'FREE' && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  VAPI Usage & Billing
                </h4>
                <button
                  onClick={fetchVapiUsage}
                  disabled={usageLoading}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                >
                  <RefreshCw className={`h-3 w-3 ${usageLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
              
              {usageLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : usageError ? (
                <div className="text-red-600 text-sm py-4 text-center">
                  {usageError}
                </div>
              ) : vapiUsage ? (
                <>
                  {/* Usage Status Alert */}
                  {vapiUsage.usage && vapiUsage.billing && (
                    <div className={`p-3 rounded-lg mb-4 ${vapiUsage.usage.status === 'exceeded' ? 'bg-red-50 border-red-200' : 
                      vapiUsage.usage.status === 'warning' ? 'bg-yellow-50 border-yellow-200' : 
                      'bg-green-50 border-green-200'} border`}>
                      <div className={`text-sm font-medium ${
                        vapiUsage.usage.status === 'exceeded' ? 'text-red-800' : 
                        vapiUsage.usage.status === 'warning' ? 'text-yellow-800' : 
                        'text-green-800'
                      }`}>
                        {vapiUsage.usage.message || 'Usage within limits'}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-blue-50 p-3 rounded">
                      <div className="text-sm text-gray-600">Monthly Minutes</div>
                      <div className="text-lg font-semibold text-blue-600">
                        {vapiUsage.usage?.monthlyMinutes || 0}
                        {vapiUsage.limits?.monthlyLimit && (
                          <span className="text-xs text-gray-500"> / {vapiUsage.limits.monthlyLimit}</span>
                        )}
                      </div>
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                      <div className="text-sm text-gray-600">Total Calls</div>
                      <div className="text-lg font-semibold text-green-600">{vapiUsage.usage?.totalCalls || 0}</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded">
                      <div className="text-sm text-gray-600">Estimated Cost</div>
                      <div className="text-lg font-semibold text-purple-600">
                        ${vapiUsage.billing?.totalCost?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                    <div className="bg-orange-50 p-3 rounded">
                      <div className="text-sm text-gray-600">Rate per Minute</div>
                      <div className="text-lg font-semibold text-orange-600">
                        ${vapiUsage.billing?.ratePerMinute?.toFixed(2) || '0.05'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Usage Breakdown</div>
                      <div className="text-sm">
                        <div className="flex justify-between">
                          <span>Assistant Usage:</span>
                          <span className="font-medium">{vapiUsage.usage?.assistantMinutes || 0} min</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Workflow Usage:</span>
                          <span className="font-medium">{vapiUsage.usage?.workflowMinutes || 0} min</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t text-xs">
                          <span>Assistant Cost:</span>
                          <span className="font-medium">${vapiUsage.billing?.assistantCost?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Workflow Cost:</span>
                          <span className="font-medium">${vapiUsage.billing?.workflowCost?.toFixed(2) || '0.00'}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Resources</div>
                      <div className="text-sm">
                        <div className="flex justify-between">
                          <span>Active Assistants:</span>
                          <span className="font-medium">{vapiUsage.resources?.assistants?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Phone Numbers:</span>
                          <span className="font-medium">{vapiUsage.resources?.phoneNumbers?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {vapiUsage.resources?.phoneNumbers?.length > 0 && (
                    <div className="text-sm mb-3">
                      <div className="text-gray-600 mb-1">Assigned Phone Numbers:</div>
                      <div className="flex flex-wrap gap-1">
                        {vapiUsage.resources.phoneNumbers.map((phone: string, index: number) => (
                          <span key={index} className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {phone}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 flex justify-between">
                    <span>Last reset: <ClientSafeDate date={vapiUsage.usage?.lastResetDate} format="date" /></span>
                    <span>Last updated: <ClientSafeDate date={vapiUsage.lastUpdated} format="datetime" /></span>
                  </div>
                </>
              ) : (
                <div className="text-gray-500 text-sm py-4 text-center">
                  No usage data available
                </div>
              )}
            </div>
          )}

          {/* VAPI Connection Test */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Phone className="w-5 h-5 text-purple-600" />
                VAPI Test
              </h3>
              <button
                onClick={handleVapiTest}
                disabled={vapiTesting}
                className="flex items-center gap-2 px-3 py-2 text-purple-600 hover:bg-purple-50 rounded-lg disabled:opacity-50"
              >
                {vapiTesting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Activity className="w-4 h-4" />
                )}
                {vapiTesting ? 'Testing...' : 'Test Connection'}
              </button>
            </div>

            {vapiTestResult && (
              <div className={`p-4 rounded-lg border ${
                vapiTestResult.success
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {vapiTestResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="font-medium">
                    {vapiTestResult.success ? 'Connection Successful' : 'Connection Failed'}
                  </span>
                </div>
                <p className="text-sm">{vapiTestResult.message}</p>
                {vapiTestResult.details && (
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(vapiTestResult.details, null, 2)}
                  </pre>
                )}
                <div className="text-xs text-gray-500 mt-2">
                  Tested at: {new Date(vapiTestResult.timestamp).toLocaleString()}
                </div>
              </div>
            )}
          </div>

          {/* VAPI Usage Analytics */}
          {user?.customerId && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <BarChart className="w-5 h-5 text-purple-600" />
                  VAPI Usage
                </h3>
                <button
                  onClick={loadVapiUsage}
                  disabled={loadingVapiUsage}
                  className="flex items-center gap-2 px-3 py-2 text-purple-600 hover:bg-purple-50 rounded-lg disabled:opacity-50"
                >
                  {loadingVapiUsage ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {loadingVapiUsage ? 'Loading...' : 'Load Usage'}
                </button>
              </div>

              {vapiUsageData && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="text-sm text-purple-600">Total Calls</div>
                      <div className="text-2xl font-bold text-purple-800">
                        {vapiUsageData.usage.totalCalls || 0}
                      </div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="text-sm text-purple-600">Total Minutes</div>
                      <div className="text-2xl font-bold text-purple-800">
                        {Math.round((vapiUsageData.usage.totalDuration || 0) / 60)}
                      </div>
                    </div>
                  </div>

                  {vapiUsageData.assistants && vapiUsageData.assistants.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Assistants ({vapiUsageData.assistants.length})</div>
                      <div className="space-y-2">
                        {vapiUsageData.assistants.map((assistant: any) => (
                          <div key={assistant.id} className="p-2 bg-gray-50 rounded text-sm">
                            <div className="font-medium">{assistant.name}</div>
                            <div className="text-xs text-gray-500">ID: {assistant.id}</div>
                            {assistant.metadata && (
                              <div className="text-xs text-gray-500">
                                Customer: {assistant.metadata.customer_id}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    Data refreshed: {new Date(vapiUsageData.timestamp).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cross-Platform Sync Status */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Cross-Platform Sync Status</h3>
              <button
                onClick={handleForceSync}
                className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <RefreshCw className="w-4 h-4" />
                Force Sync
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading sync status...</span>
              </div>
            ) : syncData ? (
              <div className="space-y-3">
                {syncData.syncStatus.map((sync) => (
                  <div key={sync.platform} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      {getPlatformIcon(sync.platform)}
                      <div>
                        <div className="font-medium text-gray-900 capitalize">{sync.platform}</div>
                        {sync.lastSyncAt && (
                          <div className="text-xs text-gray-500">
                            Last sync: <ClientSafeDate date={sync.lastSyncAt} format="datetime" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getSyncStatusIcon(sync.status)}
                      <span className="text-sm font-medium capitalize">{sync.status}</span>
                      {sync.error && (
                        <span className="text-xs text-red-600" title={sync.error}>
                          Error
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <XCircle className="w-8 h-8 mx-auto mb-2" />
                <p>Unable to load sync status</p>
              </div>
            )}
          </div>

          {/* HubSpot Integration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BarChart className="w-5 h-5 text-orange-600" />
                HubSpot CRM Integration
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleHubSpotSync}
                  disabled={hubspotSyncing}
                  className="flex items-center gap-2 px-3 py-2 text-orange-600 hover:bg-orange-50 rounded-lg disabled:opacity-50"
                >
                  {hubspotSyncing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Link className="w-4 h-4" />
                  )}
                  {hubspotSyncing ? 'Syncing...' : 'Sync to HubSpot'}
                </button>
                <button
                  onClick={() => setShowHubspotAnalytics(!showHubspotAnalytics)}
                  className="flex items-center gap-2 px-3 py-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                >
                  <Users className="w-4 h-4" />
                  {showHubspotAnalytics ? 'Hide Analytics' : 'View Analytics'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => handleTrackEvent('profile_viewed', { source: 'admin_dashboard' })}
                className="p-3 text-sm bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
              >
                Track Profile View
              </button>
              <button
                onClick={() => handleTrackEvent('admin_action', { action: 'details_viewed' })}
                className="p-3 text-sm bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
              >
                Track Admin Action
              </button>
              <button
                onClick={() => handleTrackEvent('engagement_check', { engagement_level: 'high' })}
                className="p-3 text-sm bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
              >
                Track Engagement
              </button>
            </div>

            {showHubspotAnalytics && (
              <div className="mt-4 border border-orange-200 rounded-lg">
                <div className="p-4 bg-orange-50 border-b border-orange-200">
                  <h4 className="font-medium text-orange-900">HubSpot Analytics Dashboard</h4>
                  <p className="text-sm text-orange-700 mt-1">Real-time engagement and contact data from HubSpot CRM</p>
                </div>
                <div className="p-4">
                  {/* Placeholder for HubSpot Analytics Component */}
                  <div className="text-center py-8 text-gray-500">
                    <BarChart className="w-12 h-12 mx-auto mb-4 text-orange-400" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">HubSpot Analytics</h4>
                    <p className="text-sm">Contact engagement data, lead scoring, and activity timeline will be displayed here.</p>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-700">
                        <strong>Note:</strong> Full analytics integration requires HubSpot API configuration and custom property setup.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            {editing ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 text-yellow-600 border border-yellow-300 rounded-lg hover:bg-yellow-50">
                  <Ban className="w-4 h-4" />
                  Suspend User
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                  Delete User
                </button>
              </div>
            )}
            
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
