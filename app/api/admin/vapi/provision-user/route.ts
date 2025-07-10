import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth-config';
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';
import { ObjectId } from 'mongodb';

// POST /api/admin/vapi/provision-user - Provision VAPI access for a user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['ADMIN', 'GOD_MODE'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { userId, vapiConfig } = await request.json();

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

    await connectMongo();

    // Get user from database
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user already has VAPI access
    if (user.vapiUserId) {
      return NextResponse.json({
        success: true,
        message: 'User already has VAPI access',
        vapiUserId: user.vapiUserId,
        vapiConfig: user.vapiConfig || {},
      });
    }

    // Provision VAPI access
    try {
      // Create VAPI user ID (in real implementation, this would call VAPI API)
      const vapiUserId = `vapi_${userId}_${Date.now()}`;
      
      // Default VAPI configuration
      const defaultVapiConfig = {
        monthlyMinuteQuota: 100, // Free tier default
        currentUsage: 0,
        voiceModel: 'eleven_labs',
        assistantSettings: {
          voice: 'rachel',
          responseTime: 'fast',
          interruptionHandling: true,
        },
        ...vapiConfig, // Override with provided config
      };

      // Update user with VAPI information
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          vapiUserId,
          vapiConfig: defaultVapiConfig,
          updatedAt: new Date(),
        },
        { new: true }
      );

      // Log the provisioning action
      console.log(`VAPI access provisioned for user ${userId} by admin ${session.user.id}`);

      return NextResponse.json({
        success: true,
        message: 'VAPI access provisioned successfully',
        user: {
          id: updatedUser._id,
          email: updatedUser.email,
          name: updatedUser.name,
          vapiUserId: updatedUser.vapiUserId,
          vapiConfig: updatedUser.vapiConfig,
        },
      });

    } catch (error: any) {
      console.error('Error provisioning VAPI access:', error);
      return NextResponse.json(
        { error: 'Failed to provision VAPI access', details: error.message },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error in VAPI provision endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
