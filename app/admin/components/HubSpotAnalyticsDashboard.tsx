'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart, 
  LineChart, 
  Activity, 
  Users, 
  TrendingUp, 
  Mail, 
  Phone,
  Calendar,
  Target,
  Zap,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface HubSpotContact {
  id: string;
  email: string;
  properties: {
    firstname?: string;
    lastname?: string;
    user_role?: string;
    engagement_score?: string;
    feature_usage_score?: string;
    lifecyclestage?: string;
    subscription_status?: string;
    last_activity_date?: string;
    login_count?: string;
  };
}

interface AnalyticsData {
  contact: HubSpotContact;
  analytics: any;
}

interface HubSpotAnalyticsDashboardProps {
  userId?: string;
  email?: string;
  onClose?: () => void;
}

export default function HubSpotAnalyticsDashboard({ 
  userId, 
  email, 
  onClose 
}: HubSpotAnalyticsDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    if (!userId && !email) {
      setError('User ID or email is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (email) params.append('email', email);

      const response = await fetch(`/api/admin/hubspot/analytics?${params}`);
      const data = await response.json();

      if (data.success) {
        setAnalyticsData(data);
      } else {
        setError(data.error || 'Failed to fetch analytics');
      }
    } catch (err) {
      setError('Error fetching HubSpot analytics');
      console.error('HubSpot analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [userId, email]);

  const renderMetricCard = (
    title: string,
    value: string | number,
    icon: React.ReactNode,
    color: string = 'blue'
  ) => (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
        </div>
        <div className={`text-${color}-500`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const getEngagementLevel = (score: number): { level: string; color: string } => {
    if (score >= 80) return { level: 'High', color: 'green' };
    if (score >= 50) return { level: 'Medium', color: 'yellow' };
    return { level: 'Low', color: 'red' };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500 mr-2" />
          <span className="text-gray-600">Loading HubSpot analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-6">
        <div className="flex items-center text-red-600 mb-4">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span className="font-medium">Error Loading Analytics</span>
        </div>
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No HubSpot Data</h3>
          <p className="text-gray-500">This contact hasn't been synced to HubSpot yet.</p>
        </div>
      </div>
    );
  }

  const { contact, analytics } = analyticsData;
  const props = contact.properties;
  
  const engagementScore = parseInt(props.engagement_score || '0');
  const featureUsageScore = parseInt(props.feature_usage_score || '0');
  const loginCount = parseInt(props.login_count || '0');
  
  const engagement = getEngagementLevel(engagementScore);
  const usage = getEngagementLevel(featureUsageScore);

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">HubSpot Analytics</h2>
            <p className="text-sm text-gray-500">
              {props.firstname} {props.lastname} • {contact.email}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={fetchAnalytics}
              className="px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {renderMetricCard(
            'Engagement Score',
            `${engagementScore}/100`,
            <Activity className="w-6 h-6" />,
            engagement.color
          )}
          
          {renderMetricCard(
            'Feature Usage',
            `${featureUsageScore}/100`,
            <BarChart className="w-6 h-6" />,
            usage.color
          )}
          
          {renderMetricCard(
            'Total Logins',
            loginCount,
            <TrendingUp className="w-6 h-6" />,
            'purple'
          )}
          
          {renderMetricCard(
            'Lifecycle Stage',
            props.lifecyclestage || 'Unknown',
            <Target className="w-6 h-6" />,
            'indigo'
          )}
        </div>

        {/* Contact Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Contact Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">User Role:</span>
                <span className="font-medium">{props.user_role || 'FREE'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Subscription:</span>
                <span className="font-medium">{props.subscription_status || 'Free'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lifecycle Stage:</span>
                <span className="font-medium">{props.lifecyclestage || 'lead'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Activity:</span>
                <span className="font-medium">
                  {props.last_activity_date 
                    ? new Date(props.last_activity_date).toLocaleDateString()
                    : 'Unknown'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Engagement Metrics */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Engagement Metrics
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Engagement Level</span>
                  <span className={`font-medium text-${engagement.color}-600`}>
                    {engagement.level}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`bg-${engagement.color}-500 h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${engagementScore}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Feature Usage</span>
                  <span className={`font-medium text-${usage.color}-600`}>
                    {usage.level}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`bg-${usage.color}-500 h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${featureUsageScore}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* HubSpot Contact Link */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <a
            href={`https://app.hubspot.com/contacts/242953242/contact/${contact.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <Mail className="w-4 h-4 mr-1" />
            View in HubSpot
          </a>
        </div>
      </div>
    </div>
  );
}
