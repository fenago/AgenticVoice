'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  Phone,
  Mail,
  FileText,
  CheckSquare,
  Users,
  TrendingUp,
  Plus,
  Filter,
  Search,
  BarChart3,
  Activity,
  Zap,
  MoreVertical,
  Star,
  ArrowUpRight,
  Target,
  Award,
  Upload,
  Copy,
  RefreshCw
} from 'lucide-react';
import CreateEngagementModal from './components/CreateEngagementModal';
import { EngagementDetailsModal } from './components/EngagementDetailsModal';

interface Engagement {
  id: string;
  type: 'note' | 'task' | 'call' | 'email' | 'meeting';
  title: string;
  description?: string;
  contactId: string;
  contactName: string;
  contactEmail: string;
  dealId?: string;
  dealName?: string;
  status: 'pending' | 'completed' | 'scheduled' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  createdBy: string;
  assignedTo?: string;
  duration?: number; // minutes
  outcome?: string;
  score?: number; // engagement quality score 1-10
}

interface EngagementStats {
  totalEngagements: number;
  completedEngagements: number;
  pendingEngagements: number;
  scheduledEngagements: number;
  averageEngagementScore: number;
  engagementsByType: {
    [key: string]: number;
  };
  engagementsByStatus: {
    completed: number;
    pending: number;
    scheduled: number;
  };
  engagementsByPriority: {
    urgent: number;
    high: number;
    medium: number;
    low: number;
  };
  topPerformingEngagements: Array<{
    id: string;
    title: string;
    contactName: string;
    score: number;
    outcome: string;
  }>;
  recentActivities: Array<{
    id: string;
    type: string;
    title: string;
    contactName: string;
    timestamp: string;
    status: string;
  }>;
  engagementTrends: {
    thisWeek: {
      total: number;
      completed: number;
      pending: number;
      averageScore: number;
    };
    lastWeek: {
      total: number;
      completed: number;
      pending: number;
      averageScore: number;
    };
    thisMonth: {
      total: number;
      completed: number;
      pending: number;
      averageScore: number;
    };
    lastMonth: {
      total: number;
      completed: number;
      pending: number;
      averageScore: number;
    };
  };
}

