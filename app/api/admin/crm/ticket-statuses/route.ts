import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Role-based access control
    const userRole = (session.user as any).role;
    if (!['ADMIN', 'GOD_MODE', 'MARKETING'].includes(userRole)) {
      return NextResponse.json(
        { 
          error: 'Insufficient permissions',
          message: 'You must be an Admin, God Mode, or Marketing user to access tickets' 
        },
        { status: 403 }
      );
    }

    // Standard HubSpot ticket statuses
    const statuses = [
      { value: 'new', label: 'New', color: '#2563eb' },
      { value: 'waiting_on_contact', label: 'Waiting on Contact', color: '#f59e0b' },
      { value: 'waiting_on_us', label: 'Waiting on Us', color: '#dc2626' },
      { value: 'closed', label: 'Closed', color: '#059669' }
    ];

    // Standard HubSpot ticket priorities
    const priorities = [
      { value: 'LOW', label: 'Low', color: '#10b981' },
      { value: 'MEDIUM', label: 'Medium', color: '#f59e0b' },
      { value: 'HIGH', label: 'High', color: '#ef4444' },
      { value: 'URGENT', label: 'Urgent', color: '#dc2626' }
    ];

    return NextResponse.json({
      statuses,
      priorities
    });

  } catch (error) {
    console.error('Error fetching ticket statuses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
