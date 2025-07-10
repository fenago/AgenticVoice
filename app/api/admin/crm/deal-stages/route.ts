import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check user permissions
    const userRole = (session.user as any).role;
    if (!['ADMIN', 'GOD_MODE', 'MARKETING'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Standard HubSpot deal stages with probabilities
    const dealStages = [
      {
        id: 'appointmentscheduled',
        label: 'Appointment Scheduled',
        probability: 20
      },
      {
        id: 'qualifiedtobuy',
        label: 'Qualified to Buy',
        probability: 40
      },
      {
        id: 'presentationscheduled',
        label: 'Presentation Scheduled',
        probability: 60
      },
      {
        id: 'decisionmakerboughtin',
        label: 'Decision Maker Bought-In',
        probability: 80
      },
      {
        id: 'contractsent',
        label: 'Contract Sent',
        probability: 90
      },
      {
        id: 'closedwon',
        label: 'Closed Won',
        probability: 100
      },
      {
        id: 'closedlost',
        label: 'Closed Lost',
        probability: 0
      }
    ];

    return NextResponse.json({
      stages: dealStages
    });
  } catch (error) {
    console.error('Deal stages API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