export default function EngagementsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [stats, setStats] = useState<EngagementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'activities' | 'calendar' | 'scoring' | 'bulk'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'note' | 'task' | 'call' | 'email' | 'meeting'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'scheduled'>('all');
  
  // Calendar states
  const [calendarView, setCalendarView] = useState<'week' | 'month' | 'agenda'>('agenda');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEngagement, setSelectedEngagement] = useState<Engagement | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (session?.user) {
      fetchEngagements();
      fetchStats();
    }
  }, [session, status, router]);

  const fetchEngagements = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/crm/engagements');
      if (response.ok) {
        const data = await response.json();
        setEngagements(data.engagements || []);
      }
    } catch (error) {
      console.error('Error fetching engagements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/crm/engagements/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching engagement stats:', error);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'note': return <FileText size={16} />;
      case 'task': return <CheckSquare size={16} />;
      case 'call': return <Phone size={16} />;
      case 'email': return <Mail size={16} />;
      case 'meeting': return <Calendar size={16} />;
      default: return <Activity size={16} />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'note': return '#3b82f6';
      case 'task': return '#10b981';
      case 'call': return '#f59e0b';
      case 'email': return '#8b5cf6';
      case 'meeting': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#ca8a04';
      case 'low': return '#059669';
      default: return '#6b7280';
    }
  };

  // Engagement handlers
  const handleCreateEngagement = async (newEngagement: any) => {
    try {
      const response = await fetch('/api/admin/crm/engagements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEngagement)
      });
      
      if (response.ok) {
        const result = await response.json();
        setEngagements(prev => [result.engagement, ...prev]);
        fetchStats(); // Refresh stats
        console.log('✅ Engagement created successfully');
      }
    } catch (error) {
      console.error('❌ Error creating engagement:', error);
    }
  };

  const handleUpdateEngagement = async (id: string, updates: any) => {
    try {
      const response = await fetch('/api/admin/crm/engagements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });
      
      if (response.ok) {
        setEngagements(prev => prev.map(eng => 
          eng.id === id ? { ...eng, ...updates } : eng
        ));
        fetchStats(); // Refresh stats
        console.log('✅ Engagement updated successfully');
      }
    } catch (error) {
      console.error('❌ Error updating engagement:', error);
    }
  };

  const handleViewEngagement = (engagement: Engagement) => {
    setSelectedEngagement(engagement);
    setShowDetailsModal(true);
  };

  const filteredEngagements = engagements.filter(engagement => {
    const matchesSearch = engagement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         engagement.contactName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || engagement.type === filterType;
    const matchesStatus = filterStatus === 'all' || engagement.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Computed property for scheduled engagements (for Calendar view)
  const scheduledEngagements = engagements.filter(engagement => 
    engagement.status === 'scheduled' && engagement.scheduledAt
  ).sort((a, b) => 
    new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime()
  );

  if (status === 'loading' || loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        fontSize: '18px',
        color: '#6b7280'
      }}>
        Loading engagements...
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: '#111827',
            margin: '0 0 8px 0'
          }}>
            📞 Engagements Hub
          </h1>
          <p style={{ 
            fontSize: '1rem', 
            color: '#6b7280',
            margin: 0
          }}>
            Track activities, interactions, and engagement quality across your CRM
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={16} />
            New Activity
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px',
          marginBottom: '32px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <Activity size={20} color="#3b82f6" />
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                Total Activities
              </h3>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6', margin: 0 }}>
              {stats.totalEngagements.toLocaleString()}
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <CheckSquare size={20} color="#10b981" />
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                Completed Today
              </h3>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981', margin: 0 }}>
              {stats.completedEngagements}
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <Clock size={20} color="#f59e0b" />
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                Scheduled Upcoming
              </h3>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b', margin: 0 }}>
              {stats.scheduledEngagements}
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <TrendingUp size={20} color="#8b5cf6" />
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                Avg. Engagement Score
              </h3>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6', margin: 0 }}>
              {stats.averageEngagementScore.toFixed(1)}/10
            </p>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '1px solid #e5e7eb',
        marginBottom: '24px'
      }}>
        {[
          { id: 'dashboard', label: '📊 Dashboard', icon: BarChart3 },
          { id: 'activities', label: '📝 Activities', icon: Activity },
          { id: 'calendar', label: '📅 Calendar', icon: Calendar },
          { id: 'scoring', label: '🎯 Scoring', icon: TrendingUp },
          { id: 'bulk', label: '⚡ Bulk Actions', icon: Zap }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
              color: activeTab === tab.id ? '#3b82f6' : '#6b7280',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ minHeight: '400px' }}>
        {activeTab === 'dashboard' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>
              Activity Dashboard
            </h2>
            
            {/* Activity Breakdown Chart */}
            {stats && (
              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                marginBottom: '24px'
              }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                  Activity Breakdown
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  {Object.entries(stats.engagementsByType).map(([type, count]) => (
                    <div key={type} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '6px'
                    }}>
                      <div style={{ color: getActivityColor(type) }}>
                        {getActivityIcon(type)}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827', textTransform: 'capitalize' }}>
                          {type}
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: getActivityColor(type) }}>
                          {count}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Activities Preview */}
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                Recent Activities
              </h3>
              {stats && stats.recentActivities && stats.recentActivities.length > 0 ? (
                stats.recentActivities.map((activity) => (
                  <div 
                    key={activity.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 0',
                      borderBottom: '1px solid #f3f4f6',
                      borderRadius: '4px'
                    }}
                  >
                    <div style={{ color: getActivityColor(activity.type) }}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                        {activity.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {activity.contactName} • {activity.timestamp ? new Date(activity.timestamp).toLocaleDateString() : 'No date'}
                      </div>
                    </div>
                    <div style={{
                      padding: '4px 8px',
                      backgroundColor: activity.status === 'completed' ? '#dcfce7' : 
                                     activity.status === 'scheduled' ? '#fef3c7' : '#f3f4f6',
                      color: activity.status === 'completed' ? '#166534' : 
                             activity.status === 'scheduled' ? '#92400e' : '#374151',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500',
                      textTransform: 'capitalize'
                    }}>
                      {activity.status}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                  No recent activities found. Check your HubSpot integration.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'activities' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                All Activities
              </h2>
              
              {/* Search and Filters */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                  <input
                    type="text"
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      paddingLeft: '40px',
                      paddingRight: '12px',
                      paddingTop: '8px',
                      paddingBottom: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      width: '250px'
                    }}
                  />
                </div>
                
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                >
                  <option value="all">All Types</option>
                  <option value="note">Notes</option>
                  <option value="task">Tasks</option>
                  <option value="call">Calls</option>
                  <option value="email">Emails</option>
                  <option value="meeting">Meetings</option>
                </select>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
            </div>

            {/* Activities List */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              {filteredEngagements.length === 0 ? (
                <div style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>
                  No activities found matching your criteria.
                </div>
              ) : (
                filteredEngagements.map((engagement) => (
                  <div 
                    key={engagement.id} 
                    onClick={() => handleViewEngagement(engagement)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px 24px',
                      borderBottom: '1px solid #f3f4f6',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ color: getActivityColor(engagement.type) }}>
                      {getActivityIcon(engagement.type)}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '500', color: '#111827', margin: 0 }}>
                          {engagement.title}
                        </h4>
                        <div style={{
                          padding: '2px 6px',
                          backgroundColor: getPriorityColor(engagement.priority) + '20',
                          color: getPriorityColor(engagement.priority),
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          {engagement.priority}
                        </div>
                      </div>
                      
                      <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                        {engagement.contactName} • {engagement.contactEmail}
                        {engagement.dealName && ` • Deal: ${engagement.dealName}`}
                      </div>
                      
                      {engagement.description && (
                        <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
                          {engagement.description}
                        </div>
                      )}
                      
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                        Created: {new Date(engagement.createdAt).toLocaleDateString()} • 
                        {engagement.scheduledAt && ` Scheduled: ${new Date(engagement.scheduledAt).toLocaleDateString()}`}
                        {engagement.completedAt && ` Completed: ${new Date(engagement.completedAt).toLocaleDateString()}`}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {engagement.score && (
                        <div style={{
                          padding: '4px 8px',
                          backgroundColor: engagement.score >= 8 ? '#dcfce7' : engagement.score >= 6 ? '#fef3c7' : '#fee2e2',
                          color: engagement.score >= 8 ? '#166534' : engagement.score >= 6 ? '#92400e' : '#dc2626',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          Score: {engagement.score}/10
                        </div>
                      )}
                      
                      <div style={{
                        padding: '4px 8px',
                        backgroundColor: engagement.status === 'completed' ? '#dcfce7' : 
                                       engagement.status === 'scheduled' ? '#fef3c7' : 
                                       engagement.status === 'pending' ? '#fef2f2' : '#f3f4f6',
                        color: engagement.status === 'completed' ? '#166534' : 
                               engagement.status === 'scheduled' ? '#92400e' : 
                               engagement.status === 'pending' ? '#dc2626' : '#374151',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        textTransform: 'capitalize'
                      }}>
                        {engagement.status}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Calendar View */}
        {activeTab === 'calendar' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                📅 Engagement Calendar
              </h2>
              <div style={{ display: 'flex', gap: '12px' }}>
                <select
                  value={calendarView}
                  onChange={(e) => setCalendarView(e.target.value as any)}
                  style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                >
                  <option value="week">Week View</option>
                  <option value="month">Month View</option>
                  <option value="agenda">Agenda View</option>
                </select>
                <button
                  onClick={() => setShowCreateModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={16} />
                  Schedule Activity
                </button>
              </div>
            </div>

            {calendarView === 'agenda' && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#111827', margin: 0 }}>Upcoming Activities</h3>
                </div>
                {scheduledEngagements.length === 0 ? (
                  <div style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>
                    No scheduled activities found.
                  </div>
                ) : (
                  <div style={{ padding: '20px' }}>
                    {scheduledEngagements.map((engagement: Engagement) => (
                      <div 
                        key={engagement.id}
                        onClick={() => handleViewEngagement(engagement)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          padding: '16px',
                          marginBottom: '12px',
                          backgroundColor: '#f9fafb',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <div style={{ color: getActivityColor(engagement.type) }}>
                          {getActivityIcon(engagement.type)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <h4 style={{ fontSize: '16px', fontWeight: '500', color: '#111827', margin: 0 }}>
                              {engagement.title}
                            </h4>
                            <div style={{
                              padding: '2px 6px',
                              backgroundColor: getPriorityColor(engagement.priority) + '20',
                              color: getPriorityColor(engagement.priority),
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '600',
                              textTransform: 'uppercase'
                            }}>
                              {engagement.priority}
                            </div>
                          </div>
                          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                            👤 {engagement.contactName} • 📧 {engagement.contactEmail}
                          </div>
                          <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                            📅 {engagement.scheduledAt ? new Date(engagement.scheduledAt).toLocaleString() : 'No date set'}
                            {engagement.duration && ` • ⏱️ ${engagement.duration} minutes`}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            padding: '4px 8px',
                            backgroundColor: engagement.status === 'scheduled' ? '#fef3c7' : '#f3f4f6',
                            color: engagement.status === 'scheduled' ? '#92400e' : '#374151',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500',
                            textTransform: 'capitalize'
                          }}>
                            {engagement.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {(calendarView === 'week' || calendarView === 'month') && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                padding: '20px'
              }}>
                <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                    {calendarView === 'week' ? 'This Week' : 'This Month'} Schedule
                  </h3>
                  <p style={{ color: '#6b7280', margin: 0 }}>
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', backgroundColor: '#e5e7eb' }}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} style={{
                      padding: '12px',
                      backgroundColor: 'white',
                      textAlign: 'center',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151'
                    }}>
                      {day}
                    </div>
                  ))}
                  
                  {Array.from({ length: 35 }, (_, i) => {
                    const date = new Date();
                    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
                    const dayOfWeek = startOfMonth.getDay();
                    const dayNumber = i - dayOfWeek + 1;
                    const currentDate = new Date(date.getFullYear(), date.getMonth(), dayNumber);
                    const isCurrentMonth = dayNumber > 0 && dayNumber <= new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
                    const isToday = isCurrentMonth && dayNumber === date.getDate();
                    
                    const dayEngagements = scheduledEngagements.filter((engagement: Engagement) => 
                      engagement.scheduledAt && 
                      new Date(engagement.scheduledAt).toDateString() === currentDate.toDateString()
                    );
                    
                    return (
                      <div key={i} style={{
                        minHeight: '80px',
                        padding: '8px',
                        backgroundColor: isCurrentMonth ? 'white' : '#f9fafb',
                        border: isToday ? '2px solid #2563eb' : 'none',
                        position: 'relative'
                      }}>
                        {isCurrentMonth && (
                          <>
                            <div style={{
                              fontSize: '14px',
                              fontWeight: isToday ? '600' : '400',
                              color: isToday ? '#2563eb' : '#374151',
                              marginBottom: '4px'
                            }}>
                              {dayNumber}
                            </div>
                            {dayEngagements.slice(0, 2).map((engagement: Engagement, idx: number) => (
                              <div key={idx} style={{
                                fontSize: '10px',
                                padding: '2px 4px',
                                backgroundColor: getActivityColor(engagement.type) + '20',
                                color: getActivityColor(engagement.type),
                                borderRadius: '3px',
                                marginBottom: '2px',
                                cursor: 'pointer',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {engagement.title}
                              </div>
                            ))}
                            {dayEngagements.length > 2 && (
                              <div style={{
                                fontSize: '10px',
                                color: '#6b7280',
                                textAlign: 'center',
                                marginTop: '2px'
                              }}>
                                +{dayEngagements.length - 2} more
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Scoring Dashboard */}
        {activeTab === 'scoring' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                🎯 Engagement Scoring Analytics
              </h2>
              <button
                onClick={fetchStats}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                <TrendingUp size={16} />
                Refresh Scores
              </button>
            </div>

            {/* Scoring Overview Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ padding: '8px', backgroundColor: '#dbeafe', borderRadius: '6px' }}>
                    <Award size={20} style={{ color: '#2563eb' }} />
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>Average Score</h3>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2563eb', marginBottom: '4px' }}>
                  {stats?.averageEngagementScore ? stats.averageEngagementScore.toFixed(1) : '0.0'}/10
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  Across all engagements
                </div>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ padding: '8px', backgroundColor: '#dcfce7', borderRadius: '6px' }}>
                    <Star size={20} style={{ color: '#16a34a' }} />
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>High-Score Activities</h3>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#16a34a', marginBottom: '4px' }}>
                  {engagements.filter(e => e.score && e.score >= 8).length}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  Score 8+ out of {engagements.length} total
                </div>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ padding: '8px', backgroundColor: '#fef3c7', borderRadius: '6px' }}>
                    <Target size={20} style={{ color: '#d97706' }} />
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>Score Distribution</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Excellent (8-10)</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#16a34a' }}>
                      {engagements.filter(e => e.score && e.score >= 8).length}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Good (6-7)</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#d97706' }}>
                      {engagements.filter(e => e.score && e.score >= 6 && e.score < 8).length}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Needs Improvement (&lt;6)</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#dc2626' }}>
                      {engagements.filter(e => e.score && e.score < 6).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Performing Engagements */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              marginBottom: '24px'
            }}>
              <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#111827', margin: 0 }}>Top Performing Engagements</h3>
              </div>
              {stats?.topPerformingEngagements && stats.topPerformingEngagements.length > 0 ? (
                <div style={{ padding: '20px' }}>
                  {stats.topPerformingEngagements.map((engagement: any, index: number) => (
                    <div key={engagement.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px',
                      marginBottom: '12px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        backgroundColor: index === 0 ? '#fbbf24' : index === 1 ? '#d1d5db' : '#cd7c2f',
                        borderRadius: '50%',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: 'white'
                      }}>
                        #{index + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <h4 style={{ fontSize: '16px', fontWeight: '500', color: '#111827', margin: 0 }}>
                            {engagement.title}
                          </h4>
                          <div style={{
                            padding: '4px 8px',
                            backgroundColor: '#dcfce7',
                            color: '#166534',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            Score: {engagement.score}/10
                          </div>
                        </div>
                        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                          👤 {engagement.contactName}
                        </div>
                        {engagement.outcome && (
                          <div style={{ fontSize: '13px', color: '#374151', fontStyle: 'italic' }}>
                            "🎯 {engagement.outcome}"
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>
                  No scored engagements found. Complete some activities to see performance metrics.
                </div>
              )}
            </div>

            {/* Score Improvement Tips */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#111827', margin: 0 }}>Score Improvement Tips</h3>
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                  <div style={{ padding: '16px', backgroundColor: '#fef3c7', borderRadius: '6px', border: '1px solid #f59e0b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Phone size={16} style={{ color: '#d97706' }} />
                      <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#92400e', margin: 0 }}>Calls Score Higher</h4>
                    </div>
                    <p style={{ fontSize: '13px', color: '#78350f', margin: 0 }}>
                      Phone calls typically receive +3 bonus points. Schedule more calls for better engagement scores.
                    </p>
                  </div>
                  
                  <div style={{ padding: '16px', backgroundColor: '#dbeafe', borderRadius: '6px', border: '1px solid #3b82f6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Calendar size={16} style={{ color: '#2563eb' }} />
                      <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1d4ed8', margin: 0 }}>Meetings Drive Results</h4>
                    </div>
                    <p style={{ fontSize: '13px', color: '#1e40af', margin: 0 }}>
                      Meeting activities get +4 bonus points and show stronger commitment to relationship building.
                    </p>
                  </div>
                  
                  <div style={{ padding: '16px', backgroundColor: '#dcfce7', borderRadius: '6px', border: '1px solid #10b981' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <FileText size={16} style={{ color: '#059669' }} />
                      <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#047857', margin: 0 }}>Document Outcomes</h4>
                    </div>
                    <p style={{ fontSize: '13px', color: '#065f46', margin: 0 }}>
                      Add detailed outcomes and next steps to increase the value score of your engagements.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Bulk Actions */}
        {activeTab === 'bulk' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                🏃‍♂️ Bulk Engagement Actions
              </h2>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowCreateModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    backgroundColor: '#6366f1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={16} />
                  Quick Create
                </button>
              </div>
            </div>

            {/* Bulk Action Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              {/* Bulk Task Creation */}
              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ padding: '10px', backgroundColor: '#ede9fe', borderRadius: '8px' }}>
                    <CheckSquare size={24} style={{ color: '#7c3aed' }} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>Bulk Task Creation</h3>
                </div>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px', lineHeight: '1.5' }}>
                  Create multiple follow-up tasks at once. Perfect for setting reminders after meetings or events.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#374151', fontWeight: '500' }}>Common Templates:</div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>
                    • Follow up on proposal (3 days)
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>
                    • Schedule demo call (1 week)
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>
                    • Send contract terms (5 days)
                  </div>
                </div>
                <button
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    backgroundColor: '#7c3aed',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                  onClick={() => alert('Bulk task creation feature coming soon!')}
                >
                  Create Bulk Tasks
                </button>
              </div>

              {/* Email Sequence */}
              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ padding: '10px', backgroundColor: '#dbeafe', borderRadius: '8px' }}>
                    <Mail size={24} style={{ color: '#2563eb' }} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>Email Sequences</h3>
                </div>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px', lineHeight: '1.5' }}>
                  Set up automated email follow-up sequences for leads, prospects, or existing customers.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#374151', fontWeight: '500' }}>Available Sequences:</div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>
                    • New Lead Nurturing (5 emails)
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>
                    • Post-Demo Follow-up (3 emails)
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>
                    • Customer Onboarding (7 emails)
                  </div>
                </div>
                <button
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                  onClick={() => alert('Email sequence builder coming soon!')}
                >
                  Setup Email Sequence
                </button>
              </div>

              {/* Meeting Scheduler */}
              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ padding: '10px', backgroundColor: '#dcfce7', borderRadius: '8px' }}>
                    <Calendar size={24} style={{ color: '#16a34a' }} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>Bulk Meeting Scheduler</h3>
                </div>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px', lineHeight: '1.5' }}>
                  Schedule multiple meetings with different contacts using time slot templates and availability windows.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#374151', fontWeight: '500' }}>Meeting Types:</div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>
                    • Discovery Calls (30 min)
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>
                    • Product Demos (45 min)
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>
                    • Check-in Calls (15 min)
                  </div>
                </div>
                <button
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    backgroundColor: '#16a34a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                  onClick={() => alert('Bulk meeting scheduler coming soon!')}
                >
                  Schedule Meetings
                </button>
              </div>

              {/* Data Import */}
              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ padding: '10px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
                    <Upload size={24} style={{ color: '#d97706' }} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>Import Engagements</h3>
                </div>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px', lineHeight: '1.5' }}>
                  Import engagement data from CSV files, other CRM systems, or calendar applications.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#374151', fontWeight: '500' }}>Supported Formats:</div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>
                    • CSV/Excel files
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>
                    • Salesforce exports
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>
                    • Google Calendar
                  </div>
                </div>
                <button
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    backgroundColor: '#d97706',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                  onClick={() => alert('Data import feature coming soon!')}
                >
                  Import Data
                </button>
              </div>
            </div>

            {/* Recent Bulk Operations */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              marginBottom: '24px'
            }}>
              <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#111827', margin: 0 }}>Recent Bulk Operations</h3>
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ textAlign: 'center', color: '#6b7280', padding: '48px' }}>
                  <Activity size={48} style={{ color: '#d1d5db', marginBottom: '16px' }} />
                  <p style={{ fontSize: '16px', margin: '0 0 8px 0' }}>No bulk operations yet</p>
                  <p style={{ fontSize: '14px', margin: 0 }}>Your bulk action history will appear here once you start using these features.</p>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#111827', margin: 0 }}>Quick Actions</h3>
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 16px',
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <Plus size={16} style={{ color: '#6366f1' }} />
                    Create Single Engagement
                  </button>
                  
                  <button
                    onClick={() => alert('Feature coming soon!')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 16px',
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <Copy size={16} style={{ color: '#10b981' }} />
                    Duplicate Engagements
                  </button>
                  
                  <button
                    onClick={() => alert('Feature coming soon!')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 16px',
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <Users size={16} style={{ color: '#f59e0b' }} />
                    Assign to Team
                  </button>
                  
                  <button
                    onClick={fetchEngagements}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 16px',
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <RefreshCw size={16} style={{ color: '#6b7280' }} />
                    Refresh Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal Components */}
      <CreateEngagementModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateEngagement}
      />
      
      <EngagementDetailsModal
        engagement={selectedEngagement}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedEngagement(null);
        }}
        onUpdate={handleUpdateEngagement}
      />
    </div>
  );
}
