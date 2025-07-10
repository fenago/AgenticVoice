'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Key, 
  RefreshCw, 
  MapPin, 
  AlertTriangle, 
  Webhook, 
  Users,
  Shield,
  Eye,
  EyeOff,
  Save,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  Activity,
  Zap
} from 'lucide-react';
import { Button, Typography, Card } from '@/app/admin/components/ui';
import { DesignSystem } from '@/app/admin/styles/design-system';
import CredentialsTab from './components/CredentialsTab';
import SyncSettingsTab from './components/SyncSettingsTab';
import DataMappingTab from './components/DataMappingTab';
import WebhooksTab from './components/WebhooksTab';
import ErrorLogsTab from './components/ErrorLogsTab';
import AccessControlTab from './components/AccessControlTab';

interface CRMSettingsProps {}

interface APICredential {
  id: string;
  name: string;
  type: 'api_key' | 'access_token' | 'webhook_secret';
  value: string;
  isActive: boolean;
  lastUsed?: Date;
  expiresAt?: Date;
}

interface SyncConfig {
  enabled: boolean;
  direction: 'one_way' | 'two_way';
  frequency: 'real_time' | 'hourly' | 'daily' | 'manual';
  lastSync?: Date;
  nextSync?: Date;
  status: 'active' | 'paused' | 'error';
}

interface DataMapping {
  hubspotProperty: string;
  agenticVoiceField: string;
  direction: 'to_hubspot' | 'to_agenticvoice' | 'bidirectional';
  transformFunction?: string;
  isRequired: boolean;
}

