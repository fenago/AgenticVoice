import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth-config';
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';
import { ObjectId } from 'mongodb';

// POST /api/admin/vapi/update-quota - Update user's VAPI quotas
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['ADMIN', 'GOD_MODE'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { 
      userId, 
      monthlyMinuteQuota, 
      additionalMinutes = 0,
      resetUsage = false 
    } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate userId is a valid ObjectId
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
    }

    if (monthlyMinuteQuota !== undefined && (monthlyMinuteQuota < 0 || monthlyMinuteQuota > 10000)) {
      return NextResponse.json(
        { error: 'Monthly quota must be between 0 and 10000 minutes' },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: 'User does not have VAPI access provisioned' },
        { status: 400 }
      );
    }

    // Prepare update object
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Update VAPI configuration
    const currentVapiConfig = user.vapiConfig || {};
    const updatedVapiConfig = { ...currentVapiConfig };

    // Update monthly quota if provided
    if (monthlyMinuteQuota !== undefined) {
      updatedVapiConfig.monthlyMinuteQuota = monthlyMinuteQuota;
    }

    // Add additional minutes to current quota
    if (additionalMinutes > 0) {
      updatedVapiConfig.monthlyMinuteQuota = 
        (updatedVapiConfig.monthlyMinuteQuota || 0) + additionalMinutes;
    }

    // Reset usage if requested
    if (resetUsage) {
      updatedVapiConfig.currentUsage = 0;
      updatedVapiConfig.lastUsageReset = new Date();
    }

    updateData.vapiConfig = updatedVapiConfig;

    try {
      // Update user in database
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true }
      );

      // Log the quota update action
      console.log(`VAPI quota updated for user ${userId} by admin ${session.user.id}`, {
        oldQuota: currentVapiConfig.monthlyMinuteQuota,
        newQuota: updatedVapiConfig.monthlyMinuteQuota,
        additionalMinutes,
        resetUsage,
      });

      return NextResponse.json({
        success: true,
        message: 'VAPI quota updated successfully',
        user: {
          id: updatedUser._id,
          email: updatedUser.email,
          name: updatedUser.name,
          vapiUserId: updatedUser.vapiUserId,
          vapiConfig: updatedUser.vapiConfig,
        },
        changes: {
          monthlyMinuteQuota: updatedVapiConfig.monthlyMinuteQuota,
          currentUsage: updatedVapiConfig.currentUsage,
          additionalMinutesAdded: additionalMinutes,
          usageReset: resetUsage,
        },
      });

    } catch (error: any) {
      console.error('Error updating VAPI quota:', error);
      return NextResponse.json(
        { error: 'Failed to update VAPI quota', details: error.message },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error in VAPI update-quota endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
