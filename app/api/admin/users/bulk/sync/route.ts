import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth-config';
import UserSyncService from '@/app/admin/services/userSyncService';
import { ObjectId } from 'mongodb';

// POST /api/admin/users/bulk/sync - Bulk sync multiple users across platforms
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['ADMIN', 'GOD_MODE'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userIds, operation = 'sync' } = body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'userIds must be a non-empty array' },
        { status: 400 }
      );
    }

    // Validate all userIds are valid ObjectIds
    for (const userId of userIds) {
      if (!ObjectId.isValid(userId)) {
        return NextResponse.json(
          { error: `Invalid user ID format: ${userId}` },
          { status: 400 }
        );
      }
    }

    // Limit bulk operations to prevent overwhelming the system
    if (userIds.length > 50) {
      return NextResponse.json(
        { error: 'Bulk operations limited to 50 users at a time' },
        { status: 400 }
      );
    }

    try {
      let results;
      
      switch (operation) {
        case 'sync':
          results = await UserSyncService.bulkSyncUsers(userIds);
          break;
        
        case 'validate':
          // Validate consistency for multiple users
          const validationPromises = userIds.map(async (userId: string) => {
            try {
              const validation = await UserSyncService.validateUserConsistency(userId);
              return {
                userId,
                success: true,
                isConsistent: validation.isConsistent,
                conflicts: validation.conflicts,
              };
            } catch (error: any) {
              return {
                userId,
                success: false,
                error: error.message,
              };
            }
          });
          
          const validationResults = await Promise.all(validationPromises);
          results = {
            successful: validationResults.filter(r => r.success).length,
            failed: validationResults.filter(r => !r.success).length,
            results: validationResults,
          };
          break;
        
        case 'resolve_conflicts':
          // Resolve conflicts for multiple users
          const resolutionPromises = userIds.map(async (userId: string) => {
            try {
              const resolution = await UserSyncService.resolveSyncConflicts(userId);
              return {
                userId,
                success: resolution.success,
                resolvedConflicts: resolution.resolvedConflicts,
                errors: resolution.errors,
              };
            } catch (error: any) {
              return {
                userId,
                success: false,
                error: error.message,
              };
            }
          });
          
          const resolutionResults = await Promise.all(resolutionPromises);
          results = {
            successful: resolutionResults.filter(r => r.success).length,
            failed: resolutionResults.filter(r => !r.success).length,
            results: resolutionResults,
          };
          break;
        
        default:
          return NextResponse.json(
            { error: `Unsupported operation: ${operation}. Supported: sync, validate, resolve_conflicts` },
            { status: 400 }
          );
      }

      return NextResponse.json({
        success: true,
        operation,
        totalUsers: userIds.length,
        data: results,
        performedBy: session.user.email,
        timestamp: new Date(),
      });

    } catch (error: any) {
      console.error(`Error performing bulk ${operation}:`, error);
      return NextResponse.json(
        { error: `Failed to perform bulk ${operation}`, details: error.message },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error in bulk sync endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
