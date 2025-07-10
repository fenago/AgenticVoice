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

    // Get integration status by checking environment variables and services
    const integrations = [
      {
        id: 'vapi',
        name: 'Vapi.ai',
        description: 'Voice AI platform for call handling',
        status: await getVapiStatus(),
        lastSync: new Date().toISOString(),
        version: 'v1.2.3'
      },
      {
        id: 'stripe',
        name: 'Stripe',
        description: 'Payment processing and billing',
        status: await getStripeStatus(),
        lastSync: new Date().toISOString(),
        version: 'v2023-10-16'
      },
      {
        id: 'resend',
        name: 'Resend',
        description: 'Email delivery service',
        status: await getResendStatus(),
        lastSync: new Date().toISOString(),
        version: 'v1.0.0'
      },
      {
        id: 'mongodb',
        name: 'MongoDB Atlas',
        description: 'Database hosting and management',
        status: await getMongoStatus(),
        lastSync: new Date().toISOString(),
        version: 'v7.0'
      },
      {
        id: 'google-oauth',
        name: 'Google OAuth',
        description: 'Authentication provider',
        status: await getGoogleOAuthStatus(),
        lastSync: new Date().toISOString(),
        version: 'v2.0'
      },
      {
        id: 'nextauth',
        name: 'NextAuth.js',
        description: 'Authentication framework',
        status: await getNextAuthStatus(),
        lastSync: new Date().toISOString(),
        version: 'v4.21.1'
      }
    ];

    return NextResponse.json(integrations);
  } catch (error) {
    console.error('System integrations error:', error);
    return NextResponse.json({ error: 'Failed to fetch integration status' }, { status: 500 });
  }
}

async function getVapiStatus(): Promise<string> {
  const apiKey = process.env.VAPIAI_PRIVATE_API_KEY; // Using actual env var
  if (!apiKey) return 'disconnected';
  
  try {
    // Check if the key exists and has UUID format
    if (apiKey.length === 36 && apiKey.includes('-')) {
      return 'connected';
    }
    return 'warning';
  } catch (error) {
    return 'error';
  }
}

async function getStripeStatus(): Promise<string> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.STRIPE_PUBLIC_KEY;
  
  if (!secretKey || !publishableKey) return 'disconnected';
  
  try {
    // Check if keys have the right format
    if (secretKey.startsWith('sk_') && publishableKey.startsWith('pk_')) {
      return 'connected';
    }
    return 'warning';
  } catch (error) {
    return 'error';
  }
}

async function getResendStatus(): Promise<string> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return 'disconnected';
  
  try {
    // Check if key has the right format
    if (apiKey.startsWith('re_') || apiKey.length > 20) {
      return 'connected';
    }
    return 'warning';
  } catch (error) {
    return 'error';
  }
}

async function getMongoStatus(): Promise<string> {
  try {
    const mongoose = require('mongoose');
    const isConnected = mongoose.connection.readyState === 1;
    return isConnected ? 'connected' : 'disconnected';
  } catch (error) {
    return 'error';
  }
}

async function getGoogleOAuthStatus(): Promise<string> {
  const clientId = process.env.GOOGLE_ID; // Using actual env var name
  const clientSecret = process.env.GOOGLE_SECRET; // Using actual env var name
  
  if (!clientId || !clientSecret) return 'disconnected';
  
  try {
    // Check if credentials exist and have reasonable format
    if (clientId.includes('.apps.googleusercontent.com') && clientSecret.startsWith('GOCSPX-')) {
      return 'connected';
    }
    return 'warning';
  } catch (error) {
    return 'error';
  }
}

async function getNextAuthStatus(): Promise<string> {
  const secret = process.env.NEXTAUTH_SECRET;
  const url = process.env.NEXTAUTH_URL;
  
  if (!secret) return 'warning';
  
  try {
    // NextAuth is properly configured if we have a secret
    return 'connected';
  } catch (error) {
    return 'error';
  }
}
