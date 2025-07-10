import React from 'react';
import {
  RefreshCw,
  ArrowRight,
  ArrowLeftRight,
  Clock,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle,
  Settings
} from 'lucide-react';
import { Button, Typography, Card } from '@/app/admin/components/ui';
import { DesignSystem } from '@/app/admin/styles/design-system';

interface SyncConfig {
  enabled: boolean;
  direction: 'one_way' | 'two_way';
  frequency: 'real_time' | 'hourly' | 'daily' | 'manual';
  lastSync?: Date;
  nextSync?: Date;
  status: 'active' | 'paused' | 'error';
}

interface SyncSettingsTabProps {
  syncSettings: Record<string, SyncConfig>;
  setSyncSettings: React.Dispatch<React.SetStateAction<Record<string, SyncConfig>>>;
  triggerSync: (syncType: string) => Promise<void>;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  saveSettings: (section: string, data: any) => Promise<void>;
}

const SyncSettingsTab: React.FC<SyncSettingsTabProps> = ({
  syncSettings,
  setSyncSettings
}) => {
  const getSyncDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'one_way':
        return <ArrowRight size={16} color={DesignSystem.colors.primary[500]} />;
      case 'two_way':
        return <ArrowLeftRight size={16} color={DesignSystem.colors.success} />;
      default:
        return <ArrowRight size={16} color={DesignSystem.colors.neutral[600]} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return DesignSystem.colors.success;
      case 'paused':
        return DesignSystem.colors.warning;
      case 'error':
        return DesignSystem.colors.error;
      default:
        return DesignSystem.colors.neutral[600];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={16} color={DesignSystem.colors.success} />;
      case 'paused':
        return <Pause size={16} color={DesignSystem.colors.warning} />;
      case 'error':
        return <AlertTriangle size={16} color={DesignSystem.colors.error} />;
      default:
        return <Clock size={16} color={DesignSystem.colors.neutral[600]} />;
    }
  };

  const updateSyncConfig = (entity: string, updates: Partial<SyncConfig>) => {
    setSyncSettings(prev => ({
      ...prev,
      [entity]: { ...prev[entity], ...updates }
    }));
  };

  const triggerManualSync = async (entity: string) => {
    updateSyncConfig(entity, { 
      status: 'active',
      lastSync: new Date()
    });
    // Here you would call the actual sync API
  };

  const syncEntities = [
    {
      key: 'contacts',
      name: 'Contacts',
      description: 'Synchronize user contacts and lead information',
      icon: '👥'
    },
    {
      key: 'companies',
      name: 'Companies',
      description: 'Sync company profiles and business information',
      icon: '🏢'
    },
    {
      key: 'deals',
      name: 'Deals',
      description: 'Manage sales opportunities and deal progression',
      icon: '💰'
    },
    {
      key: 'tickets',
      name: 'Tickets',
      description: 'Support tickets and customer service issues',
      icon: '🎫'
    },
    {
      key: 'engagements',
      name: 'Engagements',
      description: 'Activities, notes, calls, and customer interactions',
      icon: '📞'
    }
  ];

  return (
    <div className="sync-settings-tab">
      {/* Header */}
      <div style={{ marginBottom: DesignSystem.spacing[8] }}>
        <Typography style={{ color: DesignSystem.colors.neutral[900], fontSize: '24px', fontWeight: 600 }}>
          Sync Settings
        </Typography>
        <Typography style={{ color: DesignSystem.colors.neutral[600], fontSize: '14px' }}>
          Configure data synchronization between AgenticVoice and HubSpot
        </Typography>
      </div>

      {/* Global Sync Controls */}
      <Card style={{
        padding: DesignSystem.spacing[6],
        marginBottom: DesignSystem.spacing[6],
        backgroundColor: DesignSystem.colors.neutral[50]
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <Typography style={{ color: DesignSystem.colors.neutral[900], fontSize: '20px', fontWeight: 600 }}>
              Global Sync Controls
            </Typography>
            <Typography style={{ color: DesignSystem.colors.neutral[600], fontSize: '14px' }}>
              Master controls for all synchronization processes
            </Typography>
          </div>
          <div style={{ display: 'flex', gap: DesignSystem.spacing[4] }}>
            <Button variant="outline">
              <Pause size={16} />
              Pause All
            </Button>
            <Button variant="primary">
              <RefreshCw size={16} />
              Sync All Now
            </Button>
          </div>
        </div>
      </Card>

      {/* Entity Sync Configurations */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: DesignSystem.spacing[6] }}>
        {syncEntities.map((entity) => {
          const config = syncSettings[entity.key] || {
            enabled: false,
            direction: 'one_way',
            frequency: 'manual',
            status: 'paused'
          };

          return (
            <Card
              key={entity.key}
              style={{
                padding: DesignSystem.spacing[6],
                border: `1px solid ${DesignSystem.colors.neutral[300]}`,
                borderRadius: DesignSystem.borderRadius.lg,
                opacity: config.enabled ? 1 : 0.7
              }}
            >
              {/* Entity Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: DesignSystem.spacing[4]
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: DesignSystem.spacing[4] }}>
                  <span style={{ fontSize: '24px' }}>{entity.icon}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: DesignSystem.spacing[2] }}>
                      <Typography style={{ color: DesignSystem.colors.neutral[900], fontSize: '18px', fontWeight: 600 }}>
                        {entity.name}
                      </Typography>
                      {getStatusIcon(config.status)}
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: getStatusColor(config.status),
                        textTransform: 'uppercase'
                      }}>
                        {config.status}
                      </span>
                    </div>
                    <Typography style={{ color: DesignSystem.colors.neutral[600], fontSize: '14px' }}>
                      {entity.description}
                    </Typography>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: DesignSystem.spacing[2] }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateSyncConfig(entity.key, { enabled: !config.enabled })}
                    style={{
                      color: config.enabled ? DesignSystem.colors.success : DesignSystem.colors.neutral[600]
                    }}
                  >
                    {config.enabled ? <Play size={16} /> : <Pause size={16} />}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Settings size={16} />
                  </Button>
                </div>
              </div>

              {/* Sync Configuration */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: DesignSystem.spacing[4],
                padding: DesignSystem.spacing[4],
                backgroundColor: DesignSystem.colors.neutral[100],
                borderRadius: DesignSystem.borderRadius.sm,
                border: `1px solid ${DesignSystem.colors.neutral[200]}`
              }}>
                {/* Direction */}
                <div>
                  <Typography style={{ color: DesignSystem.colors.neutral[600], fontSize: '12px', fontWeight: 500, textTransform: 'uppercase' }}>
                    Sync Direction
                  </Typography>
                  <div style={{ display: 'flex', alignItems: 'center', gap: DesignSystem.spacing[2] }}>
                    {getSyncDirectionIcon(config.direction)}
                    <span style={{ fontSize: '14px', color: DesignSystem.colors.neutral[900] }}>
                      {config.direction === 'one_way' ? 'One Way' : 'Bidirectional'}
                    </span>
                  </div>
                </div>

                {/* Frequency */}
                <div>
                  <Typography style={{ color: DesignSystem.colors.neutral[600], fontSize: '12px', fontWeight: 500, textTransform: 'uppercase' }}>
                    Frequency
                  </Typography>
                  <div style={{ display: 'flex', alignItems: 'center', gap: DesignSystem.spacing[2] }}>
                    <Clock size={16} color={DesignSystem.colors.neutral[600]} />
                    <span style={{ fontSize: '14px', color: DesignSystem.colors.neutral[900] }}>
                      {config.frequency.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Last Sync */}
                <div>
                  <Typography style={{ color: DesignSystem.colors.neutral[600], fontSize: '12px', fontWeight: 500, textTransform: 'uppercase' }}>
                    Last Sync
                  </Typography>
                  <span style={{ fontSize: '14px', color: DesignSystem.colors.neutral[900] }}>
                    {config.lastSync 
                      ? config.lastSync.toLocaleString()
                      : 'Never'
                    }
                  </span>
                </div>

                {/* Next Sync */}
                {config.nextSync && (
                  <div>
                    <Typography style={{ color: DesignSystem.colors.neutral[600], fontSize: '12px', fontWeight: 500, textTransform: 'uppercase' }}>
                      Next Sync
                    </Typography>
                    <span style={{ fontSize: '14px', color: DesignSystem.colors.neutral[900] }}>
                      {config.nextSync.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: DesignSystem.spacing[2],
                marginTop: DesignSystem.spacing[4]
              }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => triggerManualSync(entity.key)}
                  disabled={!config.enabled}
                >
                  Sync Now
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!config.enabled}
                >
                  View Logs
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SyncSettingsTab;
