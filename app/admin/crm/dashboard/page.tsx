'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Activity,
  RefreshCw,
  Calendar,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { DesignSystem } from '@/app/admin/styles/design-system';
import { Button, Typography } from '@/app/admin/components/ui';
import { useSession } from 'next-auth/react';

interface DashboardStats {
  totalContacts: number;
  activeContacts: number;
  conversionRate: number;
  errorRate: number;
  lastSyncTime: string;
}

interface RecentActivity {
  id: string;
  type: 'contact_created' | 'contact_updated' | 'sync_completed' | 'error_occurred';
  description: string;
  timestamp: string;
}

const CRMDashboardPage: React.FC = () => {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/crm/dashboard');
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication required. Please log in.');
          return;
        }
        throw new Error(`Failed to fetch dashboard data: ${response.status}`);
      }
      
      const data = await response.json();
      setStats(data.stats);
      setRecentActivity(data.recentActivity || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncNow = async () => {
    try {
      setSyncing(true);
      const response = await fetch('/api/admin/crm/sync', { method: 'POST' });
      
      if (!response.ok) {
        throw new Error('Sync failed');
      }
      
      // Refresh dashboard data after sync
      await fetchDashboardData();
    } catch (err) {
      console.error('Sync error:', err);
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  if (!session) {
    return (
      <div style={{ padding: DesignSystem.spacing[8], textAlign: 'center' }}>
                <Typography variant="heading-lg">Authentication Required</Typography>
        <Typography variant="body-md" style={{ marginTop: DesignSystem.spacing[4] }}>
          Please log in to view the CRM dashboard.
        </Typography>
      </div>
    );
  }

  return (
    <div style={{ padding: DesignSystem.spacing[6] }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: DesignSystem.spacing[6]
      }}>
        <div>
                    <Typography variant="display-sm">CRM Dashboard</Typography>
          <Typography variant="body-md" style={{ 
            color: DesignSystem.colors.neutral[600],
            marginTop: DesignSystem.spacing[1]
          }}>
            Monitor your HubSpot CRM integration and performance
          </Typography>
        </div>
        
        <div style={{ display: 'flex', gap: DesignSystem.spacing[3] }}>
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchDashboardData}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </Button>
          <Button 
            variant="primary" 
            size="sm"
            onClick={handleSyncNow}
            disabled={syncing}
          >
            {syncing ? (
              <>
                <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Syncing...
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                Sync Now
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div style={{ 
          marginBottom: DesignSystem.spacing[6],
          padding: DesignSystem.spacing[4],
          backgroundColor: DesignSystem.colors.error + '10',
          border: `1px solid ${DesignSystem.colors.error}30`,
          borderRadius: DesignSystem.borderRadius.md,
          color: DesignSystem.colors.error
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: DesignSystem.spacing[2] }}>
            <AlertTriangle size={20} />
            <span style={{ fontWeight: 500 }}>CRM Integration Error</span>
          </div>
          <div style={{ marginTop: DesignSystem.spacing[2], fontSize: '14px' }}>
            {error}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: DesignSystem.spacing[4],
        marginBottom: DesignSystem.spacing[8]
      }}>
        {[
          {
            title: 'Total Contacts',
            value: loading ? '...' : stats?.totalContacts?.toLocaleString() || '--',
            change: '+12%',
            changeType: 'positive' as const,
            icon: Users
          },
          {
            title: 'Active Contacts',
            value: loading ? '...' : stats?.activeContacts?.toLocaleString() || '--',
            change: '+8%',
            changeType: 'positive' as const,
            icon: Activity
          },
          {
            title: 'Conversion Rate',
            value: loading ? '...' : stats?.conversionRate ? `${stats.conversionRate}%` : '--',
            change: '+2.4%',
            changeType: 'positive' as const,
            icon: TrendingUp
          },
          {
            title: 'Error Rate',
            value: loading ? '...' : stats?.errorRate ? `${stats.errorRate}%` : '--',
            change: '-0.5%',
            changeType: 'negative' as const,
            icon: AlertTriangle
          },
        ].map((stat, index) => (
          <div
            key={index}
            style={{
              backgroundColor: 'white',
              padding: DesignSystem.spacing[6],
              borderRadius: DesignSystem.borderRadius.lg,
              border: `1px solid ${DesignSystem.colors.neutral[200]}`,
              boxShadow: DesignSystem.shadows.sm,
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: DesignSystem.spacing[4]
            }}>
              <div>
                <Typography variant="body-sm" style={{ 
                  color: DesignSystem.colors.neutral[600],
                  marginBottom: DesignSystem.spacing[1]
                }}>
                  {stat.title}
                </Typography>
                                <Typography variant="heading-md" style={{ 
                  color: DesignSystem.colors.neutral[900]
                }}>
                  {stat.value}
                </Typography>
              </div>
              <div style={{
                padding: DesignSystem.spacing[3],
                backgroundColor: DesignSystem.colors.primary[50],
                borderRadius: DesignSystem.borderRadius.md,
                color: DesignSystem.colors.primary[600]
              }}>
                <stat.icon size={24} />
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: DesignSystem.spacing[2]
            }}>
              <span style={{ 
                color: stat.changeType === 'positive' 
                  ? DesignSystem.colors.success 
                  : DesignSystem.colors.error,
                fontSize: '14px',
                fontWeight: 500
              }}>
                {loading ? '--' : stat.change}
              </span>
              <span style={{ 
                color: DesignSystem.colors.neutral[500],
                fontSize: '14px'
              }}>
                vs last month
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div style={{
        backgroundColor: 'white',
        padding: DesignSystem.spacing[6],
        borderRadius: DesignSystem.borderRadius.lg,
        border: `1px solid ${DesignSystem.colors.neutral[200]}`,
        boxShadow: DesignSystem.shadows.sm,
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: DesignSystem.spacing[6]
        }}>
                    <Typography variant="heading-md">Recent Activity</Typography>
          <Button variant="ghost" size="sm">
            <ExternalLink size={16} />
            View All
          </Button>
        </div>

        {loading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: DesignSystem.spacing[8],
            color: DesignSystem.colors.neutral[500]
          }}>
            Loading activity...
          </div>
        ) : recentActivity.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: DesignSystem.spacing[8],
            color: DesignSystem.colors.neutral[500]
          }}>
            <Activity size={48} style={{ marginBottom: DesignSystem.spacing[4] }} />
            <div style={{ fontSize: '16px', marginBottom: DesignSystem.spacing[2] }}>
              No recent activity
            </div>
            <div style={{ fontSize: '14px' }}>
              CRM activity will appear here once your integration is active
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: DesignSystem.spacing[4] }}>
            {recentActivity.map((activity) => {
              const iconMap = {
                contact_created: Users,
                contact_updated: Activity,
                sync_completed: CheckCircle,
                error_occurred: AlertTriangle
              };
              const Icon = iconMap[activity.type];
              
              return (
                <div
                  key={activity.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: DesignSystem.spacing[4],
                    padding: DesignSystem.spacing[4],
                    backgroundColor: DesignSystem.colors.neutral[50],
                    borderRadius: DesignSystem.borderRadius.md,
                    border: `1px solid ${DesignSystem.colors.neutral[200]}`
                  }}
                >
                  <div style={{
                    padding: DesignSystem.spacing[2],
                    backgroundColor: 'white',
                    borderRadius: DesignSystem.borderRadius.sm,
                    color: activity.type === 'error_occurred' 
                      ? DesignSystem.colors.error 
                      : DesignSystem.colors.primary[600]
                  }}>
                    <Icon size={16} />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontWeight: 500, 
                      color: DesignSystem.colors.neutral[900],
                      marginBottom: DesignSystem.spacing[1]
                    }}>
                      {activity.description}
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      color: DesignSystem.colors.neutral[600]
                    }}>
                      {activity.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CRMDashboardPage;
