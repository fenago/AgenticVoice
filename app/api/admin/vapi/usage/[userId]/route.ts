import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth-config';
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';
import { ObjectId } from 'mongodb';

// GET /api/admin/vapi/usage/[userId] - Get detailed VAPI usage data for a user
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['ADMIN', 'GOD_MODE'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { userId } = params;
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'current_month'; // current_month, last_month, last_3_months, all_time

    // Validate userId is a valid ObjectId
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
    }

    await connectMongo();

    // Get user from database
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.vapiUserId) {
      return NextResponse.json({
        success: true,
        data: {
          userId: user._id,
          vapiUserId: null,
          hasVapiAccess: false,
          message: 'User does not have VAPI access',
        },
      });
    }

    try {
      // Calculate date range based on period
      let startDate: Date;
      const endDate = new Date();
      
      switch (period) {
        case 'last_month':
          startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);
          endDate.setDate(0); // Last day of previous month
          break;
        case 'last_3_months':
          startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 3, 1);
          break;
        case 'all_time':
          startDate = new Date(user.createdAt || new Date('2024-01-01'));
          break;
        default: // current_month
          startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
      }

      // In a real implementation, this would fetch data from VAPI API
      // For now, we'll use the data from user's vapiConfig and simulate additional metrics
      const vapiConfig = user.vapiConfig || {};
      
      // Mock usage data based on current config and some realistic patterns
      const currentUsage = vapiConfig.currentUsage || 0;
      const monthlyQuota = vapiConfig.monthlyMinuteQuota || 100;
      
      const usageData = {
        userId: user._id,
        vapiUserId: user.vapiUserId,
        hasVapiAccess: true,
        period: {
          type: period,
          startDate,
          endDate,
        },
        quota: {
          monthlyMinutes: monthlyQuota,
          usedMinutes: currentUsage,
          remainingMinutes: Math.max(0, monthlyQuota - currentUsage),
          utilizationPercentage: monthlyQuota > 0 ? Math.round((currentUsage / monthlyQuota) * 100) : 0,
        },
        usage: {
          totalCalls: Math.floor(currentUsage / 2.5), // Average 2.5 minutes per call
          totalMinutes: currentUsage,
          totalCost: (currentUsage * 0.04).toFixed(2), // $0.04 per minute
          averageCallDuration: currentUsage > 0 ? 2.5 : 0,
        },
        breakdown: {
          inboundCalls: Math.floor(currentUsage * 0.6),
          outboundCalls: Math.floor(currentUsage * 0.4),
          successfulCalls: Math.floor((currentUsage / 2.5) * 0.9),
          failedCalls: Math.floor((currentUsage / 2.5) * 0.1),
        },
        trends: {
          dailyAverage: currentUsage / 30,
          weeklyAverage: currentUsage / 4,
          peakUsageDay: 'Tuesday',
          peakUsageHour: '2:00 PM',
        },
        lastUpdated: new Date(),
      };

      // Add cost breakdown
      const costBreakdown = {
        voiceMinutes: (currentUsage * 0.03).toFixed(2),
        apiCalls: (Math.floor(currentUsage / 2.5) * 0.01).toFixed(2),
        total: usageData.usage.totalCost,
      };

      return NextResponse.json({
        success: true,
        data: {
          ...usageData,
          costBreakdown,
          config: {
            voiceModel: vapiConfig.voiceModel || 'eleven_labs',
            assistantSettings: vapiConfig.assistantSettings || {},
            lastConfigUpdate: user.updatedAt,
          },
        },
      });

    } catch (error: any) {
      console.error('Error fetching VAPI usage data:', error);
      return NextResponse.json(
        { error: 'Failed to fetch usage data', details: error.message },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error in VAPI usage endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
