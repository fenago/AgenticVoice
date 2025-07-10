import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth-config';
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';
import { ObjectId } from 'mongodb';

// GET /api/admin/vapi/call-logs/[userId] - Get user's VAPI call history
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['ADMIN', 'GOD_MODE'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { userId } = params;
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');

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

    if (!user.vapiUserId) {
      return NextResponse.json(
        { error: 'User does not have VAPI access' },
        { status: 400 }
      );
    }

    try {
      // In a real implementation, this would call the VAPI API to get call logs
      // For now, we'll simulate the response structure
      
      // Mock call logs data structure
      const mockCallLogs = [
        {
          id: `call_${Date.now() - 86400000}`,
          userId: user.vapiUserId,
          startTime: new Date(Date.now() - 86400000),
          endTime: new Date(Date.now() - 86400000 + 120000),
          duration: 120, // seconds
          status: 'completed',
          phoneNumber: '+1234567890',
          assistantId: 'asst_abc123',
          transcript: 'Sample call transcript...',
          cost: 0.05,
          summary: 'Customer inquiry about product features',
        },
        {
          id: `call_${Date.now() - 172800000}`,
          userId: user.vapiUserId,
          startTime: new Date(Date.now() - 172800000),
          endTime: new Date(Date.now() - 172800000 + 90000),
          duration: 90,
          status: 'completed',
          phoneNumber: '+0987654321',
          assistantId: 'asst_xyz789',
          transcript: 'Another sample call transcript...',
          cost: 0.04,
          summary: 'Support call for technical issue',
        },
      ];

      // Filter by date range if provided
      let filteredLogs = mockCallLogs;
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        filteredLogs = filteredLogs.filter(log => log.startTime >= fromDate);
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        filteredLogs = filteredLogs.filter(log => log.startTime <= toDate);
      }

      // Apply pagination
      const paginatedLogs = filteredLogs.slice(offset, offset + limit);

      // Calculate summary statistics
      const totalCalls = filteredLogs.length;
      const totalDuration = filteredLogs.reduce((sum, log) => sum + log.duration, 0);
      const totalCost = filteredLogs.reduce((sum, log) => sum + log.cost, 0);

      return NextResponse.json({
        success: true,
        data: {
          userId: user._id,
          vapiUserId: user.vapiUserId,
          callLogs: paginatedLogs,
          pagination: {
            total: totalCalls,
            limit,
            offset,
            hasMore: offset + limit < totalCalls,
          },
          summary: {
            totalCalls,
            totalDurationSeconds: totalDuration,
            totalDurationMinutes: Math.round(totalDuration / 60),
            totalCost: totalCost.toFixed(2),
            averageCallDuration: totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0,
          },
        },
      });

    } catch (error: any) {
      console.error('Error fetching VAPI call logs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch call logs', details: error.message },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error in VAPI call-logs endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
