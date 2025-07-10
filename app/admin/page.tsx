'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, Button, Badge, LoadingSpinner } from '@/components/ui';
import UserManagement from '@/components/admin/UserManagement';
import RoleManagement from '@/components/admin/RoleManagement';
import BillingManagement from '@/components/admin/BillingManagement';
import SecurityManager from '@/components/admin/SecurityManager';
import SystemConfig from '@/components/admin/SystemConfig';
import MarketInsights from '@/components/admin/MarketInsights';
import { UserRole } from '@/types/auth';
import { 
  Users, 
  CreditCard, 
  Shield, 
  Settings, 
  BarChart3,
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Crown,
  Info,
  RefreshCw,
  Search
} from 'lucide-react';

// Real system stats interface
interface SystemStats {
  overview: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    activationRate: number;
    emailVerifiedUsers: number;
    verificationRate: number;
    averageLoginsPerUser: number;
    totalLogins: number;
  };
  sessions: {
    total: number;
    active: number;
    activePercentage: number;
  };
  distribution: {
    roles: Array<{ role: string; count: number; percentage: number }>;
    industries: Array<{ industry: string; count: number; percentage: number }>;
    statuses: Array<{ status: string; count: number; percentage: number }>;
  };
  recentActivity: Array<{
    id: string;
    email: string;
    name: string;
    role: string;
    industry: string;
    joinedAt: string;
  }>;
  generatedAt: string;
}

interface AlertsData {
  alerts: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    severity: string;
    timestamp: string;
    action?: string;
    actionUrl?: string;
  }>;
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    info: number;
    low: number;
  };
  lastUpdated: string;
}

