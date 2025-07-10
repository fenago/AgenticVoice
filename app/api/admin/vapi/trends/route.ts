import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/libs/auth-config';
import { UserRole } from '@/types/auth';
import { VapiService } from '@/libs/vapi';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || ![UserRole.ADMIN, UserRole.GOD_MODE].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const vapiService = new VapiService();
    const analytics = await vapiService.getSystemAnalytics();

    const trends = analytics.performanceTrends.map(trend => ({
      date: trend.date,
      calls: trend.calls,
      cost: trend.cost,
    }));
    return NextResponse.json(trends);
  } catch (error: any) {
    console.error('Error fetching VAPI trends data:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}
