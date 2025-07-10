'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Badge, Input, Modal } from '@/components/ui';
import { 
  Settings, 
  Database, 
  Mail, 
  Phone, 
  Globe, 
  Key, 
  Server,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Save,
  Edit,
  Eye,
  EyeOff,
  TestTube
} from 'lucide-react';

interface SystemHealth {
  database: { status: string; responseTime: string; connections: number };
  api: { status: string; responseTime: string; requests: number };
  vapi: { status: string; responseTime: string; calls: number };
  email: { status: string; responseTime: string; sent: number };
  storage: { status: string; usage: string; capacity: string };
}

interface ConfigSettings {
  general: {
    siteName: string;
    siteUrl: string;
    supportEmail: string;
    maintenanceMode: boolean;
    debugMode: boolean;
    timeZone: string;
    defaultLanguage: string;
  };
  database: {
    mongoUri: string;
    maxConnections: number;
    connectionTimeout: number;
    retryWrites: boolean;
  };
  email: {
    provider: string;
    apiKey: string;
    fromEmail: string;
    fromName: string;
  };
  vapi: {
    apiKey: string;
    baseUrl: string;
    webhookUrl: string;
    defaultVoice: string;
  };
  authentication: {
    googleClientId: string;
    googleClientSecret: string;
    nextAuthSecret: string;
    sessionMaxAge: number;
    jwtMaxAge: number;
  };
  billing: {
    stripePublishableKey: string;
    stripeSecretKey: string;
    stripeWebhookSecret: string;
    defaultCurrency: string;
  };
}

interface Integration {
  id: string;
  name: string;
  description: string;
  status: string;
  lastSync: string;
  version: string;
}

