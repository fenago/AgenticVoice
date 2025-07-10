import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI!;
const VAPI_WEBHOOK_SECRET = process.env.VAPI_WEBHOOK_SECRET;

// Helper function to connect to MongoDB
async function connectToDatabase() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  return client.db('test');
}

// POST /api/webhooks/vapi - Handle VAPI webhooks for usage tracking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verify webhook signature (if VAPI provides one)
    if (VAPI_WEBHOOK_SECRET) {
      const signature = request.headers.get('x-vapi-signature');
      if (!signature || !verifyVapiSignature(body, signature, VAPI_WEBHOOK_SECRET)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const { type, data } = body;

    switch (type) {
      case 'call.ended':
        return await handleCallEnded(data);
      case 'call.started':
        return await handleCallStarted(data);
      case 'assistant.used':
        return await handleAssistantUsed(data);
      case 'workflow.executed':
        return await handleWorkflowExecuted(data);
      default:
        console.log(`Unhandled VAPI webhook type: ${type}`);
        return NextResponse.json({ message: 'Webhook received' });
    }

  } catch (error) {
    console.error('Error processing VAPI webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle call ended webhook
async function handleCallEnded(data: any) {
  const {
    id: callId,
    assistantId,
    phoneNumber,
    duration, // in seconds
    cost,
    endedReason,
    transcript,
    metadata
  } = data;

  // Extract user info from assistant name or metadata
  const userId = await getUserIdFromAssistant(assistantId) || metadata?.userId;
  
  if (!userId) {
    console.warn('No user ID found for call:', callId);
    return NextResponse.json({ message: 'No user ID found' });
  }

  const db = await connectToDatabase();
  const durationMinutes = Math.ceil(duration / 60); // Round up to nearest minute
  const callType = metadata?.type || 'assistant'; // 'assistant' or 'workflow'

  try {
    // Update user's VAPI usage
    await db.collection('av_users').updateOne(
      { _id: new ObjectId(userId) },
      {
        $inc: {
          'vapi.usage.monthlyMinutes': durationMinutes,
          'vapi.usage.totalCalls': 1,
          [`vapi.usage.${callType}Minutes`]: durationMinutes
        },
        $set: {
          'vapi.usage.lastActivityDate': new Date()
        }
      },
      { upsert: false }
    );

    // Log detailed usage for billing
    await db.collection('vapi_usage_logs').insertOne({
      userId: new ObjectId(userId),
      callId,
      assistantId,
      phoneNumber,
      duration, // seconds
      durationMinutes,
      cost: cost || (durationMinutes * 0.05), // $0.05 per minute default
      callType,
      endedReason,
      timestamp: new Date(),
      billingMonth: new Date().toISOString().slice(0, 7), // YYYY-MM
      metadata: {
        transcript: transcript ? 'available' : 'none',
        ...metadata
      }
    });

    // Check if user is approaching usage limits
    const user = await db.collection('av_users').findOne(
      { _id: new ObjectId(userId) }
    );

    if (user) {
      const monthlyLimit = getMonthlyLimitByRole(user.role);
      const currentUsage = user.vapi?.usage?.monthlyMinutes || 0;
      
      if (currentUsage >= monthlyLimit * 0.8) { // 80% threshold
        await sendUsageAlert(user, currentUsage, monthlyLimit);
      }
    }

    console.log(`VAPI usage tracked for user ${userId}: ${durationMinutes} minutes`);
    
    return NextResponse.json({
      message: 'Usage tracked successfully',
      userId,
      minutes: durationMinutes,
      type: callType
    });

  } catch (error) {
    console.error('Error tracking VAPI usage:', error);
    return NextResponse.json({ error: 'Failed to track usage' }, { status: 500 });
  }
}

// Handle call started webhook
async function handleCallStarted(data: any) {
  const { id: callId, assistantId, phoneNumber, metadata } = data;
  
  const userId = await getUserIdFromAssistant(assistantId) || metadata?.userId;
  
  if (!userId) {
    return NextResponse.json({ message: 'No user ID found' });
  }

  const db = await connectToDatabase();

  // Log call start for analytics
  await db.collection('vapi_call_logs').insertOne({
    userId: new ObjectId(userId),
    callId,
    assistantId,
    phoneNumber,
    status: 'started',
    timestamp: new Date(),
    metadata
  });

  return NextResponse.json({ message: 'Call start logged' });
}

// Handle assistant usage (for detailed tracking)
async function handleAssistantUsed(data: any) {
  const { assistantId, usage, userId: vapiUserId } = data;
  
  const userId = await getUserIdFromVapiUserId(vapiUserId);
  
  if (!userId) {
    return NextResponse.json({ message: 'No user ID found' });
  }

  const db = await connectToDatabase();

  // Track specific assistant usage
  await db.collection('vapi_assistant_usage').insertOne({
    userId: new ObjectId(userId),
    assistantId,
    usage,
    timestamp: new Date(),
    billingMonth: new Date().toISOString().slice(0, 7)
  });

  return NextResponse.json({ message: 'Assistant usage tracked' });
}

// Handle workflow execution
async function handleWorkflowExecuted(data: any) {
  const { workflowId, duration, cost, userId: vapiUserId } = data;
  
  const userId = await getUserIdFromVapiUserId(vapiUserId);
  
  if (!userId) {
    return NextResponse.json({ message: 'No user ID found' });
  }

  const db = await connectToDatabase();
  const durationMinutes = Math.ceil(duration / 60);

  // Update user's workflow usage
  await db.collection('av_users').updateOne(
    { _id: new ObjectId(userId) },
    {
      $inc: {
        'vapi.usage.monthlyMinutes': durationMinutes,
        'vapi.usage.workflowMinutes': durationMinutes
      },
      $set: {
        'vapi.usage.lastActivityDate': new Date()
      }
    }
  );

  // Log workflow usage
  await db.collection('vapi_usage_logs').insertOne({
    userId: new ObjectId(userId),
    workflowId,
    duration,
    durationMinutes,
    cost: cost || (durationMinutes * 0.05),
    callType: 'workflow',
    timestamp: new Date(),
    billingMonth: new Date().toISOString().slice(0, 7)
  });

  return NextResponse.json({ message: 'Workflow usage tracked' });
}

// Helper function to get user ID from assistant
async function getUserIdFromAssistant(assistantId: string): Promise<string | null> {
  if (!assistantId) return null;
  
  const db = await connectToDatabase();
  
  // Look up assistant in VapiAssistant collection
  const assistant = await db.collection('vapi_assistants').findOne({
    vapiAssistantId: assistantId
  });

  return assistant?.userId?.toString() || null;
}

// Helper function to get user ID from VAPI user ID
async function getUserIdFromVapiUserId(vapiUserId: string): Promise<string | null> {
  if (!vapiUserId) return null;
  
  const db = await connectToDatabase();
  
  const user = await db.collection('av_users').findOne({
    vapiUserId: vapiUserId
  });

  return user?._id?.toString() || null;
}

// Helper function to get monthly limit by role
function getMonthlyLimitByRole(role: string): number {
  const limits: Record<string, number> = {
    'FREE': 10,
    'STARTER': 100,
    'PRO': 500,
    'ENTERPRISE': 2000,
    'ADMIN': 1000,
    'GOD_MODE': 999999
  };
  return limits[role] || 10;
}

// Helper function to send usage alerts
async function sendUsageAlert(user: any, currentUsage: number, monthlyLimit: number) {
  // This would integrate with your notification system
  console.log(`Usage alert for user ${user._id}: ${currentUsage}/${monthlyLimit} minutes used`);
  
  // TODO: Send email notification, push notification, etc.
  // await sendEmail({
  //   to: user.email,
  //   subject: 'VAPI Usage Alert',
  //   template: 'usage-alert',
  //   data: { currentUsage, monthlyLimit, percentUsed: (currentUsage / monthlyLimit) * 100 }
  // });
}

// Helper function to verify VAPI webhook signature
function verifyVapiSignature(payload: any, signature: string, secret: string): boolean {
  // VAPI signature verification logic would go here
  // This is a placeholder - implement based on VAPI's webhook signature method
  try {
    const crypto = require('crypto');
    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return `sha256=${computedSignature}` === signature;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}
