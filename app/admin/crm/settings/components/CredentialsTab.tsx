import React from 'react';
import {
  Key,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { Button, Typography, Card } from '@/app/admin/components/ui';
import { DesignSystem } from '@/app/admin/styles/design-system';

interface APICredential {
  id: string;
  name: string;
  type: 'api_key' | 'access_token' | 'webhook_secret';
  value: string;
  isActive: boolean;
  lastUsed?: Date;
  expiresAt?: Date;
}

interface CredentialsTabProps {
  credentials: APICredential[];
  setCredentials: React.Dispatch<React.SetStateAction<APICredential[]>>;
  showSecrets: Record<string, boolean>;
  toggleSecretVisibility: (credentialId: string) => void;
  testConnection: (credentialId: string) => Promise<void>;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  saveSettings: (section: string, data: any) => Promise<void>;
}

const CredentialsTab: React.FC<CredentialsTabProps> = ({
  credentials,
  setCredentials,
  showSecrets,
  toggleSecretVisibility,
  testConnection,
  syncStatus,
  saveSettings
}) => {
  console.log('✅ CredentialsTab rendering successfully with', credentials?.length, 'credentials');
  const getStatusIcon = (status: typeof syncStatus) => {
    switch (status) {
      case 'syncing':
        return <RefreshCw size={16} className="animate-spin" color="#f59e0b" />;
      case 'success':
        return <CheckCircle size={16} color="#10b981" />;
      case 'error':
        return <XCircle size={16} color="#ef4444" />;
      default:
        return <Clock size={16} color="#6b7280" />;
    }
  };

  const maskSecret = (secret: string) => {
    if (secret.length <= 8) return '••••••••';
    return secret.slice(0, 4) + '••••••••' + secret.slice(-4);
  };

  const getCredentialTypeColor = (type: string) => {
    switch (type) {
      case 'api_key':
        return '#3b82f6';
      case 'access_token':
        return '#10b981';
      case 'webhook_secret':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="credentials-tab">
      {/* Header Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#111827' }}>
            API Credentials
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Manage your HubSpot API keys and access tokens
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Button
            variant="outline"
            onClick={() => testConnection(credentials[0]?.id || 'hubspot')}
            disabled={syncStatus === 'syncing'}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {getStatusIcon(syncStatus)}
            Test Connection
          </Button>
          <Button
            variant="primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={16} />
            Add Credential
          </Button>
        </div>
      </div>

      {/* Credentials List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {credentials.map((credential) => (
          <Card
            key={credential.id}
            style={{
              padding: DesignSystem.spacing[8],
              border: `1px solid ${DesignSystem.colors.neutral[300]}`,
              borderRadius: DesignSystem.borderRadius.lg
            }}
          >
            {/* Credential Header */}
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
                  <Key size={18} color={getCredentialTypeColor(credential.type)} />
                  <div style={{ fontSize: '1.125rem', fontWeight: 600, color: DesignSystem.colors.neutral[900] }}>
                    {credential.name}
                  </div>
                  <span
                    style={{
                      backgroundColor: getCredentialTypeColor(credential.type),
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: DesignSystem.borderRadius.sm,
                      fontSize: '12px',
                      fontWeight: 500,
                      textTransform: 'uppercase'
                    }}
                  >
                    {credential.type.replace('_', ' ')}
                  </span>
                  {credential.isActive && (
                    <span
                      style={{
                        backgroundColor: DesignSystem.colors.success,
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: DesignSystem.borderRadius.sm,
                        fontSize: '12px',
                        fontWeight: 500
                      }}
                    >
                      ACTIVE
                    </span>
                  )}
                </div>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  {credential.lastUsed && (
                    <span>Last used: {new Date(credential.lastUsed).toLocaleDateString()}</span>
                  )}
                  {credential.expiresAt && (
                    <span>Expires: {new Date(credential.expiresAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSecretVisibility(credential.id)}
                >
                  {showSecrets[credential.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 size={16} color="#ef4444" />
                </Button>
              </div>
            </div>

            {/* Credential Value */}
            <div style={{
              backgroundColor: DesignSystem.colors.neutral[50],
              padding: DesignSystem.spacing[4],
              borderRadius: DesignSystem.borderRadius.sm,
              fontFamily: 'monospace',
              fontSize: '14px',
              wordBreak: 'break-all',
              border: `1px solid ${DesignSystem.colors.neutral[300]}`
            }}>
              {showSecrets[credential.id] ? credential.value : maskSecret(credential.value)}
            </div>

            {/* Expiration Warning */}
            {credential.expiresAt && credential.expiresAt < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: DesignSystem.spacing[2],
                marginTop: DesignSystem.spacing[4],
                padding: DesignSystem.spacing[2],
                backgroundColor: DesignSystem.colors.warning,
                borderRadius: DesignSystem.borderRadius.sm,
                border: `1px solid ${DesignSystem.colors.warning}`
              }}>
                <AlertCircle size={16} color={DesignSystem.colors.warning} />
                <div style={{ fontSize: '0.875rem', color: DesignSystem.colors.warning }}>
                  This credential expires soon. Consider renewing it.
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Connection Status */}
      {syncStatus !== 'idle' && (
        <Card style={{
          marginTop: DesignSystem.spacing[8],
          padding: DesignSystem.spacing[4],
          backgroundColor: syncStatus === 'success' 
            ? DesignSystem.colors.success 
            : syncStatus === 'error'
            ? DesignSystem.colors.error
            : DesignSystem.colors.warning
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: DesignSystem.spacing[2]
          }}>
            {getStatusIcon(syncStatus)}
            <div style={{ fontSize: '0.875rem' }}>
              {syncStatus === 'syncing' && 'Testing HubSpot connection...'}
              {syncStatus === 'success' && 'Connection successful! All credentials are valid.'}
              {syncStatus === 'error' && 'Connection failed. Please check your credentials.'}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CredentialsTab;
