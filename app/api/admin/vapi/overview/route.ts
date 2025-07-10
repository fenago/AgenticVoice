import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth-config';
import { UserRole } from '@/types/auth';
import { VapiService } from '@/libs/vapi';



export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || ![UserRole.ADMIN, UserRole.GOD_MODE].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
        const vapiService = new VapiService();
    const analytics = await vapiService.getSystemAnalytics();

    if (!analytics) {
      return NextResponse.json({ error: 'Failed to fetch VAPI analytics.' }, { status: 500 });
    }

    const overviewStats = {
      totalCalls: analytics.totalCalls,
      totalCustomers: analytics.totalCustomers,
      totalDurationMinutes: analytics.totalMinutes,
      averageDurationMinutes: analytics.averageCallDuration,
      callSuccessRate: analytics.callSuccessRate,
      callFailureRate: analytics.callFailureRate,
      averageCallSetupTimeSeconds: analytics.averageCallSetupTimeSeconds,
    };

    return NextResponse.json(overviewStats);
  } catch (error: any) {
    console.error('[VAPI OVERVIEW API] Error fetching VAPI overview stats:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    return NextResponse.json({ error: 'An internal server error occurred while fetching VAPI stats.' }, { status: 500 });
  }
}
