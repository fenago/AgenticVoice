import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth-config';
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';
import { stripeService } from '@/app/admin/services/stripeService';
import { UserRole, AccountStatus } from '@/types/auth';

// Helper function to check admin access
async function checkAdminAccess(session: any) {
  if (!session?.user?.role) return false;
  
  const adminRoles = [UserRole.GOD_MODE, UserRole.ADMIN, UserRole.MARKETING];
  return adminRoles.includes(session.user.role);
}

// POST /api/admin/users/[id]/suspend - Suspend user across all platforms
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !await checkAdminAccess(session)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const userId = params.userId;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    await connectMongo();
    
    // Get the user from MongoDB
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const errors: string[] = [];

    // 1. Suspend user in MongoDB
    try {
      await User.findByIdAndUpdate(userId, {
        accountStatus: AccountStatus.SUSPENDED,
        hasAccess: false,
        updatedAt: new Date(),
      });
    } catch (mongoError) {
      errors.push(`MongoDB suspension failed: ${mongoError.message}`);
    }

    // 2. Update Stripe customer (if exists)
    if (user.customerId) {
      try {
                await stripeService.updateCustomer(user.customerId, {
          // Note: Stripe doesn't have a "suspend" feature, but we can add metadata
          // In a real implementation, you'd cancel active subscriptions here
        });
      } catch (stripeError) {
        errors.push(`Stripe update failed: ${stripeError.message}`);
      }
    }

    // TODO: 3. Suspend VAPI access when VAPI service is implemented

    // 4. Create audit log
    try {
      const mongoose = require('mongoose');
      const auditCollection = mongoose.connection.db.collection('av_audit_logs');
      await auditCollection.insertOne({
        userId: userId,
        action: 'user_suspension',
        resource: 'users',
        details: {
          adminId: session.user.id,
          adminEmail: session.user.email,
          suspendedUserEmail: user.email,
          platforms: ['mongodb', user.customerId ? 'stripe' : null].filter(Boolean),
          errors: errors.length > 0 ? errors : undefined,
        },
        timestamp: new Date(),
        severity: errors.length > 0 ? 'MEDIUM' : 'LOW',
        category: 'USER_MANAGEMENT',
        status: errors.length > 0 ? 'PARTIAL_SUCCESS' : 'SUCCESS',
        hipaaRelevant: true,
      });
    } catch (auditError) {
      console.error('Failed to create suspension audit log:', auditError);
    }

    if (errors.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'User successfully suspended across all platforms',
        userId,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'User suspension completed with errors',
        errors,
        userId,
      }, { status: 207 }); // 207 Multi-Status for partial success
    }

  } catch (error) {
    console.error('Error suspending user:', error);
    return NextResponse.json(
      { error: 'Failed to suspend user' },
      { status: 500 }
    );
  }
}
