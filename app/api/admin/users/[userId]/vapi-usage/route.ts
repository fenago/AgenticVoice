import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth-config';
import { MongoClient, ObjectId } from 'mongodb';
import { UserRole } from '@/types/auth';

const MONGODB_URI = process.env.MONGODB_URI!;

// Helper function to connect to MongoDB
async function connectToDatabase() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  return client.db('test');
}

// Helper function to check admin access
async function checkAdminAccess(session: any) {
  if (!session?.user?.role) return false;
  const adminRoles = [UserRole.GOD_MODE, UserRole.ADMIN, UserRole.MARKETING];
  return adminRoles.includes(session.user.role);
}

// GET /api/admin/users/[id]/vapi-usage - Get detailed VAPI usage for user
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !checkAdminAccess(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await connectToDatabase();
    const userId = params.userId;

    // Validate userId is a valid ObjectId
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Get user with VAPI usage data
    const user = await db.collection('av_users').findOne(
      { _id: new ObjectId(userId) }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get detailed VAPI usage from call logs (this would integrate with VAPI API)
    const vapiUsage = await getDetailedVapiUsage(userId);
    
    // Calculate billing information
    const billingInfo = calculateBillingInfo(vapiUsage);

    return NextResponse.json({
      userId: userId,
      vapiUserId: user.vapiUserId || generateVapiUserId(user.email, userId),
      usage: vapiUsage,
      billing: billingInfo,
      resources: {
        assistants: user.vapi?.assistants || [],
        phoneNumbers: user.vapi?.phoneNumbers || [],
      },
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting VAPI usage:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/users/[id]/vapi-usage - Update VAPI usage manually or from webhook
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !checkAdminAccess(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const userId = params.userId;
    
    // Validate userId is a valid ObjectId
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }
    
    const {
      minutesUsed,
      callType, // 'assistant' or 'workflow'
      assistantId,
      duration,
      cost,
      callId,
      phoneNumber
    } = body;

    const db = await connectToDatabase();

    // Update user's VAPI usage
    const updateResult = await db.collection('av_users').updateOne(
      { _id: new ObjectId(userId) },
      {
        $inc: {
          'vapi.usage.monthlyMinutes': minutesUsed,
          'vapi.usage.totalCalls': 1,
          [`vapi.usage.${callType}Minutes`]: minutesUsed
        },
        $set: {
          'vapi.usage.lastActivityDate': new Date()
        }
      }
    );

    // Log the usage for billing purposes
    await db.collection('vapi_usage_logs').insertOne({
      userId: new ObjectId(userId),
      callId,
      callType,
      assistantId,
      phoneNumber,
      duration,
      minutesUsed,
      cost,
      timestamp: new Date(),
      billingMonth: new Date().toISOString().slice(0, 7), // YYYY-MM format
    });

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'VAPI usage updated successfully',
      usage: {
        minutesUsed,
        callType,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error updating VAPI usage:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to get detailed VAPI usage
async function getDetailedVapiUsage(userId: string) {
  const db = await connectToDatabase();
  
  // Get current month's usage logs
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const usageLogs = await db.collection('vapi_usage_logs')
    .find({ 
      userId: new ObjectId(userId),
      billingMonth: currentMonth
    })
    .toArray();

  // Calculate totals
  const totalMinutes = usageLogs.reduce((sum, log) => sum + (log.minutesUsed || 0), 0);
  const totalCalls = usageLogs.length;
  const assistantMinutes = usageLogs
    .filter(log => log.callType === 'assistant')
    .reduce((sum, log) => sum + (log.minutesUsed || 0), 0);
  const workflowMinutes = usageLogs
    .filter(log => log.callType === 'workflow')
    .reduce((sum, log) => sum + (log.minutesUsed || 0), 0);

  // Get user's current usage from user document
  const user = await db.collection('av_users').findOne(
    { _id: new ObjectId(userId) }
  );

  return {
    monthlyMinutes: totalMinutes,
    totalCalls: totalCalls,
    assistantMinutes: assistantMinutes,
    workflowMinutes: workflowMinutes,
    lastResetDate: user?.vapi?.usage?.lastResetDate || new Date().toISOString(),
    lastActivityDate: user?.vapi?.usage?.lastActivityDate || null,
    dailyBreakdown: await getDailyUsageBreakdown(userId, currentMonth),
    assistantBreakdown: await getAssistantUsageBreakdown(userId, currentMonth),
  };
}

// Helper function to calculate billing information
function calculateBillingInfo(usage: any) {
  const RATE_PER_MINUTE = 0.05; // $0.05 per minute
  const ASSISTANT_RATE = 0.05;   // Same rate for assistants
  const WORKFLOW_RATE = 0.05;    // Same rate for workflows
  
  const assistantCost = usage.assistantMinutes * ASSISTANT_RATE;
  const workflowCost = usage.workflowMinutes * WORKFLOW_RATE;
  const totalCost = assistantCost + workflowCost;

  return {
    ratePerMinute: RATE_PER_MINUTE,
    assistantRate: ASSISTANT_RATE,
    workflowRate: WORKFLOW_RATE,
    assistantCost: Number(assistantCost.toFixed(2)),
    workflowCost: Number(workflowCost.toFixed(2)),
    totalCost: Number(totalCost.toFixed(2)),
    estimatedMonthlyCost: Number(totalCost.toFixed(2)),
    currency: 'USD'
  };
}

// Helper function to get daily usage breakdown
async function getDailyUsageBreakdown(userId: string, month: string) {
  const db = await connectToDatabase();
  
  const pipeline = [
    {
      $match: {
        userId: new ObjectId(userId),
        billingMonth: month
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$timestamp"
          }
        },
        minutes: { $sum: "$minutesUsed" },
        calls: { $sum: 1 },
        cost: { $sum: "$cost" }
      }
    },
    {
      $sort: { "_id": 1 }
    }
  ];

  const dailyUsage = await db.collection('vapi_usage_logs')
    .aggregate(pipeline)
    .toArray();

  return dailyUsage.map(day => ({
    date: day._id,
    minutes: day.minutes,
    calls: day.calls,
    cost: Number((day.cost || 0).toFixed(2))
  }));
}

// Helper function to get assistant usage breakdown
async function getAssistantUsageBreakdown(userId: string, month: string) {
  const db = await connectToDatabase();
  
  const pipeline = [
    {
      $match: {
        userId: new ObjectId(userId),
        billingMonth: month,
        assistantId: { $exists: true, $ne: null as any }
      }
    },
    {
      $group: {
        _id: "$assistantId",
        minutes: { $sum: "$minutesUsed" },
        calls: { $sum: 1 },
        cost: { $sum: "$cost" }
      }
    },
    {
      $sort: { "minutes": -1 }
    }
  ];

  const assistantUsage = await db.collection('vapi_usage_logs')
    .aggregate(pipeline)
    .toArray();

  return assistantUsage.map(assistant => ({
    assistantId: assistant._id,
    minutes: assistant.minutes,
    calls: assistant.calls,
    cost: Number((assistant.cost || 0).toFixed(2))
  }));
}

// Helper function to generate VAPI User ID
function generateVapiUserId(email: string, mongoId: string): string {
  const emailPrefix = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  const shortId = mongoId.slice(-8);
  return `${emailPrefix}_${shortId}`;
}
