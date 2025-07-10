import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth-config';
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';
import { ObjectId } from 'mongodb';

// GET /api/admin/hubspot/analytics/[userId] - Get HubSpot engagement analytics for a user
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['ADMIN', 'GOD_MODE', 'MARKETING'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin or Marketing access required' },
        { status: 403 }
      );
    }

    const { userId } = params;
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || '30d'; // 7d, 30d, 90d, 1y

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

    if (!user.hubspotContactId) {
      return NextResponse.json({
        success: true,
        data: {
          userId: user._id,
          hubspotContactId: null,
          hasAnalytics: false,
          message: 'User does not have HubSpot analytics (no contact ID)',
        },
      });
    }

    try {
      // In a real implementation, this would call HubSpot Analytics API
      // For now, we'll simulate analytics data based on user activity
      
      const daysInPeriod = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
      const userAge = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      const activeDays = Math.min(userAge, daysInPeriod);

      const mockAnalytics = {
        userId: user._id,
        hubspotContactId: user.hubspotContactId,
        period: {
          type: period,
          days: daysInPeriod,
          startDate: new Date(Date.now() - daysInPeriod * 24 * 60 * 60 * 1000),
          endDate: new Date(),
        },
        engagement: {
          emailEngagement: {
            emailsSent: Math.floor(activeDays * 0.2),
            emailsOpened: Math.floor(activeDays * 0.15),
            emailsClicked: Math.floor(activeDays * 0.05),
            openRate: '75%',
            clickRate: '25%',
          },
          websiteActivity: {
            pageViews: Math.floor(activeDays * 2.5),
            sessions: Math.floor(activeDays * 0.8),
            averageSessionDuration: '3:45',
            bounceRate: '35%',
            topPages: [
              '/dashboard',
              '/features/voice-assistant',
              '/billing',
              '/profile',
            ],
          },
          leadScoring: {
            currentScore: user.role === 'FREE' ? 25 : user.role === 'ESSENTIAL' ? 50 : user.role === 'PRO' ? 75 : 90,
            scoreChanges: [
              { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), score: 20, reason: 'Page view activity' },
              { date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), score: 15, reason: 'Email engagement' },
              { date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), score: 10, reason: 'Account creation' },
            ],
            factors: {
              emailEngagement: 30,
              websiteActivity: 25,
              featureUsage: 20,
              subscriptionLevel: 15,
              demographics: 10,
            },
          },
          socialMedia: {
            linkedinViews: Math.floor(activeDays * 0.1),
            twitterEngagements: Math.floor(activeDays * 0.05),
            facebookInteractions: Math.floor(activeDays * 0.02),
          },
        },
        conversion: {
          lifecycleStage: user.role === 'FREE' ? 'lead' : 'customer',
          lastStageChange: user.updatedAt,
          conversionEvents: [
            {
              event: 'Account Created',
              date: user.createdAt,
              source: 'website',
            },
            ...(user.role !== 'FREE' ? [{
              event: 'Subscription Upgrade',
              date: user.updatedAt,
              source: 'product',
            }] : []),
          ],
        },
        marketingAttribution: {
          firstTouchSource: 'organic_search',
          lastTouchSource: 'direct',
          campaignAttribution: [
            { campaign: 'AgenticVoice Q4 2024', contribution: 60 },
            { campaign: 'Voice AI Webinar Series', contribution: 30 },
            { campaign: 'Retargeting Campaign', contribution: 10 },
          ],
        },
        predictions: {
          churnRisk: user.role === 'FREE' ? 'medium' : 'low',
          upsellProbability: user.role === 'FREE' ? 'high' : 'medium',
          lifetimeValueEstimate: user.role === 'FREE' ? 150 : user.role === 'ESSENTIAL' ? 500 : 1200,
          nextBestAction: user.role === 'FREE' ? 'Schedule demo call' : 'Feature education email',
        },
        lastUpdated: new Date(),
      };

      return NextResponse.json({
        success: true,
        data: mockAnalytics,
      });

    } catch (error: any) {
      console.error('Error fetching HubSpot analytics:', error);
      return NextResponse.json(
        { error: 'Failed to fetch HubSpot analytics', details: error.message },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error in HubSpot analytics endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
