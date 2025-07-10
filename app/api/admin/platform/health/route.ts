import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth-config';
import UserSyncService from '@/app/admin/services/userSyncService';

// GET /api/admin/platform/health - Get health status of all integrated platforms
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['ADMIN', 'GOD_MODE'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    try {
      const healthStatus = await UserSyncService.getPlatformHealthStatus();
      
      // Calculate overall system health
      const platforms = Object.values(healthStatus);
      const healthyCount = platforms.filter(p => p.status === 'healthy').length;
      const totalPlatforms = platforms.length;
      
      const overallHealth = healthyCount === totalPlatforms ? 'healthy' : 
        healthyCount >= totalPlatforms / 2 ? 'degraded' : 'critical';

      return NextResponse.json({
        success: true,
        data: {
          overall: {
            status: overallHealth,
            healthyPlatforms: healthyCount,
            totalPlatforms: totalPlatforms,
            lastChecked: new Date(),
          },
          platforms: healthStatus,
          summary: {
            mongodb: {
              ...healthStatus.mongodb,
              description: 'Primary user database and data store',
            },
            stripe: {
              ...healthStatus.stripe,
              description: 'Payment processing and subscription management',
            },
            vapi: {
              ...healthStatus.vapi,
              description: 'Voice AI assistant and call management',
            },
            hubspot: {
              ...healthStatus.hubspot,
              description: 'CRM and marketing automation platform',
            },
          },
        },
      });

    } catch (error: any) {
      console.error('Error checking platform health:', error);
      return NextResponse.json(
        { error: 'Failed to check platform health', details: error.message },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error in platform health endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
