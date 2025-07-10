import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';

// Mock error logs data - in production, this would be in a database
let errorLogs = [
  {
    id: '1',
    timestamp: new Date('2025-07-05T19:15:00Z'),
    level: 'error',
    source: 'hubspot_api',
    operation: 'sync_contacts',
    message: 'Rate limit exceeded for HubSpot API',
    details: {
      endpoint: '/crm/v3/objects/contacts',
      responseCode: 429,
      retryAfter: 60
    },
    resolved: true,
    resolvedAt: new Date('2025-07-05T19:17:00Z'),
    resolvedBy: 'auto_retry'
  },
  {
    id: '2',
    timestamp: new Date('2025-07-05T18:30:00Z'),
    level: 'warning',
    source: 'data_mapping',
    operation: 'map_company_data',
    message: 'Missing required field: company_size',
    details: {
      recordId: 'comp_12345',
      missingFields: ['company_size', 'industry']
    },
    resolved: false
  },
  {
    id: '3',
    timestamp: new Date('2025-07-05T17:45:00Z'),
    level: 'error',
    source: 'webhook',
    operation: 'process_contact_update',
    message: 'Webhook endpoint unreachable',
    details: {
      webhookUrl: 'https://api.agenticvoice.com/webhooks/contacts',
      httpStatus: 503,
      attempts: 3
    },
    resolved: false
  },
  {
    id: '4',
    timestamp: new Date('2025-07-05T16:20:00Z'),
    level: 'info',
    source: 'sync_engine',
    operation: 'daily_sync',
    message: 'Daily sync completed successfully',
    details: {
      recordsProcessed: 1247,
      recordsUpdated: 89,
      recordsCreated: 23,
      duration: '2m 34s'
    },
    resolved: true
  },
  {
    id: '5',
    timestamp: new Date('2025-07-05T15:10:00Z'),
    level: 'error',
    source: 'authentication',
    operation: 'refresh_token',
    message: 'Failed to refresh HubSpot access token',
    details: {
      tokenType: 'access_token',
      expiryDate: '2025-07-05T15:00:00Z',
      errorCode: 'INVALID_REFRESH_TOKEN'
    },
    resolved: true,
    resolvedAt: new Date('2025-07-05T15:12:00Z'),
    resolvedBy: 'manual_token_update'
  }
];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has admin role
    const userRole = (session.user as any).role;
    if (!['ADMIN', 'GOD_MODE'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Admin access required.' },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const level = searchParams.get('level'); // error, warning, info
    const source = searchParams.get('source'); // hubspot_api, webhook, sync_engine, etc.
    const resolved = searchParams.get('resolved'); // true, false
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let filteredLogs = [...errorLogs];

    // Apply filters
    if (level) {
      filteredLogs = filteredLogs.filter((log: any) => log.level === level);
    }

    if (source) {
      filteredLogs = filteredLogs.filter((log: any) => log.source === source);
    }

    if (resolved !== null) {
      const isResolved = resolved === 'true';
      filteredLogs = filteredLogs.filter((log: any) => log.resolved === isResolved);
    }

    if (startDate) {
      const start = new Date(startDate);
      filteredLogs = filteredLogs.filter((log: any) => log.timestamp >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      filteredLogs = filteredLogs.filter((log: any) => log.timestamp <= end);
    }

    // Sort by timestamp (most recent first)
    filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply pagination
    const paginatedLogs = filteredLogs.slice(offset, offset + limit);

    // Get summary statistics
    const summary = {
      total: filteredLogs.length,
      byLevel: {
        error: filteredLogs.filter((log: any) => log.level === 'error').length,
        warning: filteredLogs.filter((log: any) => log.level === 'warning').length,
        info: filteredLogs.filter((log: any) => log.level === 'info').length
      },
      resolved: filteredLogs.filter((log: any) => log.resolved).length,
      unresolved: filteredLogs.filter((log: any) => !log.resolved).length
    };

    return NextResponse.json({
      logs: paginatedLogs,
      summary,
      pagination: {
        total: filteredLogs.length,
        limit,
        offset,
        hasMore: offset + limit < filteredLogs.length
      }
    });

  } catch (error) {
    console.error('Error fetching error logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has admin role
    const userRole = (session.user as any).role;
    if (!['ADMIN', 'GOD_MODE'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, logIds, resolution } = body;

    if (action === 'resolve') {
      if (!logIds || !Array.isArray(logIds)) {
        return NextResponse.json(
          { error: 'logIds array is required' },
          { status: 400 }
        );
      }

      const updatedLogs = errorLogs.map((log: any) => {
        if (logIds.includes(log.id) && !log.resolved) {
          return {
            ...log,
            resolved: true,
            resolvedAt: new Date(),
            resolvedBy: session.user?.email || 'admin',
            resolution: resolution || 'Manually resolved'
          };
        }
        return log;
      });

      errorLogs = updatedLogs;

      return NextResponse.json({
        success: true,
        message: `${logIds.length} log(s) marked as resolved`,
        resolvedCount: logIds.length
      });
    }

    if (action === 'clear') {
      const { level, olderThan } = body;
      let clearedCount = 0;

      if (olderThan) {
        const cutoffDate = new Date(olderThan);
        const originalLength = errorLogs.length;
        
        errorLogs = errorLogs.filter((log: any) => {
          if (level && log.level !== level) return true;
          return log.timestamp >= cutoffDate;
        });
        
        clearedCount = originalLength - errorLogs.length;
      }

      return NextResponse.json({
        success: true,
        message: `${clearedCount} log(s) cleared`,
        clearedCount
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error updating error logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { level, source, operation, message, details } = body;

    if (!level || !source || !operation || !message) {
      return NextResponse.json(
        { error: 'level, source, operation, and message are required' },
        { status: 400 }
      );
    }

    const newLog = {
      id: Date.now().toString(),
      timestamp: new Date(),
      level,
      source,
      operation,
      message,
      details: details || {},
      resolved: false
    };

    errorLogs.unshift(newLog); // Add to beginning of array

    return NextResponse.json({
      success: true,
      message: 'Log entry created',
      logId: newLog.id
    });

  } catch (error) {
    console.error('Error creating log entry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
