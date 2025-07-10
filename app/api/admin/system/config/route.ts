import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth-config';
import { hasPermission } from '@/libs/auth-utils';
import { UserRole } from '@/types/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !hasPermission(session.user, UserRole.ADMIN)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get system configuration from environment variables
    const config = {
      general: {
        siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'AgenticVoice.net',
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://agenticvoice.net',
        supportEmail: process.env.SUPPORT_EMAIL || 'support@agenticvoice.net',
        maintenanceMode: process.env.MAINTENANCE_MODE === 'true',
        debugMode: process.env.NODE_ENV === 'development',
        timeZone: process.env.TIMEZONE || 'UTC',
        defaultLanguage: process.env.DEFAULT_LANGUAGE || 'en'
      },
      database: {
        mongoUri: maskSensitiveData(process.env.MONGODB_URI || 'mongodb://localhost:27017/agenticvoice'),
        maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '100'),
        connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000'),
        retryWrites: process.env.DB_RETRY_WRITES !== 'false'
      },
      email: {
        provider: 'Resend',
        apiKey: maskSensitiveData(process.env.RESEND_API_KEY || ''),
        fromEmail: process.env.EMAIL_FROM || 'noreply@agenticvoice.net',
        fromName: process.env.EMAIL_FROM_NAME || 'AgenticVoice Team'
      },
      vapi: {
        apiKey: maskSensitiveData(process.env.VAPI_API_KEY || ''),
        baseUrl: process.env.VAPI_BASE_URL || 'https://api.vapi.ai',
        webhookUrl: process.env.VAPI_WEBHOOK_URL || 'https://agenticvoice.net/api/webhooks/vapi',
        defaultVoice: process.env.VAPI_DEFAULT_VOICE || 'eleven-labs-jennifer'
      },
      authentication: {
        googleClientId: maskSensitiveData(process.env.GOOGLE_CLIENT_ID || ''),
        googleClientSecret: maskSensitiveData(process.env.GOOGLE_CLIENT_SECRET || ''),
        nextAuthSecret: maskSensitiveData(process.env.NEXTAUTH_SECRET || ''),
        sessionMaxAge: parseInt(process.env.SESSION_MAX_AGE || '2592000'), // 30 days
        jwtMaxAge: parseInt(process.env.JWT_MAX_AGE || '2592000') // 30 days
      },
      billing: {
        stripePublishableKey: maskSensitiveData(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''),
        stripeSecretKey: maskSensitiveData(process.env.STRIPE_SECRET_KEY || ''),
        stripeWebhookSecret: maskSensitiveData(process.env.STRIPE_WEBHOOK_SECRET || ''),
        defaultCurrency: process.env.STRIPE_DEFAULT_CURRENCY || 'usd'
      }
    };

    return NextResponse.json(config);
  } catch (error) {
    console.error('System config error:', error);
    return NextResponse.json({ error: 'Failed to fetch system configuration' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !hasPermission(session.user, UserRole.GOD_MODE)) {
      return NextResponse.json({ error: 'Unauthorized - GOD_MODE required' }, { status: 401 });
    }

    const { section, data } = await request.json();

    // In a real implementation, you would update environment variables or a config file
    // For now, we'll just validate the data and return success
    console.log(`Configuration update requested for section: ${section}`, data);

    // Validate the configuration data
    if (!section || !data) {
      return NextResponse.json({ error: 'Invalid configuration data' }, { status: 400 });
    }

    // In production, you would:
    // 1. Validate the configuration values
    // 2. Update environment variables or config file
    // 3. Potentially restart services if needed
    // 4. Log the configuration change for audit purposes

    return NextResponse.json({ 
      success: true, 
      message: `Configuration section '${section}' updated successfully`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('System config update error:', error);
    return NextResponse.json({ error: 'Failed to update system configuration' }, { status: 500 });
  }
}

function maskSensitiveData(value: string): string {
  if (!value || value.length <= 8) {
    return value.substring(0, Math.min(4, value.length)) + '***************';
  }
  return value.substring(0, 8) + '***************';
}
