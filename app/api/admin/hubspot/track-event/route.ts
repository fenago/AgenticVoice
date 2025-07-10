import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth-config';
import { UserRole } from '@/types/auth';
import HubSpotService from '@/libs/hubspot';

async function checkAdminAccess(session: any) {
  if (!session?.user?.role) return false;
  const adminRoles = [UserRole.GOD_MODE, UserRole.ADMIN, UserRole.MARKETING];
  return adminRoles.includes(session.user.role);
}

// POST /api/admin/hubspot/track-event - Track user events
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !await checkAdminAccess(session)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { eventName, email, properties } = await request.json();
    
    if (!eventName || !email) {
      return NextResponse.json({ 
        error: 'Event name and email are required' 
      }, { status: 400 });
    }

    // Initialize HubSpot service and track event
    const hubspotService = new HubSpotService();
    await hubspotService.trackEvent({
      eventName,
      email,
      properties: properties || {},
      occurredAt: Date.now()
    });

    return NextResponse.json({
      success: true,
      message: 'Event tracked successfully',
      event: {
        eventName,
        email,
        properties,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error tracking HubSpot event:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
