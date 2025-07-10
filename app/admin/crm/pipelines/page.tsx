'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  BarChart3, 
  Plus, 
  Settings, 
  ArrowRight, 
  TrendingUp,
  Workflow,
  GitBranch,
  Target,
  Clock,
  Users,
  Edit,
  Trash2,
  Copy,
  Play,
  Pause
} from 'lucide-react';

// Types for pipeline management
interface PipelineStage {
  id: string;
  name: string;
  probability: number;
  requirements: string[];
  order: number;
  color: string;
  closedWon: boolean;
  closedLost: boolean;
}

interface Pipeline {
  id: string;
  name: string;
  type: 'deals' | 'tickets';
  description: string;
  stages: PipelineStage[];
  isDefault: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  analytics: {
    totalDeals: number;
    conversionRate: number;
    averageDealSize: number;
    averageCycleTime: number;
  };
}

interface PipelineTemplate {
  id: string;
  name: string;
  industry: string;
  description: string;
  stages: Omit<PipelineStage, 'id'>[];
}

export default function PipelinesPage() {
  const { data: session, status } = useSession();
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [templates, setTemplates] = useState<PipelineTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPipelines, setLoadingPipelines] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  
  // Form states - individual fields for better control
  const [newPipelineName, setNewPipelineName] = useState('');
  const [newPipelineType, setNewPipelineType] = useState<'deals' | 'tickets'>('deals');
  const [newPipelineDescription, setNewPipelineDescription] = useState('');
  
  // View state
  const [activeTab, setActiveTab] = useState('overview');

  // Check authentication and role
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      window.location.href = '/auth/signin';
      return;
    }

    const userRole = session.user?.role;
    if (!['ADMIN', 'GOD_MODE', 'MARKETING'].includes(userRole || '')) {
      setError('Access denied. Insufficient permissions.');
      return;
    }

    fetchPipelines();
    fetchTemplates();
  }, [session, status]);

  // Fetch pipelines from API
  const fetchPipelines = async () => {
    setLoadingPipelines(true);
    setError('');
    try {
      const response = await fetch('/api/admin/crm/pipelines');
      if (!response.ok) {
        throw new Error(`Failed to fetch pipelines: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setPipelines(data.pipelines || []);
      } else {
        throw new Error(data.error || 'Failed to load pipelines');
      }
    } catch (error) {
      console.error('Error fetching pipelines:', error);
      setError(error instanceof Error ? error.message : 'Failed to load pipelines');
    } finally {
      setLoadingPipelines(false);
    }
  };

  // Fetch pipeline templates
  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const response = await fetch('/api/admin/crm/pipelines/templates');
      if (!response.ok) {
        throw new Error(`Failed to fetch templates: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setTemplates(data.templates || []);
      } else {
        console.warn('Failed to load templates:', data.error);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleCreatePipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/crm/pipelines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPipelineName,
          type: newPipelineType,
          description: newPipelineDescription
        })
      });
      
      if (response.ok) {
        await fetchPipelines();
        setShowCreateModal(false);
        setNewPipelineName('');
        setNewPipelineType('deals');
        setNewPipelineDescription('');
      }
    } catch (error) {
      console.error('Error creating pipeline:', error);
    }
  };

  const handleDeletePipeline = async (pipelineId: string) => {
    if (!confirm('Are you sure you want to delete this pipeline? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/crm/pipelines/${pipelineId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to delete pipeline: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        fetchPipelines(); // Refresh the list
        alert('Pipeline deleted successfully');
      } else {
        throw new Error(data.error || 'Failed to delete pipeline');
      }
    } catch (error) {
      console.error('Error deleting pipeline:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete pipeline');
    }
  };

  const handleTogglePipeline = async (pipelineId: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/crm/pipelines/${pipelineId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive })
      });

      if (!response.ok) {
        throw new Error(`Failed to update pipeline: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        fetchPipelines(); // Refresh the list
      } else {
        throw new Error(data.error || 'Failed to update pipeline');
      }
    } catch (error) {
      console.error('Error toggling pipeline:', error);
      alert(error instanceof Error ? error.message : 'Failed to update pipeline');
    }
  };

  if (loadingPipelines) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div>Loading pipelines...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#ef4444' }}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
            Pipeline Configuration
          </h1>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => {
                setShowTemplatesModal(true);
                if (templates.length === 0) {
                  fetchTemplates();
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              <Workflow size={16} />
              Templates
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} />
              Create Pipeline
            </button>
          </div>
        </div>
        <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>
          Manage sales and support pipelines with stages, automation, and analytics
        </p>
      </div>

      {/* Navigation Tabs */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ borderBottom: '1px solid #e5e7eb' }}>
          <nav style={{ display: 'flex', gap: '32px' }}>
            {['overview', 'analytics', 'automation'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '12px 0',
                  borderBottom: activeTab === tab ? '2px solid #3b82f6' : '2px solid transparent',
                  background: 'none',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: activeTab === tab ? '#3b82f6' : '#6b7280',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <div>
          {/* Pipeline Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: 0 }}>Total Pipelines</h3>
                <GitBranch size={20} style={{ color: '#6366f1' }} />
              </div>
              <p style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937', margin: 0 }}>{pipelines.length}</p>
            </div>

            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: 0 }}>Active Pipelines</h3>
                <Play size={20} style={{ color: '#10b981' }} />
              </div>
              <p style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                {pipelines.filter(p => p.active).length}
              </p>
            </div>

            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: 0 }}>Avg Conversion</h3>
                <Target size={20} style={{ color: '#f59e0b' }} />
              </div>
              <p style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                {pipelines.length > 0 
                  ? `${Math.round(pipelines.reduce((acc, p) => acc + p.analytics.conversionRate, 0) / pipelines.length)}%`
                  : '0%'
                }
              </p>
            </div>

            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: 0 }}>Total Deals</h3>
                <Users size={20} style={{ color: '#ef4444' }} />
              </div>
              <p style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                {pipelines.reduce((acc, p) => acc + p.analytics.totalDeals, 0)}
              </p>
            </div>
          </div>

          {/* Pipelines List */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>All Pipelines</h2>
            </div>
            
            {pipelines.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <GitBranch size={48} style={{ color: '#d1d5db', margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>No pipelines yet</h3>
                <p style={{ color: '#6b7280', marginBottom: '24px' }}>Create your first pipeline to start managing your sales process</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Create Pipeline
                </button>
              </div>
            ) : (
              <div>
                {pipelines.map((pipeline, index) => (
                  <div
                    key={pipeline.id}
                    style={{
                      padding: '24px',
                      borderBottom: index < pipelines.length - 1 ? '1px solid #f3f4f6' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                            {pipeline.name}
                          </h3>
                          <span style={{
                            padding: '4px 8px',
                            backgroundColor: pipeline.type === 'deals' ? '#dbeafe' : '#fef3c7',
                            color: pipeline.type === 'deals' ? '#1e40af' : '#92400e',
                            fontSize: '12px',
                            fontWeight: '500',
                            borderRadius: '12px',
                            textTransform: 'capitalize'
                          }}>
                            {pipeline.type}
                          </span>
                          {pipeline.isDefault && (
                            <span style={{
                              padding: '4px 8px',
                              backgroundColor: '#dcfce7',
                              color: '#166534',
                              fontSize: '12px',
                              fontWeight: '500',
                              borderRadius: '12px'
                            }}>
                              Default
                            </span>
                          )}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 8px',
                            backgroundColor: pipeline.active ? '#dcfce7' : '#fee2e2',
                            borderRadius: '12px'
                          }}>
                            {pipeline.active ? <Play size={12} style={{ color: '#166534' }} /> : <Pause size={12} style={{ color: '#dc2626' }} />}
                            <span style={{
                              fontSize: '12px',
                              fontWeight: '500',
                              color: pipeline.active ? '#166534' : '#dc2626'
                            }}>
                              {pipeline.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '12px' }}>
                          {pipeline.description}
                        </p>
                        
                        {/* Pipeline Stages Preview */}
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                          {pipeline.stages.slice(0, 4).map((stage, idx) => (
                            <div
                              key={stage.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                backgroundColor: stage.color || '#f3f4f6',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '500'
                              }}
                            >
                              {stage.name}
                              {idx < pipeline.stages.length - 1 && <ArrowRight size={12} />}
                            </div>
                          ))}
                          {pipeline.stages.length > 4 && (
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>
                              +{pipeline.stages.length - 4} more
                            </span>
                          )}
                        </div>

                        {/* Analytics */}
                        <div style={{ display: 'flex', gap: '24px', fontSize: '12px', color: '#6b7280' }}>
                          <span>{pipeline.analytics.totalDeals} deals</span>
                          <span>{pipeline.analytics.conversionRate}% conversion</span>
                          <span>${pipeline.analytics.averageDealSize.toLocaleString()} avg size</span>
                          <span>{pipeline.analytics.averageCycleTime} days cycle</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                        <button
                          onClick={() => handleTogglePipeline(pipeline.id, pipeline.active)}
                          style={{
                            padding: '8px',
                            backgroundColor: pipeline.active ? '#fee2e2' : '#dcfce7',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          {pipeline.active ? <Pause size={16} style={{ color: '#dc2626' }} /> : <Play size={16} style={{ color: '#166534' }} />}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPipeline(pipeline);
                            setShowEditModal(true);
                          }}
                          style={{
                            padding: '8px',
                            backgroundColor: '#f3f4f6',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <Edit size={16} style={{ color: '#6b7280' }} />
                        </button>
                        <button
                          onClick={() => {
                            // Copy pipeline functionality
                            const newPipelineCopy = {
                              ...pipeline,
                              name: `${pipeline.name} (Copy)`,
                              id: `copy_${Date.now()}`,
                              isDefault: false,
                              active: false
                            };
                            // Implementation for copy
                          }}
                          style={{
                            padding: '8px',
                            backgroundColor: '#f3f4f6',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <Copy size={16} style={{ color: '#6b7280' }} />
                        </button>
                        <button
                          onClick={() => handleDeletePipeline(pipeline.id)}
                          style={{
                            padding: '8px',
                            backgroundColor: '#fee2e2',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={16} style={{ color: '#dc2626' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Pipeline Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>Create New Pipeline</h2>
            
            <form onSubmit={handleCreatePipeline}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  Pipeline Name
                </label>
                <input
                  type="text"
                  value={newPipelineName}
                  onChange={(e) => setNewPipelineName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  Pipeline Type
                </label>
                <select
                  value={newPipelineType}
                  onChange={(e) => setNewPipelineType(e.target.value as 'deals' | 'tickets')}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="deals">Sales Pipeline</option>
                  <option value="tickets">Support Pipeline</option>
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  Description
                </label>
                <textarea
                  value={newPipelineDescription}
                  onChange={(e) => setNewPipelineDescription(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#f9fafb',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Create Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
