import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';

// Mock data storage - in production, this would be in a database
interface SyncSetting {
  enabled: boolean;
  direction: string;
  frequency: string;
  status: string;
  lastSync?: Date;
  nextSync?: Date;
}

let crmSettings = {
  credentials: [
    {
      id: '1',
      name: 'HubSpot API Key',
      type: 'api_key',
      value: process.env.HUBSPOT_TOKEN || 'NOT_CONFIGURED',
      isActive: true,
      lastUsed: new Date('2025-07-05T15:30:00Z'),
      expiresAt: new Date('2025-12-31T23:59:59Z')
    },
    {
      id: '2',
      name: 'HubSpot Webhook Secret',
      type: 'webhook_secret',
      value: process.env.HUBSPOT_WEBHOOK_SECRET || 'your-webhook-secret',
      isActive: true,
      lastUsed: new Date('2025-07-05T14:20:00Z')
    }
  ],
  syncSettings: {
    contacts: {
      enabled: true,
      direction: 'two_way',
      frequency: 'real_time',
      lastSync: new Date('2025-07-05T19:25:00Z'),
      status: 'active'
    },
    companies: {
      enabled: true,
      direction: 'one_way',
      frequency: 'hourly',
      lastSync: new Date('2025-07-05T19:00:00Z'),
      nextSync: new Date('2025-07-05T20:00:00Z'),
      status: 'active'
    },
    deals: {
      enabled: false,
      direction: 'two_way',
      frequency: 'daily',
      status: 'paused'
    },
    tickets: {
      enabled: true,
      direction: 'one_way',
      frequency: 'real_time',
      lastSync: new Date('2025-07-05T19:30:00Z'),
      status: 'active'
    }
  } as { [key: string]: SyncSetting },
  dataMappings: [
    {
      id: '1',
      hubspotProperty: 'email',
      agenticVoiceField: 'user.email',
      direction: 'bidirectional',
      isRequired: true
    },
    {
      id: '2',
      hubspotProperty: 'firstname',
      agenticVoiceField: 'user.firstName',
      direction: 'bidirectional',
      isRequired: false
    },
    {
      id: '3',
      hubspotProperty: 'lastname',
      agenticVoiceField: 'user.lastName',
      direction: 'bidirectional',
      isRequired: false
    },
    {
      id: '4',
      hubspotProperty: 'phone',
      agenticVoiceField: 'user.phone',
      direction: 'bidirectional',
      isRequired: false
    },
    {
      id: '5',
      hubspotProperty: 'company',
      agenticVoiceField: 'user.companyName',
      direction: 'to_hubspot',
      isRequired: false
    }
  ],
  webhooks: [
    {
      id: '1',
      name: 'Contact Created',
      url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/webhooks/hubspot/contacts`,
      events: ['contact.creation'],
      isActive: true,
      lastTriggered: new Date('2025-07-05T18:45:00Z')
    },
    {
      id: '2',
      name: 'Deal Updated',
      url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/webhooks/hubspot/deals`,
      events: ['deal.propertyChange'],
      isActive: true,
      lastTriggered: new Date('2025-07-05T17:30:00Z')
    }
  ],
  accessControl: {
    roles: [
      {
        id: '1',
        name: 'CRM Admin',
        permissions: ['read_all', 'write_all', 'manage_settings'],
        users: ['admin@agenticvoice.com']
      },
      {
        id: '2',
        name: 'CRM User',
        permissions: ['read_own', 'write_own'],
        users: ['user@agenticvoice.com']
      }
    ],
    apiLimits: {
      hourlyLimit: 1000,
      dailyLimit: 10000,
      currentUsage: {
        hourly: 245,
        daily: 3420
      }
    }
  }
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has admin role
    const userRole = (session.user as any).role;
    if (!['ADMIN', 'GOD_MODE'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Admin access required.' },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const section = searchParams.get('section');

    // Return specific section or all settings
    if (section) {
      switch (section) {
        case 'credentials':
          return NextResponse.json({ credentials: crmSettings.credentials });
        case 'sync':
          return NextResponse.json({ syncSettings: crmSettings.syncSettings });
        case 'mapping':
          return NextResponse.json({ dataMappings: crmSettings.dataMappings });
        case 'webhooks':
          return NextResponse.json({ webhooks: crmSettings.webhooks });
        case 'access':
          return NextResponse.json({ accessControl: crmSettings.accessControl });
        default:
          return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
      }
    }

    // Return all settings (excluding sensitive values)
    const sanitizedSettings = {
      ...crmSettings,
      credentials: crmSettings.credentials.map((cred: any) => ({
        ...cred,
        value: '***' + cred.value.slice(-4) // Show only last 4 characters
      }))
    };

    return NextResponse.json(sanitizedSettings);

  } catch (error) {
    console.error('Error fetching CRM settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has admin role
    const userRole = (session.user as any).role;
    if (!['ADMIN', 'GOD_MODE'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { section, data } = body;

    if (!section || !data) {
      return NextResponse.json(
        { error: 'Section and data are required' },
        { status: 400 }
      );
    }

    // Update specific section
    switch (section) {
      case 'credentials':
        crmSettings.credentials = data.credentials;
        break;
      case 'sync':
        crmSettings.syncSettings = { ...crmSettings.syncSettings, ...data.syncSettings };
        break;
      case 'mapping':
        crmSettings.dataMappings = data.dataMappings;
        break;
      case 'webhooks':
        crmSettings.webhooks = data.webhooks;
        break;
      case 'access':
        crmSettings.accessControl = { ...crmSettings.accessControl, ...data.accessControl };
        break;
      default:
        return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `${section} settings updated successfully`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error updating CRM settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has admin role
    const userRole = (session.user as any).role;
    if (!['ADMIN', 'GOD_MODE'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'test_connection':
        // Simulate testing HubSpot connection
        const { credentialId } = params;
        const credential = crmSettings.credentials.find(c => c.id === credentialId);
        
        if (!credential) {
          return NextResponse.json({ error: 'Credential not found' }, { status: 404 });
        }

        // Simulate connection test (in real implementation, test actual HubSpot API)
        const isValid = credential.value && credential.value.length > 10;
        
        return NextResponse.json({
          success: isValid,
          message: isValid ? 'Connection successful' : 'Invalid credentials',
          lastTested: new Date().toISOString()
        });

      case 'trigger_sync':
        // Simulate triggering a manual sync
        const { entity } = params;
        type SyncableEntity = keyof typeof crmSettings.syncSettings;

        if (entity && Object.keys(crmSettings.syncSettings).includes(entity)) {
          const validEntity = entity as SyncableEntity;
        
                  crmSettings.syncSettings[validEntity].lastSync = new Date();
          crmSettings.syncSettings[validEntity].status = 'active';
          
          return NextResponse.json({
            success: true,
            message: `${validEntity} sync triggered successfully`,
            lastSync: crmSettings.syncSettings[validEntity].lastSync
          });
        }
        
        return NextResponse.json({ error: 'Invalid entity' }, { status: 400 });

      case 'test_webhook':
        // Simulate testing webhook
        const { webhookId } = params;
        const webhook = crmSettings.webhooks.find(w => w.id === webhookId);
        
        if (!webhook) {
          return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
        }

        return NextResponse.json({
          success: true,
          message: 'Webhook test successful',
          response: { status: 200, message: 'OK' },
          lastTested: new Date().toISOString()
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error processing CRM settings action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
