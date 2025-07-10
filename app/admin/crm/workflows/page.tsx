'use client';

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Edit3, 
  Trash2, 
  Plus, 
  Settings, 
  Search, 
  Filter, 
  BarChart3, 
  Users, 
  Calendar, 
  Clock, 
  ArrowRight, 
  ChevronDown, 
  MoreVertical, 
  Copy, 
  Download, 
  ExternalLink, 
  RefreshCw,
  X,
  GitBranch,
  Zap,
  TrendingUp,
  Target,
  Activity
} from 'lucide-react';

interface WorkflowAction {
  id: string;
  type: 'email' | 'create_task' | 'lead_scoring' | 'property_update' | 'webhook';
  delay: number;
  subject?: string;
  template?: string;
  content?: string;
  assignedTo?: string;
  description?: string;
  score?: number;
  reason?: string;
  properties?: any;
  webhookUrl?: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'draft' | 'paused';
  type: string;
  triggerType: string;
  triggerConditions: any;
  actions: WorkflowAction[];
  analytics: {
    enrolled: number;
    completed: number;
    conversionRate: number;
    emailOpenRate: number;
    emailClickRate: number;
  };
  enrolled: number;
  completed: number;
  conversionRate: number;
  emailOpenRate: number;
  emailClickRate: number;
  createdAt: string;
  updatedAt: string;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  triggerType: string;
  estimatedTime: string;
  actions: Partial<WorkflowAction>[];
}

interface WorkflowSummary {
  totalWorkflows: number;
  activeWorkflows: number;
  totalEnrolled: number;
  avgConversionRate: number;
}

function WorkflowAutomationPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [summary, setSummary] = useState<WorkflowSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showBuilderModal, setShowBuilderModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowDescription, setNewWorkflowDescription] = useState('');
  const [newWorkflowType, setNewWorkflowType] = useState('lead_nurturing');
  const [newWorkflowTrigger, setNewWorkflowTrigger] = useState('form_submission');

  useEffect(() => {
    fetchWorkflows();
    fetchTemplates();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await fetch('/api/admin/crm/workflows');
      if (response.ok) {
        const data = await response.json();
        setWorkflows(data.workflows || []);
        setSummary(data.summary || null);
      }
    } catch (error) {
      console.error('Error fetching workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    setTemplatesLoading(true);
    try {
      const response = await fetch('/api/admin/crm/workflows?templates=true');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setTemplatesLoading(false);
    }
  };

  const handleCreateWorkflow = async () => {
    if (!newWorkflowName.trim()) return;
    
    setCreateLoading(true);
    try {
      const response = await fetch('/api/admin/crm/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newWorkflowName,
          description: newWorkflowDescription,
          type: newWorkflowType,
          triggerType: newWorkflowTrigger
        })
      });
      
      if (response.ok) {
        fetchWorkflows();
        setShowCreateModal(false);
        setNewWorkflowName('');
        setNewWorkflowDescription('');
        setNewWorkflowType('lead_nurturing');
        setNewWorkflowTrigger('form_submission');
      }
    } catch (error) {
      console.error('Error creating workflow:', error);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleToggleWorkflow = async (workflowId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      const response = await fetch(`/api/admin/crm/workflows/${workflowId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        fetchWorkflows();
      }
    } catch (error) {
      console.error('Error toggling workflow:', error);
    }
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    
    try {
      const response = await fetch(`/api/admin/crm/workflows/${workflowId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchWorkflows();
      }
    } catch (error) {
      console.error('Error deleting workflow:', error);
    }
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter;
    const matchesType = typeFilter === 'all' || workflow.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'paused': return '#f59e0b';
      case 'draft': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lead_nurturing': return <Users size={16} />;
      case 'sales_sequence': return <TrendingUp size={16} />;
      case 'customer_onboarding': return <Target size={16} />;
      case 'retention': return <Activity size={16} />;
      default: return <Zap size={16} />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: '0 0 8px 0' }}>
              Workflow Automation
            </h1>
            <p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}>
              Create and manage automated workflows to nurture leads and engage customers
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowTemplatesModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              <GitBranch size={16} />
              Browse Templates
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
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
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              <Plus size={16} />
              Create Workflow
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <GitBranch size={16} style={{ color: '#6b7280', marginRight: '8px' }} />
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Total Workflows</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{summary.totalWorkflows}</div>
          </div>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <Play size={16} style={{ color: '#10b981', marginRight: '8px' }} />
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Active Workflows</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{summary.activeWorkflows}</div>
          </div>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <Users size={16} style={{ color: '#3b82f6', marginRight: '8px' }} />
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Total Enrolled</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{summary.totalEnrolled}</div>
          </div>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <TrendingUp size={16} style={{ color: '#f59e0b', marginRight: '8px' }} />
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Avg Conversion Rate</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{summary.avgConversionRate}%</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', minWidth: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            <input
              type="text"
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 8px 8px 40px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="draft">Draft</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          >
            <option value="all">All Types</option>
            <option value="lead_nurturing">Lead Nurturing</option>
            <option value="sales_sequence">Sales Sequence</option>
            <option value="customer_onboarding">Customer Onboarding</option>
            <option value="retention">Retention</option>
          </select>

          <button
            onClick={fetchWorkflows}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* Workflows List */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>
            Loading workflows...
          </div>
        ) : filteredWorkflows.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <GitBranch size={48} style={{ color: '#d1d5db', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>No workflows found</h3>
            <p style={{ color: '#6b7280', margin: '0 0 20px 0' }}>Get started by creating your first workflow</p>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              <Plus size={16} />
              Create Workflow
            </button>
          </div>
        ) : (
          <div>
            {filteredWorkflows.map((workflow) => (
              <div
                key={workflow.id}
                style={{
                  padding: '20px',
                  borderBottom: '1px solid #f3f4f6',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{ color: '#6b7280' }}>
                      {getTypeIcon(workflow.type)}
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                      {workflow.name}
                    </h3>
                    <span style={{
                      fontSize: '12px',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      backgroundColor: getStatusColor(workflow.status) + '20',
                      color: getStatusColor(workflow.status),
                      fontWeight: '500'
                    }}>
                      {workflow.status.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 12px 0' }}>
                    {workflow.description}
                  </p>
                  <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: '#6b7280' }}>
                    <span>Created: {formatDate(workflow.createdAt)}</span>
                    <span>Enrolled: {workflow.enrolled}</span>
                    <span>Completed: {workflow.completed}</span>
                    <span>Conversion: {workflow.conversionRate}%</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => handleToggleWorkflow(workflow.id, workflow.status)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      backgroundColor: workflow.status === 'active' ? '#fef3c7' : '#dcfce7',
                      border: `1px solid ${workflow.status === 'active' ? '#f59e0b' : '#10b981'}`,
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      color: workflow.status === 'active' ? '#92400e' : '#065f46'
                    }}
                  >
                    {workflow.status === 'active' ? <Pause size={12} /> : <Play size={12} />}
                    {workflow.status === 'active' ? 'Pause' : 'Activate'}
                  </button>
                  
                  <button
                    onClick={() => {
                      setSelectedWorkflow(workflow);
                      setShowBuilderModal(true);
                    }}
                    style={{
                      padding: '6px',
                      backgroundColor: 'transparent',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      color: '#6b7280'
                    }}
                    title="Edit Workflow"
                  >
                    <Edit3 size={12} />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteWorkflow(workflow.id)}
                    style={{
                      padding: '6px',
                      backgroundColor: 'transparent',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      color: '#ef4444'
                    }}
                    title="Delete Workflow"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Workflow Modal */}
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
            borderRadius: '8px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Create New Workflow</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} color="#6b7280" />
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Workflow Name
              </label>
              <input
                type="text"
                value={newWorkflowName}
                onChange={(e) => setNewWorkflowName(e.target.value)}
                placeholder="Enter workflow name"
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
                Description
              </label>
              <textarea
                value={newWorkflowDescription}
                onChange={(e) => setNewWorkflowDescription(e.target.value)}
                placeholder="Describe what this workflow does"
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

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Workflow Type
              </label>
              <select
                value={newWorkflowType}
                onChange={(e) => setNewWorkflowType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="lead_nurturing">Lead Nurturing</option>
                <option value="sales_sequence">Sales Sequence</option>
                <option value="customer_onboarding">Customer Onboarding</option>
                <option value="retention">Retention</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  padding: '10px 16px',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWorkflow}
                disabled={createLoading || !newWorkflowName.trim()}
                style={{
                  padding: '10px 16px',
                  backgroundColor: createLoading || !newWorkflowName.trim() ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: createLoading || !newWorkflowName.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                {createLoading ? 'Creating...' : 'Create Workflow'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      {showTemplatesModal && (
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
            borderRadius: '8px',
            padding: '24px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Workflow Templates</h2>
              <button
                onClick={() => setShowTemplatesModal(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} color="#6b7280" />
              </button>
            </div>

            {templatesLoading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                Loading templates...
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '16px' }}>
                {templates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => {
                      setNewWorkflowName(template.name);
                      setNewWorkflowDescription(template.description);
                      setNewWorkflowType(template.category);
                      setNewWorkflowTrigger(template.triggerType);
                      setShowTemplatesModal(false);
                      setShowCreateModal(true);
                    }}
                    style={{
                      padding: '20px',
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      {getTypeIcon(template.category)}
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                        {template.name}
                      </h3>
                    </div>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 12px 0', lineHeight: '1.5' }}>
                      {template.description}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontSize: '12px',
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        padding: '4px 8px',
                        borderRadius: '4px'
                      }}>
                        {template.category.replace('_', ' ').toUpperCase()}
                      </span>
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                        ~{template.estimatedTime}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkflowAutomationPage;
