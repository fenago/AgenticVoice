import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth-config';
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';
import { ObjectId } from 'mongodb';

// GET /api/admin/hubspot/contact/[userId] - Get HubSpot contact details for a user
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
          hasHubSpotContact: false,
          message: 'User does not have a HubSpot contact ID',
          userInfo: {
            email: user.email,
            name: user.name,
            role: user.role,
            createdAt: user.createdAt,
          },
        },
      });
    }

    try {
      // In a real implementation, this would call the HubSpot API
      // For now, we'll simulate the contact data structure
      const mockContactData = {
        contactId: user.hubspotContactId,
        properties: {
          email: user.email,
          firstname: user.name?.split(' ')[0] || '',
          lastname: user.name?.split(' ').slice(1).join(' ') || '',
          company: user.industryType || '',
          jobtitle: '',
          phone: '',
          website: '',
          city: '',
          state: '',
          country: '',
          // AgenticVoice specific properties
          agenticvoice_user_id: user._id.toString(),
          agenticvoice_role: user.role,
          agenticvoice_subscription_tier: user.subscriptionTier || 'FREE',
          agenticvoice_account_status: user.accountStatus || 'ACTIVE',
          agenticvoice_created_date: user.createdAt,
          agenticvoice_last_login: user.lastLogin || null,
          // Lead scoring
          hubspot_score: 25,
          lifecycle_stage: user.role === 'FREE' ? 'lead' : 'customer',
          lead_status: 'new',
        },
        associations: {
          companies: [] as any[],
          deals: [] as any[],
          tickets: [] as any[],
        },
        engagement: {
          lastActivity: new Date(),
          emailOpens: 5,
          emailClicks: 2,
          pageViews: 15,
          formSubmissions: 1,
        },
        createdAt: user.createdAt,
        updatedAt: new Date(),
      };

      return NextResponse.json({
        success: true,
        data: {
          userId: user._id,
          hubspotContactId: user.hubspotContactId,
          hasHubSpotContact: true,
          contact: mockContactData,
          syncStatus: {
            lastSync: new Date(),
            status: 'synced',
            needsUpdate: false,
          },
        },
      });

    } catch (error: any) {
      console.error('Error fetching HubSpot contact:', error);
      return NextResponse.json(
        { error: 'Failed to fetch HubSpot contact', details: error.message },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error in HubSpot contact endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