// Role definitions for admin reference
const roleDefinitions = [
  {
    role: UserRole.FREE,
    name: 'Free',
    description: 'Basic access with limited features and trial capabilities',
    permissions: ['Basic dashboard access', 'Limited API calls', '1 assistant'],
    color: 'bg-gray-100 text-gray-800'
  },
  {
    role: UserRole.ESSENTIAL,
    name: 'Essential',
    description: 'Enhanced features for small businesses and solo professionals',
    permissions: ['Full dashboard', 'Standard API limits', '3 assistants', 'Basic analytics'],
    color: 'bg-blue-100 text-blue-800'
  },
  {
    role: UserRole.PRO,
    name: 'Pro',
    description: 'Professional features for growing businesses',
    permissions: ['Advanced analytics', 'Higher API limits', '10 assistants', 'Priority support'],
    color: 'bg-purple-100 text-purple-800'
  },
  {
    role: UserRole.ENTERPRISE,
    name: 'Enterprise',
    description: 'Full feature set for large organizations',
    permissions: ['Unlimited assistants', 'Custom integrations', 'SLA support', 'White-label options'],
    color: 'bg-green-100 text-green-800'
  },
  {
    role: UserRole.CUSTOM,
    name: 'Custom',
    description: 'Custom pricing and features for special client needs',
    permissions: ['Negotiated features', 'Custom pricing', 'Dedicated support'],
    color: 'bg-orange-100 text-orange-800'
  },
  {
    role: UserRole.ADMIN,
    name: 'Admin',
    description: 'Platform administration access for support staff',
    permissions: ['User management', 'Basic system config', 'Support tools', 'Read analytics'],
    color: 'bg-red-100 text-red-800'
  },
  {
    role: UserRole.MARKETING,
    name: 'Marketing',
    description: 'Marketing team access for campaigns and content management',
    permissions: ['Campaign management', 'Content editing', 'Analytics access', 'Lead management'],
    color: 'bg-pink-100 text-pink-800'
  },
  {
    role: UserRole.GOD_MODE,
    name: 'God Mode',
    description: 'Full platform control and access to all features',
    permissions: ['Full system access', 'Database management', 'All admin features', 'Platform configuration'],
    color: 'bg-yellow-100 text-yellow-800'
  }
];

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [alertsData, setAlertsData] = useState<AlertsData | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch real analytics data
  const fetchAnalytics = async () => {
    try {
      setIsLoadingStats(true);
      const response = await fetch('/api/admin/analytics?range=30d&charts=false');
      if (response.ok) {
        const data = await response.json();
        setSystemStats(data);
      } else {
        console.error('Failed to fetch analytics:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Fetch real alerts data
  const fetchAlerts = async () => {
    try {
      setIsLoadingAlerts(true);
      const response = await fetch('/api/admin/alerts?competitive=true');
      if (response.ok) {
        const data = await response.json();
        setAlertsData(data);
      } else {
        console.error('Failed to fetch alerts:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setIsLoadingAlerts(false);
    }
  };

  // Refresh all data
  const refreshData = async () => {
    setLastRefresh(new Date());
    await Promise.all([fetchAnalytics(), fetchAlerts()]);
  };

  // Load data on component mount
  useEffect(() => {
    if (session?.user) {
      fetchAnalytics();
      fetchAlerts();
    }
  }, [session]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === 'dashboard') {
        refreshData();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [activeTab]);

  const getDashboardContent = () => (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
          <p className="text-gray-600">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <Button 
          onClick={refreshData}
          variant="outline"
          disabled={isLoadingStats || isLoadingAlerts}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${(isLoadingStats || isLoadingAlerts) ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* System Status Cards */}
      {isLoadingStats ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : systemStats ? (
        <>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{systemStats.overview.totalUsers.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">
                    {systemStats.overview.newUsers} new in 30 days
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-3xl font-bold text-gray-900">{systemStats.overview.activeUsers.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">
                    {systemStats.overview.activationRate}% activation rate
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Email Verified</p>
                  <p className="text-3xl font-bold text-gray-900">{systemStats.overview.emailVerifiedUsers.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">
                    {systemStats.overview.verificationRate}% verification rate
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                  <p className="text-3xl font-bold text-gray-900">{systemStats.sessions.active.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">
                    {systemStats.sessions.activePercentage}% of total sessions
                  </p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </Card>
          </div>

          {/* Role Distribution */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">User Role Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {systemStats.distribution.roles.map((role) => (
                <div key={role.role} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{role.count}</div>
                  <div className="text-sm text-gray-600">{role.role}</div>
                  <div className="text-xs text-gray-500">{role.percentage}%</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent User Activity</h3>
            <div className="space-y-3">
              {systemStats.recentActivity.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{user.name || user.email}</div>
                    <div className="text-sm text-gray-600">{user.role} • {user.industry}</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {isClient ? new Date(user.joinedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '...'}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      ) : (
        <Card className="p-6 text-center">
          <p className="text-gray-600">Failed to load analytics data. Please try refreshing.</p>
        </Card>
      )}

      {/* System Alerts */}
      {isLoadingAlerts ? (
        <Card className="p-6">
          <div className="flex justify-center">
            <LoadingSpinner />
          </div>
        </Card>
      ) : alertsData ? (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">System Alerts</h3>
            <div className="flex items-center space-x-2">
              {alertsData.summary.critical > 0 && (
                <Badge variant="destructive">
                  {alertsData.summary.critical} Critical
                </Badge>
              )}
              {alertsData.summary.high > 0 && (
                <Badge variant="warning">
                  {alertsData.summary.high} High
                </Badge>
              )}
              <Badge variant="secondary">
                {alertsData.summary.total} Total
              </Badge>
            </div>
          </div>
          <div className="space-y-3">
            {alertsData.alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
                alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                alert.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                'border-blue-500 bg-blue-50'
              }`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{alert.title}</div>
                    <div className="text-sm text-gray-600 mt-1">{alert.message}</div>
                    <div className="text-xs text-gray-500 mt-2">
                      {isClient ? new Date(alert.timestamp).toLocaleString() : '...'}
                    </div>
                  </div>
                  {alert.action && (
                    <Button variant="outline" size="sm">
                      {alert.action}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="p-6 text-center">
          <p className="text-gray-600">Failed to load alerts data. Please try refreshing.</p>
        </Card>
      )}

      {/* Database Safety Notice */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Database Configuration</h4>
            <p className="text-sm text-blue-700 mt-1">
              All collections use the "av_" prefix (av_users, av_sessions, etc.) to avoid conflicts 
              with other applications sharing the same MongoDB database.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement />;
      case 'roles':
        return <RoleManagement roleDefinitions={roleDefinitions} />;
      case 'billing':
        return <BillingManagement />;
      case 'security':
        return <SecurityManager />;
      case 'system':
        return <SystemConfig />;
      case 'insights':
        return <MarketInsights />;
      default:
        return getDashboardContent();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {session?.user?.name}. Manage your AgenticVoice.net platform.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="success">System Online</Badge>
            <Badge variant="warning">{alertsData?.summary.total || 0} Alerts</Badge>
            <Button 
              onClick={() => window.location.href = '/admin/users'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Users className="w-4 h-4 mr-2" />
              Manage Users
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'dashboard', label: 'Overview', icon: BarChart3 },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'roles', label: 'Roles & Permissions', icon: Crown },
            { id: 'billing', label: 'Billing', icon: CreditCard },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'system', label: 'System', icon: Settings },
            { id: 'insights', label: 'Market Insights', icon: Search }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}
