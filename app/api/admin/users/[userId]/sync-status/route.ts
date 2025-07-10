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

// GET /api/admin/users/[id]/sync-status - Get user's cross-platform sync status
export async function GET(
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

    // Validate userId is a valid ObjectId
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
    }

    // Get user sync status
    const syncStatus = await UserSyncService.getUserSyncStatus(userId);

    if (!syncStatus) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      syncData: syncStatus,
    });

  } catch (error) {
    console.error('Error fetching user sync status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sync status' },
      { status: 500 }
    );
  }
}
