import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth-config';
import { UserSyncService } from '@/app/admin/services/userSyncService';
import { UserRole } from '@/types/auth';

// Helper function to check admin access
async function checkAdminAccess(session: any) {
  if (!session?.user?.role) return false;
  
  const adminRoles = [UserRole.GOD_MODE, UserRole.ADMIN, UserRole.MARKETING];
  return adminRoles.includes(session.user.role);
}

// GET /api/admin/users/sync-issues - Get users with synchronization issues
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !await checkAdminAccess(session)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get users with sync issues
    const syncIssues = await UserSyncService.getUsersWithSyncIssues();

    return NextResponse.json({
      success: true,
      issues: syncIssues,
      count: syncIssues.length,
    });

  } catch (error) {
    console.error('Error fetching sync issues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sync issues' },
      { status: 500 }
    );
  }
}
