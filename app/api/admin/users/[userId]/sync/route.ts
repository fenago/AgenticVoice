import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth-config';
import { UserSyncService } from '@/app/admin/services/userSyncService';
import { UserRole } from '@/types/auth';
import { ObjectId } from 'mongodb';

// Helper function to check admin access
async function checkAdminAccess(session: any) {
  if (!session?.user?.role) return false;
  
  const adminRoles = [UserRole.GOD_MODE, UserRole.ADMIN, UserRole.MARKETING];
  return adminRoles.includes(session.user.role);
}

// POST /api/admin/users/[id]/sync - Force sync user across platforms
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
    console.log('API received userId:', userId, 'Type:', typeof userId, 'Params:', params);
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Validate ObjectId format
    console.log('Validating ObjectId:', userId, 'IsValid:', ObjectId.isValid(userId));
    if (!ObjectId.isValid(userId)) {
      console.log('ObjectId validation failed for:', userId);
      return NextResponse.json({ error: 'Invalid User ID format' }, { status: 400 });
    }

    // Force sync the user across all platforms
    const syncResult = await UserSyncService.forceSyncUser(userId);

    if (syncResult.success) {
      return NextResponse.json({
        success: true,
        message: 'User successfully synced across all platforms',
        userId,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'User sync completed with errors',
        errors: syncResult.errors,
        userId,
      }, { status: 207 }); // 207 Multi-Status for partial success
    }

  } catch (error) {
    console.error('Error forcing user sync:', error);
    return NextResponse.json(
      { error: 'Failed to sync user' },
      { status: 500 }
    );
  }
}
