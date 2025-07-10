import React, { useState } from 'react';
import {
  Webhook,
  Plus,
  Play,
  Pause,
  Trash2,
  Edit,
  Copy,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react';
import { Button, Typography, Card } from '@/app/admin/components/ui';
import { DesignSystem } from '@/app/admin/styles/design-system';

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret: string;
  lastTriggered?: Date;
  successRate: number;
  totalRequests: number;
}

interface WebhooksTabProps {
  webhooks: any[];
  setWebhooks: React.Dispatch<React.SetStateAction<any[]>>;
  saveSettings: (section: string, data: any) => Promise<void>;
}

const WebhooksTab: React.FC<WebhooksTabProps> = ({ webhooks, setWebhooks, saveSettings }) => {
  // Initialize with mock data if webhooks is empty
  const [localWebhooks, setLocalWebhooks] = useState<WebhookConfig[]>(webhooks?.length > 0 ? webhooks : [
    {
      id: '1',
      name: 'Contact Updates',
      url: 'https://api.agenticvoice.com/webhooks/hubspot/contacts',
      events: ['contact.created', 'contact.updated', 'contact.deleted'],
      isActive: true,
      secret: 'whsec_1234567890abcdef',
      lastTriggered: new Date('2025-07-05T18:30:00Z'),
      successRate: 98.5,
      totalRequests: 1247
    },
    {
      id: '2',
      name: 'Deal Pipeline',
      url: 'https://api.agenticvoice.com/webhooks/hubspot/deals',
      events: ['deal.created', 'deal.updated', 'deal.stage_changed'],
      isActive: false,
      secret: 'whsec_abcdef1234567890',
      lastTriggered: new Date('2025-07-04T14:15:00Z'),
      successRate: 95.2,
      totalRequests: 543
    }
  ]);

  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [showAddForm, setShowAddForm] = useState(false);

  const availableEvents = [
    'contact.created',
    'contact.updated', 
    'contact.deleted',
    'company.created',
    'company.updated',
    'deal.created',
    'deal.updated',
    'deal.stage_changed',
    'ticket.created',
    'ticket.updated',
    'engagement.created'
  ];

  const toggleSecret = (webhookId: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [webhookId]: !prev[webhookId]
    }));
  };

  const toggleWebhook = (webhookId: string) => {
    const newWebhooks = localWebhooks.map(webhook => 
      webhook.id === webhookId 
        ? { ...webhook, isActive: !webhook.isActive }
        : webhook
    );
    setLocalWebhooks(newWebhooks);
    setWebhooks(newWebhooks);
  };

  const handleDeleteWebhook = (id: string) => {
    const filteredWebhooks = localWebhooks.filter(webhook => webhook.id !== id);
    setLocalWebhooks(filteredWebhooks);
    setWebhooks(filteredWebhooks);
  };

  const addWebhook = (webhook: Omit<WebhookConfig, 'id' | 'lastTriggered' | 'successRate' | 'totalRequests'>) => {
    const newWebhook: WebhookConfig = {
      ...webhook,
      id: Date.now().toString(),
      successRate: 0,
      totalRequests: 0
    };
    const newWebhooks = [...localWebhooks, newWebhook];
    setLocalWebhooks(newWebhooks);
    setWebhooks(newWebhooks);
  };

  const updateWebhook = (id: string, field: string, value: any) => {
    const updatedWebhooks = localWebhooks.map(webhook => 
      webhook.id === id ? { ...webhook, [field]: value } : webhook
    );
    setLocalWebhooks(updatedWebhooks);
    setWebhooks(updatedWebhooks);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const getStatusColor = (successRate: number) => {
    if (successRate >= 95) return DesignSystem.colors.success;
    if (successRate >= 80) return DesignSystem.colors.warning;
    return DesignSystem.colors.error;
  };

  return (
    <div className="webhooks-tab">
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: DesignSystem.spacing[8]
      }}>
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: DesignSystem.colors.neutral[900] }}>
            Webhooks
          </div>
          <div style={{ fontSize: '0.875rem', color: DesignSystem.colors.neutral[600] }}>
            Configure real-time data synchronization via webhooks
          </div>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddForm(true)}
          style={{ display: 'flex', alignItems: 'center', gap: DesignSystem.spacing[2] }}
        >
          <Plus size={16} />
          Add Webhook
        </Button>
      </div>

      {/* Webhook Overview Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: DesignSystem.spacing[4],
        marginBottom: DesignSystem.spacing[8]
      }}>
        <Card style={{ padding: DesignSystem.spacing[4], textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: DesignSystem.colors.primary[500] }}>
            {localWebhooks.length}
          </div>
          <div style={{ fontSize: '0.875rem', color: DesignSystem.colors.neutral[600] }}>
            Total Webhooks
          </div>
        </Card>
        <Card style={{ padding: DesignSystem.spacing[4], textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: DesignSystem.colors.success }}>
            {localWebhooks.filter(w => w.isActive).length}
          </div>
          <div style={{ fontSize: '0.875rem', color: DesignSystem.colors.neutral[600] }}>
            Active Webhooks
          </div>
        </Card>
        <Card style={{ padding: DesignSystem.spacing[4], textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: DesignSystem.colors.warning }}>
            {localWebhooks.reduce((sum, w) => sum + w.totalRequests, 0)}
          </div>
          <div style={{ fontSize: '0.875rem', color: DesignSystem.colors.neutral[600] }}>
            Total Requests
          </div>
        </Card>
        <Card style={{ padding: DesignSystem.spacing[4], textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: DesignSystem.colors.success }}>
            {localWebhooks.length > 0 ? Math.round(localWebhooks.reduce((sum, w) => sum + w.successRate, 0) / localWebhooks.length) : 0}%
          </div>
          <div style={{ fontSize: '0.875rem', color: DesignSystem.colors.neutral[600] }}>
            Average Success Rate
          </div>
        </Card>
      </div>

      {/* Webhooks List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: DesignSystem.spacing[6] }}>
        {localWebhooks.map((webhook) => (
          <Card
            key={webhook.id}
            style={{
              padding: DesignSystem.spacing[6],
              border: `1px solid ${DesignSystem.colors.neutral[300]}`,
              borderRadius: DesignSystem.borderRadius.lg,
              opacity: webhook.isActive ? 1 : 0.7
            }}
          >
            {/* Webhook Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: DesignSystem.spacing[4]
            }}>
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: DesignSystem.spacing[2],
                  marginBottom: DesignSystem.spacing[1]
                }}>
                  <Webhook size={20} color={DesignSystem.colors.primary[500]} />
                  <div style={{ fontSize: '1.125rem', fontWeight: 600, color: DesignSystem.colors.neutral[900] }}>
                    {webhook.name}
                  </div>
                  {webhook.isActive ? (
                    <span style={{
                      backgroundColor: DesignSystem.colors.success,
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: DesignSystem.borderRadius.sm,
                      fontSize: '12px',
                      fontWeight: 500
                    }}>
                      ACTIVE
                    </span>
                  ) : (
                    <span style={{
                      backgroundColor: DesignSystem.colors.neutral[600],
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: DesignSystem.borderRadius.sm,
                      fontSize: '12px',
                      fontWeight: 500
                    }}>
                      PAUSED
                    </span>
                  )}
                </div>
                <div style={{
                  color: DesignSystem.colors.neutral[600],
                  fontFamily: 'monospace',
                  fontSize: '0.875rem'
                }}>
                  {webhook.url}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: DesignSystem.spacing[2] }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleWebhook(webhook.id)}
                >
                  {webhook.isActive ? <Pause size={16} /> : <Play size={16} />}
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit size={16} />
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 size={16} color={DesignSystem.colors.error} />
                </Button>
              </div>
            </div>

            {/* Webhook Details */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: DesignSystem.spacing[4],
              marginBottom: DesignSystem.spacing[4]
            }}>
              {/* Events */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: DesignSystem.colors.neutral[600], marginBottom: DesignSystem.spacing[1] }}>
                  Subscribed Events
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: DesignSystem.spacing[1] }}>
                  {webhook.events.map((event) => (
                    <span
                      key={event}
                      style={{
                        backgroundColor: DesignSystem.colors.primary[100],
                        color: DesignSystem.colors.primary[800],
                        padding: '4px 8px',
                        borderRadius: DesignSystem.borderRadius.sm,
                        fontSize: '12px',
                        fontWeight: 500
                      }}
                    >
                      {event}
                    </span>
                  ))}
                </div>
              </div>

              {/* Statistics */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: DesignSystem.spacing[2]
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: DesignSystem.colors.neutral[600], marginBottom: DesignSystem.spacing[1] }}>
                    Success Rate
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: DesignSystem.spacing[1] }}>
                    <span style={{
                      color: getStatusColor(webhook.successRate),
                      fontWeight: 600,
                      fontSize: '16px'
                    }}>
                      {webhook.successRate}%
                    </span>
                    {webhook.successRate >= 95 && <CheckCircle size={16} color={DesignSystem.colors.success} />}
                    {webhook.successRate < 95 && <AlertCircle size={16} color={DesignSystem.colors.warning} />}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: DesignSystem.colors.neutral[600], marginBottom: DesignSystem.spacing[1] }}>
                    Total Requests
                  </div>
                  <div style={{ fontSize: '1rem', color: DesignSystem.colors.neutral[900] }}>
                    {(webhook.totalRequests || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Webhook Secret */}
            <div style={{
              backgroundColor: DesignSystem.colors.neutral[50],
              padding: DesignSystem.spacing[4],
              borderRadius: DesignSystem.borderRadius.sm,
              marginBottom: DesignSystem.spacing[4]
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: DesignSystem.spacing[1]
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: DesignSystem.colors.neutral[600] }}>
                  Webhook Secret
                </div>
                <div style={{ display: 'flex', gap: DesignSystem.spacing[1] }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSecret(webhook.id)}
                  >
                    {showSecrets[webhook.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(webhook.secret)}
                  >
                    <Copy size={14} />
                  </Button>
                </div>
              </div>
              <div style={{
                fontFamily: 'monospace',
                fontSize: '14px',
                color: DesignSystem.colors.neutral[900],
                wordBreak: 'break-all'
              }}>
                {showSecrets[webhook.id] 
                  ? webhook.secret || 'No secret configured'
                  : (webhook.secret || '').replace(/./g, '•') || '••••••••'
                }
              </div>
            </div>

            {/* Last Activity */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: DesignSystem.spacing[2],
              fontSize: '14px',
              color: DesignSystem.colors.neutral[600]
            }}>
              <Clock size={16} />
              <span>
                Last triggered: {webhook.lastTriggered 
                  ? webhook.lastTriggered.toLocaleString()
                  : 'Never'
                }
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity Log */}
      <Card style={{
        marginTop: DesignSystem.spacing[12],
        padding: DesignSystem.spacing[8]
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: DesignSystem.spacing[2],
          marginBottom: DesignSystem.spacing[4]
        }}>
          <Activity size={20} color={DesignSystem.colors.primary[500]} />
          <div style={{ fontSize: '1.25rem', fontWeight: 600, color: DesignSystem.colors.neutral[900] }}>
            Recent Webhook Activity
          </div>
        </div>
        <div style={{
          maxHeight: '300px',
          overflowY: 'auto',
          border: `1px solid ${DesignSystem.colors.neutral[300]}`,
          borderRadius: DesignSystem.borderRadius.sm
        }}>
          {/* Mock activity log entries */}
          {[
            { time: '19:25:33', webhookName: 'Contact Updates', event: 'contact.updated', status: 'success' },
            { time: '19:24:12', webhookName: 'Contact Updates', event: 'contact.created', status: 'success' },
            { time: '19:23:45', webhookName: 'Deal Pipeline', event: 'deal.stage_changed', status: 'failed' },
            { time: '19:22:18', webhookName: 'Contact Updates', event: 'contact.updated', status: 'success' }
          ].map((log, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: DesignSystem.spacing[2],
                borderBottom: index < 3 ? `1px solid ${DesignSystem.colors.neutral[300]}` : 'none',
                fontSize: '14px'
              }}
            >
              <span style={{ color: DesignSystem.colors.neutral[600], fontFamily: 'monospace' }}>
                {log.time}
              </span>
              <span style={{ color: DesignSystem.colors.neutral[900] }}>
                {log.webhookName}
              </span>
              <span style={{ color: DesignSystem.colors.neutral[600] }}>
                {log.event}
              </span>
              <span style={{
                color: log.status === 'success' 
                  ? DesignSystem.colors.success 
                  : DesignSystem.colors.error,
                fontWeight: 500
              }}>
                {log.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default WebhooksTab;
