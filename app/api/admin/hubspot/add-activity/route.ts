import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth-config';
import { UserRole } from '@/types/auth';
import HubSpotService from '@/libs/hubspot';

/**
 * Add activity note to HubSpot contact
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check role authorization
    const userRole = session.user.role as UserRole;
    if (!['ADMIN', 'GOD_MODE', 'MARKETING'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { email, activityType, activityDetails, activities } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const hubspotService = new HubSpotService();

    if (activities && Array.isArray(activities)) {
      // Log multiple activities
      await hubspotService.logUserActivities(email, activities);
      return NextResponse.json({ 
        success: true, 
        message: `Added ${activities.length} activity notes for ${email}` 
      });
    } else if (activityType && activityDetails) {
      // Log single activity
      await hubspotService.addActivityNote(email, activityType, activityDetails);
      return NextResponse.json({ 
        success: true, 
        message: `Activity note added for ${email}` 
      });
    } else {
      return NextResponse.json({ 
        error: 'Either single activity (activityType + activityDetails) or activities array is required' 
      }, { status: 400 });
    }

  } catch (error) {
    console.error('HubSpot add activity error:', error);
    return NextResponse.json({ 
      error: 'Failed to add activity note',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