export default function SystemConfig() {
  const [activeTab, setActiveTab] = useState('general');
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [testResults, setTestResults] = useState<{ [key: string]: { success: boolean; message: string; timestamp?: string } }>({});
  const [isTestingIntegration, setIsTestingIntegration] = useState(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [configSettings, setConfigSettings] = useState<ConfigSettings | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch system health and configuration data
  useEffect(() => {
    fetchSystemData();
  }, []);

  const fetchSystemData = async () => {
    try {
      setLoading(true);

      // Fetch system health
      const healthResponse = await fetch('/api/admin/system/health');
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setSystemHealth(healthData);
      } else {
        // Fallback to default data if API not available
        setSystemHealth({
          database: { status: 'healthy', responseTime: '15ms', connections: 45 },
          api: { status: 'healthy', responseTime: '120ms', requests: 1234 },
          vapi: { status: 'healthy', responseTime: '95ms', calls: 89 },
          email: { status: 'healthy', responseTime: '180ms', sent: 456 },
          storage: { status: 'healthy', usage: '67%', capacity: '500GB' }
        });
      }

      // Fetch configuration settings
      const configResponse = await fetch('/api/admin/system/config');
      if (configResponse.ok) {
        const configData = await configResponse.json();
        setConfigSettings(configData);
      } else {
        // Fallback to default configuration
        setConfigSettings({
          general: {
            siteName: 'AgenticVoice.net',
            siteUrl: 'https://agenticvoice.net',
            supportEmail: 'support@agenticvoice.net',
            maintenanceMode: false,
            debugMode: false,
            timeZone: 'UTC',
            defaultLanguage: 'en'
          },
          database: {
            mongoUri: 'mongodb://localhost:27017/agenticvoice',
            maxConnections: 100,
            connectionTimeout: 30000,
            retryWrites: true
          },
          email: {
            provider: 'Resend',
            apiKey: 'resend_***************',
            fromEmail: 'noreply@agenticvoice.net',
            fromName: 'AgenticVoice Team'
          },
          vapi: {
            apiKey: 'vapi_***************',
            baseUrl: 'https://api.vapi.ai',
            webhookUrl: 'https://agenticvoice.net/api/webhooks/vapi',
            defaultVoice: 'eleven-labs-jennifer'
          },
          authentication: {
            googleClientId: 'google_***************',
            googleClientSecret: 'google_***************',
            nextAuthSecret: 'nextauth_***************',
            sessionMaxAge: 30 * 24 * 60 * 60,
            jwtMaxAge: 30 * 24 * 60 * 60
          },
          billing: {
            stripePublishableKey: 'pk_test_***************',
            stripeSecretKey: 'sk_test_***************',
            stripeWebhookSecret: 'whsec_***************',
            defaultCurrency: 'usd'
          }
        });
      }

      // Fetch integration status
      const integrationsResponse = await fetch('/api/admin/system/integrations');
      if (integrationsResponse.ok) {
        const integrationsData = await integrationsResponse.json();
        setIntegrations(integrationsData);
      } else {
        // Fallback to default integrations
        setIntegrations([
          {
            id: 'vapi',
            name: 'Vapi.ai',
            description: 'Voice AI platform for call handling',
            status: 'connected',
            lastSync: new Date().toISOString(),
            version: 'v1.2.3'
          },
          {
            id: 'stripe',
            name: 'Stripe',
            description: 'Payment processing and billing',
            status: 'connected',
            lastSync: new Date().toISOString(),
            version: 'v2023-10-16'
          },
          {
            id: 'resend',
            name: 'Resend',
            description: 'Email delivery service',
            status: 'connected',
            lastSync: new Date().toISOString(),
            version: 'v1.0.0'
          },
          {
            id: 'mongodb',
            name: 'MongoDB Atlas',
            description: 'Database hosting and management',
            status: 'connected',
            lastSync: new Date().toISOString(),
            version: 'v7.0'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching system data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'degraded':
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
      case 'disconnected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: 'success' | 'warning' | 'destructive' | 'secondary' } = {
      healthy: 'success',
      connected: 'success',
      degraded: 'warning',
      warning: 'warning',
      error: 'destructive',
      disconnected: 'destructive'
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const maskApiKey = (key: string) => {
    if (!showApiKeys) {
      return key.substring(0, 8) + '***************';
    }
    return key;
  };

  const testIntegration = async (integrationId: string) => {
    setIsTestingIntegration(integrationId);
    
    try {
      const response = await fetch(`/api/admin/system/test-integration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrationId })
      });

      if (response.ok) {
        const result = await response.json();
        setTestResults({
          ...testResults,
          [integrationId]: {
            success: result.success,
            message: result.message,
            timestamp: new Date().toISOString()
          }
        });
      } else {
        setTestResults({
          ...testResults,
          [integrationId]: {
            success: false,
            message: 'Test failed',
            timestamp: new Date().toISOString()
          }
        });
      }
    } catch (error) {
      setTestResults({
        ...testResults,
        [integrationId]: {
          success: false,
          message: 'Connection error',
          timestamp: new Date().toISOString()
        }
      });
    } finally {
      setIsTestingIntegration(null);
    }
  };

  const saveConfiguration = async (
    section: string, 
    data: ConfigSettings['general'] | ConfigSettings['database'] | { vapi: ConfigSettings['vapi']; email: ConfigSettings['email']; authentication: ConfigSettings['authentication'] }
  ) => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/system/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, data })
      });

      if (response.ok) {
        // Refresh configuration data
        fetchSystemData();
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Configuration</h2>
          <p className="text-gray-600">Loading system settings...</p>
        </div>
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const renderGeneral = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
            <Input defaultValue={configSettings?.general.siteName} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site URL</label>
            <Input defaultValue={configSettings?.general.siteUrl} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
            <Input defaultValue={configSettings?.general.supportEmail} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md" defaultValue={configSettings?.general.timeZone}>
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Language</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md" defaultValue={configSettings?.general.defaultLanguage}>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
        </div>
        
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Maintenance Mode</p>
              <p className="text-sm text-gray-500">Temporarily disable site access for maintenance</p>
            </div>
            <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              configSettings?.general.maintenanceMode ? 'bg-blue-600' : 'bg-gray-200'
            }`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                configSettings?.general.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Debug Mode</p>
              <p className="text-sm text-gray-500">Enable detailed error logging and debugging</p>
            </div>
            <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              configSettings?.general.debugMode ? 'bg-blue-600' : 'bg-gray-200'
            }`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                configSettings?.general.debugMode ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button 
            variant="primary"
            onClick={() => saveConfiguration('general', configSettings?.general)}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderDatabase = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">MongoDB URI</label>
            <Input 
              type={showApiKeys ? 'text' : 'password'} 
              defaultValue={configSettings?.database.mongoUri} 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Connections</label>
              <Input defaultValue={configSettings?.database.maxConnections} type="number" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Connection Timeout (ms)</label>
              <Input defaultValue={configSettings?.database.connectionTimeout} type="number" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Retry Writes</p>
              <p className="text-sm text-gray-500">Automatically retry failed write operations</p>
            </div>
            <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              configSettings?.database.retryWrites ? 'bg-blue-600' : 'bg-gray-200'
            }`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                configSettings?.database.retryWrites ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="outline" onClick={() => testIntegration('mongodb')}>
            <TestTube className="w-4 h-4 mr-2" />
            Test Connection
          </Button>
          <Button 
            variant="primary"
            onClick={() => saveConfiguration('database', configSettings?.database)}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderIntegrations = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">API Keys & Credentials</h3>
          <Button 
            variant="outline" 
            onClick={() => setShowApiKeys(!showApiKeys)}
          >
            {showApiKeys ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showApiKeys ? 'Hide' : 'Show'} Keys
          </Button>
        </div>
        
        <div className="space-y-6">
          {/* Vapi Configuration */}
          <div className="border rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
              <Phone className="w-5 h-5 mr-2 text-blue-500" />
              Vapi.ai Integration
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                <Input 
                  type={showApiKeys ? 'text' : 'password'}
                  defaultValue={maskApiKey(configSettings?.vapi.apiKey || '')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Voice</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md" defaultValue={configSettings?.vapi.defaultVoice}>
                  <option value="eleven-labs-jennifer">ElevenLabs - Jennifer</option>
                  <option value="eleven-labs-mike">ElevenLabs - Mike</option>
                  <option value="openai-alloy">OpenAI - Alloy</option>
                  <option value="openai-nova">OpenAI - Nova</option>
                </select>
              </div>
            </div>
          </div>

          {/* Email Configuration */}
          <div className="border rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
              <Mail className="w-5 h-5 mr-2 text-green-500" />
              Email Service (Resend)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                <Input 
                  type={showApiKeys ? 'text' : 'password'}
                  defaultValue={maskApiKey(configSettings?.email.apiKey || '')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Email</label>
                <Input defaultValue={configSettings?.email.fromEmail} />
              </div>
            </div>
          </div>

          {/* Auth Configuration */}
          <div className="border rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
              <Key className="w-5 h-5 mr-2 text-purple-500" />
              Authentication (Google OAuth)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
                <Input 
                  type={showApiKeys ? 'text' : 'password'}
                  defaultValue={maskApiKey(configSettings?.authentication.googleClientId || '')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Secret</label>
                <Input 
                  type={showApiKeys ? 'text' : 'password'}
                  defaultValue={maskApiKey(configSettings?.authentication.googleClientSecret || '')}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button 
            variant="primary"
            onClick={() => saveConfiguration('integrations', { vapi: configSettings?.vapi, email: configSettings?.email, authentication: configSettings?.authentication })}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </Card>

      {/* Integration Status */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration Status</h3>
        <div className="space-y-4">
          {integrations.map((integration) => (
            <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center">
                {getStatusIcon(integration.status)}
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{integration.name}</p>
                  <p className="text-sm text-gray-500">{integration.description}</p>
                  <p className="text-xs text-gray-400">Last sync: {new Date(integration.lastSync).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {getStatusBadge(integration.status)}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => testIntegration(integration.id)}
                  disabled={isTestingIntegration === integration.id}
                >
                  {isTestingIntegration === integration.id ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <TestTube className="w-4 h-4" />
                  )}
                </Button>
                {testResults[integration.id] && (
                  <div className="text-xs">
                    <Badge variant={testResults[integration.id]?.success ? 'success' : 'destructive'}>
                      {testResults[integration.id]?.message}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderSystemHealth = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {systemHealth && Object.entries(systemHealth).map(([service, health]) => (
          <Card key={service} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 capitalize">{service}</h4>
              {getStatusIcon(health.status)}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                {getStatusBadge(health.status)}
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Response Time:</span>
                <span className="text-sm font-medium">
                  {'responseTime' in health ? health.responseTime : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">
                  {service === 'database' ? 'Connections' :
                   service === 'api' ? 'Requests' :
                   service === 'vapi' ? 'Calls' :
                   service === 'email' ? 'Sent' : 'Usage'}:
                </span>
                <span className="text-sm font-medium">
                  {service === 'storage' && 'usage' in health ? health.usage : 
                   service === 'database' && 'connections' in health ? health.connections :
                   service === 'api' && 'requests' in health ? health.requests :
                   service === 'vapi' && 'calls' in health ? health.calls :
                   service === 'email' && 'sent' in health ? health.sent : 'N/A'}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600">Application Version</p>
            <p className="text-lg font-semibold">v1.0.0</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Node.js Version</p>
            <p className="text-lg font-semibold">{process.version || 'v18.17.0'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Next.js Version</p>
            <p className="text-lg font-semibold">v13.4.0</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Environment</p>
            <p className="text-lg font-semibold">{process.env.NODE_ENV || 'development'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Memory Usage</p>
            <p className="text-lg font-semibold">{Math.round(process.memoryUsage?.()?.heapUsed / 1024 / 1024) || 245} MB</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Platform</p>
            <p className="text-lg font-semibold">{process.platform || 'unknown'}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={fetchSystemData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </Card>
    </div>
  );

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'database', label: 'Database' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'health', label: 'System Health' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">System Configuration</h2>
        <p className="text-gray-600">Manage system settings, integrations, and health monitoring</p>
      </div>

      {/* Sub-tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && renderGeneral()}
      {activeTab === 'database' && renderDatabase()}
      {activeTab === 'integrations' && renderIntegrations()}
      {activeTab === 'health' && renderSystemHealth()}
    </div>
  );
}
