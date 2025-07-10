'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  Database, 
  Settings, 
  FileText, 
  BarChart3, 
  Users, 
  AlertTriangle,
  Activity,
  TrendingUp,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { DesignSystem } from '@/app/admin/styles/design-system';
import { Button, Typography } from '@/app/admin/components/ui';

const CRMDashboard: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Total Customers',
      value: loading ? '...' : dashboardData?.keyMetrics?.totalContacts?.toLocaleString() || '--',
      change: loading ? '--' : '+12%',
      changeType: 'positive' as const,
      icon: Users
    },
    {
      title: 'Active Contacts',
      value: loading ? '...' : dashboardData?.keyMetrics?.activeContacts?.toLocaleString() || '--',
      change: loading ? '--' : '+8%',
      changeType: 'positive' as const,
      icon: Activity
    },
    {
      title: 'Conversion Rate',
      value: loading ? '...' : dashboardData?.keyMetrics?.conversionRate ? `${dashboardData.keyMetrics.conversionRate}%` : '--',
      change: loading ? '--' : '+2.4%',
      changeType: 'positive' as const,
      icon: TrendingUp
    },
    {
      title: 'Error Rate',
      value: loading ? '...' : dashboardData?.keyMetrics?.errorRate ? `${dashboardData.keyMetrics.errorRate}%` : '--',
      change: loading ? '--' : '-0.5%',
      changeType: 'negative' as const,
      icon: AlertTriangle
    }
  ];

  const [syncing, setSyncing] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  const handleForceSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/admin/crm/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'force_sync_all' })
      });
      const result = await response.json();
      if (response.ok) {
        alert('Force sync completed successfully!');
        fetchDashboardData(); // Refresh data
      } else {
        alert('Force sync failed: ' + result.error);
      }
    } catch (error) {
      alert('Force sync failed: ' + (error as Error).message);
    } finally {
      setSyncing(false);
    }
  };
  
  const handleExportData = async () => {
    setExporting(true);
    try {
      const response = await fetch('/api/admin/crm/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'export_data' })
      });
      const result = await response.json();
      if (response.ok) {
        // Create and download JSON file
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `crm-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        alert('Data export completed!');
      } else {
        alert('Export failed: ' + result.error);
      }
    } catch (error) {
      alert('Export failed: ' + (error as Error).message);
    } finally {
      setExporting(false);
    }
  };

  const quickActions = [
    {
      title: 'Force Sync All',
      description: 'Sync all contacts, companies, deals & tickets',
      icon: Settings,
      action: handleForceSync,
      loading: syncing,
      color: 'primary' as const
    },
    {
      title: 'Export Data',
      description: 'Download complete CRM data as JSON',
      icon: FileText,
      action: handleExportData,
      loading: exporting,
      color: 'success' as const
    },
    {
      title: 'Customer Analytics',
      description: 'View detailed customer analytics',
      icon: BarChart3,
      href: '/admin/crm/analytics',
      color: 'warning' as const
    }
  ];

  const recentActivity = dashboardData?.recentActivities || [];

  if (!session) {
    return (
      <div style={{ padding: DesignSystem.spacing[8], textAlign: 'center' }}>
        <div style={{ fontSize: '24px', fontWeight: 600, marginBottom: DesignSystem.spacing[4] }}>
          Authentication Required
        </div>
        <div style={{ color: DesignSystem.colors.neutral[600] }}>
          Please log in to view the CRM dashboard.
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: DesignSystem.spacing[6],
      backgroundColor: DesignSystem.colors.neutral[50],
      minHeight: '100vh'
    }}>
      {/* Error Display */}
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
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchDashboardData}
            style={{ marginTop: DesignSystem.spacing[3] }}
          >
            Retry
          </Button>
        </div>
      )}
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: DesignSystem.spacing[6]
      }}>
        <div>
          <Typography variant="heading-lg" style={{ 
            color: DesignSystem.colors.neutral[900],
            marginBottom: DesignSystem.spacing[1]
          }}>
            CRM Dashboard
          </Typography>
          <Typography variant="body-md" style={{ 
            color: DesignSystem.colors.neutral[600]
          }}>
            Manage customer relationships and system integrations
          </Typography>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: DesignSystem.spacing[3] }}>
          <Button 
            variant="outline"
            onClick={() => window.open('https://developers.hubspot.com/docs/reference/api/overview', '_blank')}
            style={{
              fontSize: '14px',
              padding: `${DesignSystem.spacing[2]} ${DesignSystem.spacing[3]}`
            }}
          >
            📚 HubSpot API Docs
          </Button>
          <Button 
            variant="primary"
            onClick={() => router.push('/admin/crm/settings')}
          style={{ display: 'flex', alignItems: 'center', gap: DesignSystem.spacing[2] }}
        >
          <Settings size={16} />
          CRM Settings
        </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: DesignSystem.spacing[4],
        marginBottom: DesignSystem.spacing[8]
      }}>
        {stats.map((stat, index) => (
          <div
            key={index}
            style={{
              backgroundColor: DesignSystem.colors.neutral[50],
              borderRadius: DesignSystem.borderRadius.lg,
              padding: DesignSystem.spacing[6],
              border: `1px solid ${DesignSystem.colors.neutral[200]}`,
              boxShadow: DesignSystem.shadows.sm
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: DesignSystem.spacing[3]
            }}>
              <div>
                <Typography variant="body-sm" style={{ 
                  color: DesignSystem.colors.neutral[600],
                  marginBottom: DesignSystem.spacing[1]
                }}>
                  {stat.title}
                </Typography>
                <Typography variant="heading-xl" style={{ 
                  color: DesignSystem.colors.neutral[900]
                }}>
                  {stat.value}
                </Typography>
              </div>
              <div style={{
                padding: DesignSystem.spacing[2],
                backgroundColor: DesignSystem.colors.primary[50],
                borderRadius: DesignSystem.borderRadius.md
              }}>
                <stat.icon size={20} color={DesignSystem.colors.primary[600]} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: DesignSystem.spacing[1] }}>
              <Typography variant="body-sm" style={{ 
                color: DesignSystem.colors.success[600],
                fontWeight: DesignSystem.typography.fontWeight.medium
              }}>
                {stat.change}
              </Typography>
              <Typography variant="body-sm" style={{ 
                color: DesignSystem.colors.neutral[600]
              }}>
                vs last month
              </Typography>
            </div>
          </div>
        ))}  
      </div>

      {/* Pipeline Health Section */}
      {dashboardData?.pipelineHealth && (
        <div style={{
          backgroundColor: DesignSystem.colors.neutral[50],
          borderRadius: DesignSystem.borderRadius.lg,
          padding: DesignSystem.spacing[6],
          border: `1px solid ${DesignSystem.colors.neutral[200]}`,
          boxShadow: DesignSystem.shadows.sm,
          marginBottom: DesignSystem.spacing[6]
        }}>
          <Typography variant="heading-lg" style={{ 
            color: DesignSystem.colors.neutral[900],
            marginBottom: DesignSystem.spacing[6]
          }}>
            Pipeline Health
          </Typography>
          
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: DesignSystem.spacing[6]
          }}>
            {/* Deals Pipeline */}
            <div style={{
              backgroundColor: DesignSystem.colors.neutral[50],
              borderRadius: DesignSystem.borderRadius.md,
              padding: DesignSystem.spacing[4]
            }}>
              <Typography variant="heading-md" style={{ 
                color: DesignSystem.colors.neutral[900],
                marginBottom: DesignSystem.spacing[4]
              }}>
                Deals Pipeline ({dashboardData.pipelineHealth.deals} total)
              </Typography>
              <div style={{ display: 'grid', gap: DesignSystem.spacing[2] }}>
                {dashboardData.pipelineHealth.dealsByStage && Object.entries(dashboardData.pipelineHealth.dealsByStage).map(([stage, count]) => (
                  <div key={stage} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: DesignSystem.spacing[2],
                    backgroundColor: DesignSystem.colors.primary[50],
                    borderRadius: DesignSystem.borderRadius.sm
                  }}>
                    <Typography variant="body-md" style={{ color: DesignSystem.colors.neutral[800] }}>
                      {stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Typography>
                    <Typography variant="body-md" style={{ 
                      color: DesignSystem.colors.primary[700],
                      fontWeight: DesignSystem.typography.fontWeight.semibold
                    }}>
                      {String(count)}
                    </Typography>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Tickets Pipeline */}
            <div style={{
              backgroundColor: DesignSystem.colors.neutral[50],
              borderRadius: DesignSystem.borderRadius.md,
              padding: DesignSystem.spacing[4]
            }}>
              <Typography variant="heading-md" style={{ 
                color: DesignSystem.colors.neutral[900],
                marginBottom: DesignSystem.spacing[4]
              }}>
                Tickets Pipeline ({dashboardData.pipelineHealth.tickets} total)
              </Typography>
              <div style={{ display: 'grid', gap: DesignSystem.spacing[2] }}>
                {dashboardData.pipelineHealth.ticketsByStage && Object.entries(dashboardData.pipelineHealth.ticketsByStage).map(([stage, count]) => (
                  <div key={stage} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: DesignSystem.spacing[2],
                    backgroundColor: DesignSystem.colors.warning[50],
                    borderRadius: DesignSystem.borderRadius.sm
                  }}>
                    <Typography variant="body-md" style={{ color: DesignSystem.colors.neutral[800] }}>
                      {stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Typography>
                    <Typography variant="body-md" style={{ 
                      color: DesignSystem.colors.warning[700],
                      fontWeight: DesignSystem.typography.fontWeight.semibold
                    }}>
                      {String(count)}
                    </Typography>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Sync Status */}
            <div style={{
              backgroundColor: DesignSystem.colors.neutral[50],
              borderRadius: DesignSystem.borderRadius.md,
              padding: DesignSystem.spacing[4]
            }}>
              <Typography variant="heading-md" style={{ 
                color: DesignSystem.colors.neutral[900],
                marginBottom: DesignSystem.spacing[4]
              }}>
                Sync Status
              </Typography>
              <div style={{ display: 'grid', gap: DesignSystem.spacing[3] }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: DesignSystem.spacing[2] }}>
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: dashboardData.syncStatus?.syncHealth === 'healthy' ? 
                      DesignSystem.colors.success[500] : DesignSystem.colors.warning[500]
                  }} />
                  <Typography variant="body-md" style={{ color: DesignSystem.colors.neutral[800] }}>
                    Status: {dashboardData.syncStatus?.syncHealth || 'Unknown'}
                  </Typography>
                </div>
                <Typography variant="body-sm" style={{ color: DesignSystem.colors.neutral[600] }}>
                  Last Sync: {dashboardData.syncStatus?.lastSyncTime ? 
                    new Date(dashboardData.syncStatus.lastSyncTime).toLocaleString() : 'Never'}
                </Typography>
                <Typography variant="body-sm" style={{ color: DesignSystem.colors.neutral[600] }}>
                  Errors: {dashboardData.syncStatus?.errorCount || 0}
                </Typography>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: DesignSystem.spacing[6]
      }}>
        {/* Quick Actions */}
        <div style={{
          backgroundColor: DesignSystem.colors.neutral[50],
          borderRadius: DesignSystem.borderRadius.lg,
          padding: DesignSystem.spacing[6],
          border: `1px solid ${DesignSystem.colors.neutral[200]}`,
          boxShadow: DesignSystem.shadows.sm
        }}>
          <Typography variant="heading-md" style={{ 
            color: DesignSystem.colors.neutral[900],
            marginBottom: DesignSystem.spacing[4]
          }}>
            Quick Actions
          </Typography>
          
          <div style={{ 
            display: 'grid',
            gap: DesignSystem.spacing[3]
          }}>
            {quickActions.map((action, index) => (
              <div
                key={index}
                onClick={() => {
                  if (action.href) {
                    router.push(action.href);
                  } else if (action.action && !action.loading) {
                    action.action();
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: DesignSystem.spacing[4],
                  padding: DesignSystem.spacing[4],
                  backgroundColor: DesignSystem.colors.neutral[50],
                  borderRadius: DesignSystem.borderRadius.md,
                  border: `1px solid ${DesignSystem.colors.neutral[200]}`,
                  cursor: action.loading ? 'default' : 'pointer',
                  opacity: action.loading ? 0.7 : 1,
                  transition: 'all 0.2s ease-in-out'
                }}
                onMouseEnter={(e) => {
                  if (!action.loading) {
                    e.currentTarget.style.backgroundColor = DesignSystem.colors.neutral[100];
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!action.loading) {
                    e.currentTarget.style.backgroundColor = DesignSystem.colors.neutral[50];
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                <div style={{
                  padding: DesignSystem.spacing[3],
                  backgroundColor: action.color === 'primary' ? DesignSystem.colors.primary[50] :
                                  action.color === 'warning' ? DesignSystem.colors.warning[50] :
                                  DesignSystem.colors.success[50],
                  borderRadius: DesignSystem.borderRadius.md
                }}>
                  <action.icon 
                    size={20} 
                    color={action.color === 'primary' ? DesignSystem.colors.primary[600] :
                           action.color === 'warning' ? DesignSystem.colors.warning[600] :
                           DesignSystem.colors.success[600]} 
                  />
                </div>
                <div>
                  <Typography variant="body-md" style={{ 
                    color: DesignSystem.colors.neutral[900],
                    fontWeight: DesignSystem.typography.fontWeight.medium,
                    marginBottom: DesignSystem.spacing[1]
                  }}>
                    {action.loading ? 'Loading...' : action.title}
                  </Typography>
                  <Typography variant="body-sm" style={{ 
                    color: DesignSystem.colors.neutral[600]
                  }}>
                    {action.description}
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{
          backgroundColor: DesignSystem.colors.neutral[50],
          borderRadius: DesignSystem.borderRadius.lg,
          padding: DesignSystem.spacing[6],
          border: `1px solid ${DesignSystem.colors.neutral[200]}`,
          boxShadow: DesignSystem.shadows.sm
        }}>
          <Typography variant="heading-md" style={{ 
            color: DesignSystem.colors.neutral[900],
            marginBottom: DesignSystem.spacing[4]
          }}>
            Recent Activity
          </Typography>
          
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: DesignSystem.spacing[3]
          }}>
            {recentActivity.map((activity: any) => (
              <div
                key={activity.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: DesignSystem.spacing[3],
                  paddingBottom: DesignSystem.spacing[3],
                  borderBottom: `1px solid ${DesignSystem.colors.neutral[200]}`
                }}
              >
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: activity.status === 'success' ? DesignSystem.colors.success[500] :
                                  activity.status === 'error' ? DesignSystem.colors.error[500] :
                                  DesignSystem.colors.primary[500],
                  marginTop: DesignSystem.spacing[1],
                  flexShrink: 0
                }} />
                <div style={{ flex: 1 }}>
                  <Typography variant="body-sm" style={{ 
                    color: DesignSystem.colors.neutral[900],
                    marginBottom: DesignSystem.spacing[1]
                  }}>
                    {activity.message}
                  </Typography>
                  <Typography variant="body-sm" style={{ 
                    color: DesignSystem.colors.neutral[500]
                  }}>
                    {activity.timestamp}
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CRMDashboard;
