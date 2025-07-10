'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Database,
  CreditCard,
  Mic,
  Users,
  Clock
} from 'lucide-react';
import { UserSyncData } from '@/app/admin/services/userSyncService';

interface SyncMetrics {
  totalUsers: number;
  syncedUsers: number;
  partialSyncUsers: number;
  errorUsers: number;
  lastSyncTime: string;
  platformStatus: {
    mongodb: { status: 'healthy' | 'degraded' | 'down'; lastCheck: string };
    stripe: { status: 'healthy' | 'degraded' | 'down'; lastCheck: string };
    vapi: { status: 'healthy' | 'degraded' | 'down'; lastCheck: string };
  };
}

const SyncStatusDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SyncMetrics | null>(null);
  const [syncIssues, setSyncIssues] = useState<UserSyncData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSyncMetrics();
  }, []);

  const loadSyncMetrics = async () => {
    try {
      setLoading(true);
      
      // Load sync issues
      const issuesResponse = await fetch('/api/admin/users/sync-issues');
      if (issuesResponse.ok) {
        const issuesData = await issuesResponse.json();
        setSyncIssues(issuesData.issues || []);
      }

      // Load overall metrics (mock data for now - would come from real API)
      setMetrics({
        totalUsers: 150,
        syncedUsers: 142,
        partialSyncUsers: 6,
        errorUsers: 2,
        lastSyncTime: new Date().toISOString(),
        platformStatus: {
          mongodb: { status: 'healthy', lastCheck: new Date().toISOString() },
          stripe: { status: 'healthy', lastCheck: new Date().toISOString() },
          vapi: { status: 'degraded', lastCheck: new Date().toISOString() },
        }
      });

    } catch (error) {
      console.error('Error loading sync metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshMetrics = async () => {
    setRefreshing(true);
    await loadSyncMetrics();
    setRefreshing(false);
  };

  const getPlatformStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'down': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'mongodb': return <Database className="w-5 h-5" />;
      case 'stripe': return <CreditCard className="w-5 h-5" />;
      case 'vapi': return <Mic className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading sync status...</span>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <XCircle className="w-12 h-12 mx-auto mb-2 text-red-500" />
          <p>Failed to load sync metrics</p>
          <button 
            onClick={loadSyncMetrics}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Cross-Platform Sync Status</h2>
            <p className="text-sm text-gray-600">Real-time synchronization monitoring</p>
          </div>
        </div>
        <button
          onClick={refreshMetrics}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Sync Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{metrics.totalUsers}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-green-600">{metrics.syncedUsers}</div>
              <div className="text-sm text-gray-600">Fully Synced</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
            <div>
              <div className="text-2xl font-bold text-yellow-600">{metrics.partialSyncUsers}</div>
              <div className="text-sm text-gray-600">Partial Sync</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-600" />
            <div>
              <div className="text-2xl font-bold text-red-600">{metrics.errorUsers}</div>
              <div className="text-sm text-gray-600">Sync Errors</div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(metrics.platformStatus).map(([platform, status]) => (
            <div key={platform} className="flex items-center justify-between p-4 rounded-lg border border-gray-100">
              <div className="flex items-center gap-3">
                {getPlatformIcon(platform)}
                <div>
                  <div className="font-medium text-gray-900 capitalize">{platform}</div>
                  <div className="text-xs text-gray-500">
                    Last check: {new Date(status.lastCheck).toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${getPlatformStatusColor(status.status)}`}>
                {status.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Sync Issues */}
      {syncIssues.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Sync Issues</h3>
            <span className="text-sm text-gray-500">{syncIssues.length} issues detected</span>
          </div>
          <div className="space-y-3">
            {syncIssues.slice(0, 5).map((issue) => (
              <div key={issue.mongoUserId} className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <div>
                    <div className="font-medium text-gray-900">{issue.name}</div>
                    <div className="text-sm text-gray-600">{issue.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-500">
                    {issue.syncStatus.filter(s => s.status === 'error' || s.status === 'not_synced').length} platforms affected
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Fix
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Sync Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>Last full sync: {new Date(metrics.lastSyncTime).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default SyncStatusDashboard;