const CRMSettingsPage: React.FC<CRMSettingsProps> = () => {
  const [activeTab, setActiveTab] = useState('credentials');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [credentials, setCredentials] = useState<APICredential[]>([]);

  const [syncSettings, setSyncSettings] = useState<Record<string, SyncConfig>>({});
  const [dataMappings, setDataMappings] = useState<DataMapping[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [accessControl, setAccessControl] = useState<any[]>([]);

  // Fetch settings data on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching CRM settings...');
        const response = await fetch('/api/admin/crm/settings');
        console.log('📡 API Response status:', response.status);
        console.log('📡 API Response headers:', response.headers);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ API Data received:', data);
          setCredentials(data.credentials || []);
          setSyncSettings(data.syncSettings || {});
          setDataMappings(data.dataMappings || []);
          setWebhooks(data.webhooks || []);
          setAccessControl(data.accessControl || []);
        } else {
          const errorText = await response.text();
          console.error('❌ API Error Response:', errorText);
          setError(`Failed to load settings: ${response.status} - ${response.statusText}`);
        }
      } catch (err) {
        console.error('❌ Error fetching settings:', err);
        setError('Error loading settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('🐛 Debug - loading:', loading, 'activeTab:', activeTab, 'credentials length:', credentials.length);
  }, [loading, activeTab, credentials]);

  // Save settings function
  const saveSettings = async (section: string, data: any) => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/crm/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section,
          data
        }),
      });

      if (response.ok) {
        // Refresh data after save
        const updatedResponse = await fetch('/api/admin/crm/settings');
        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json();
          setCredentials(updatedData.credentials || []);
          setSyncSettings(updatedData.syncSettings || {});
          setDataMappings(updatedData.dataMappings || []);
          setWebhooks(updatedData.webhooks || []);
          setAccessControl(updatedData.accessControl || []);
        }
      } else {
        setError('Failed to save settings');
      }
    } catch (err) {
      setError('Error saving settings');
      console.error('Error saving settings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger sync function
  const triggerSync = async (syncType: string) => {
    try {
      setSyncStatus('syncing');
      const response = await fetch('/api/admin/crm/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'trigger_sync',
          syncType
        }),
      });

      if (response.ok) {
        setSyncStatus('success');
        setTimeout(() => setSyncStatus('idle'), 3000);
      } else {
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Error triggering sync:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const toggleSecretVisibility = (credentialId: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [credentialId]: !prev[credentialId]
    }));
  };

  const testConnection = async (credentialId: string) => {
    setSyncStatus('syncing');
    try {
      const response = await fetch('/api/admin/crm/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'test_connection',
          credentialId
        }),
      });

      if (response.ok) {
        setSyncStatus('success');
        setTimeout(() => setSyncStatus('idle'), 3000);
      } else {
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };



  const tabs = [
    { id: 'credentials', label: 'API Credentials', icon: Key },
    { id: 'sync', label: 'Sync Settings', icon: RefreshCw },
    { id: 'mapping', label: 'Data Mapping', icon: MapPin },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
    { id: 'logs', label: 'Error Logs', icon: AlertTriangle },
    { id: 'access', label: 'Access Control', icon: Shield }
  ];

  return (
    <div className="crm-settings-page" style={{ 
      maxWidth: '1200px',
      margin: '0 auto',
      backgroundColor: DesignSystem.colors.neutral[50],
      padding: DesignSystem.spacing[8],
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ marginBottom: DesignSystem.spacing[8] }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: DesignSystem.spacing[4],
          marginBottom: DesignSystem.spacing[2]
        }}>
          <Settings size={32} color={DesignSystem.colors.primary[500]} />
          <Typography style={{ 
            color: DesignSystem.colors.neutral[900],
            fontSize: '2rem',
            fontWeight: 'bold'
          }}>
            CRM Settings
          </Typography>
        </div>
        <Typography variant="body-md" style={{ 
          color: DesignSystem.colors.neutral[600],
          maxWidth: '600px'
        }}>
          Configure your HubSpot integration, manage API credentials, set up data synchronization,
          and monitor connection health.
        </Typography>
      </div>

      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex',
        borderBottom: `1px solid ${DesignSystem.colors.neutral[200]}`,
        marginBottom: DesignSystem.spacing[8],
        overflowX: 'auto'
      }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: DesignSystem.spacing[2],
                padding: `${DesignSystem.spacing[3]} ${DesignSystem.spacing[4]}`,
                border: 'none',
                background: 'transparent',
                color: isActive ? DesignSystem.colors.primary[500] : DesignSystem.colors.neutral[600],
                borderBottom: `2px solid ${isActive ? DesignSystem.colors.primary[500] : 'transparent'}`,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontSize: DesignSystem.typography.fontSize.sm,
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={20} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '32px',
          color: '#6b7280'
        }}>
          Loading settings...
        </div>
      )}

      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          color: '#dc2626'
        }}>
          {error}
        </div>
      )}

      {/* Tab Content */}
      {!loading && (
        <div className="tab-content" style={{display: 'block', width: '100%', minHeight: '200px', backgroundColor: '#ffffff', padding: '20px', border: '1px solid #ccc'}}>
          {activeTab === 'credentials' && (
            <CredentialsTab 
              credentials={credentials}
              setCredentials={setCredentials}
              showSecrets={showSecrets}
              toggleSecretVisibility={toggleSecretVisibility}
              testConnection={testConnection}
              syncStatus={syncStatus}
              saveSettings={saveSettings}
            />
          )}
          
          {activeTab === 'sync' && (
            <SyncSettingsTab 
              syncSettings={syncSettings}
              setSyncSettings={setSyncSettings}
              triggerSync={triggerSync}
              syncStatus={syncStatus}
              saveSettings={saveSettings}
            />
          )}
          
          {activeTab === 'mapping' && (
            <DataMappingTab 
              dataMappings={dataMappings}
              setDataMappings={setDataMappings}
              saveSettings={saveSettings}
            />
          )}
          
          {activeTab === 'webhooks' && (
            <WebhooksTab 
              webhooks={webhooks}
              setWebhooks={setWebhooks}
              saveSettings={saveSettings}
            />
          )}
          
          {activeTab === 'logs' && (
            <ErrorLogsTab />
          )}
          
          {activeTab === 'access' && (
            <AccessControlTab 
              accessControl={accessControl}
              setAccessControl={setAccessControl}
              saveSettings={saveSettings}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default CRMSettingsPage;
