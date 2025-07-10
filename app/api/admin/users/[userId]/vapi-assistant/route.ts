import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth-config';
import { UserRole } from '@/types/auth';
import { MongoClient, ObjectId } from 'mongodb';
import { VapiService } from '@/libs/vapi';

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
  
  const adminRoles = [UserRole.GOD_MODE, UserRole.ADMIN];
  return adminRoles.includes(session.user.role);
}

// GET /api/admin/users/[userId]/vapi-assistant - Get user's VAPI assistant
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !await checkAdminAccess(session)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { userId } = params;
    
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const db = await connectToDatabase();
    const usersCollection = db.collection('av_users');

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has VAPI assistant data
    const vapiAssistantsCollection = db.collection('vapi_assistants');
    const assistant = await vapiAssistantsCollection.findOne({ 
      userId: new ObjectId(userId) 
    });

    return NextResponse.json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        vapiUserId: user.vapiUserId
      },
      assistant: assistant || null
    });

  } catch (error: any) {
    console.error('Error fetching VAPI assistant:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/users/[userId]/vapi-assistant - Create VAPI assistant for user
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !await checkAdminAccess(session)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { userId } = params;
    
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const db = await connectToDatabase();
    const usersCollection = db.collection('av_users');

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const vapiService = new VapiService();
    
    // Generate VAPI User ID if not exists
    let vapiUserId = user.vapiUserId;
    if (!vapiUserId) {
      const emailPrefix = user.email?.split('@')[0] || 'user';
      const mongoIdSuffix = user._id.toString().slice(-8);
      vapiUserId = `${emailPrefix}_${mongoIdSuffix}`;
    }

    // Create assistant name
    const assistantName = user.name 
      ? `${user.name} Assistant`
      : `${user.email?.split('@')[0] || 'User'} Assistant`;

    // Create VAPI assistant with metadata
    const assistant = await vapiService.createAssistantForUser({
      mongoUserId: userId,
      stripeCustomerId: user.customerId || '',
      email: user.email,
      name: user.name
    }, {
      name: assistantName,
      systemMessage: `You are ${assistantName}, a helpful AI assistant for ${user.name || user.email}. You can help with various tasks and answer questions.`,
      firstMessage: `Hello! I'm ${assistantName}. How can I help you today?`
    });

    // Save assistant to database
    const vapiAssistantsCollection = db.collection('vapi_assistants');
    await vapiAssistantsCollection.insertOne({
      userId: new ObjectId(userId),
      assistantId: assistant.id,
      name: assistant.name,
      vapiUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        model: assistant.model,
        voice: assistant.voice,
        firstMessage: assistant.firstMessage
      }
    });

    // Update user with VAPI Assistant ID
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          vapiAssistantId: assistant.id,
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({
      message: 'VAPI assistant created successfully',
      assistant: {
        id: assistant.id,
        name: assistant.name,
        vapiUserId
      }
    });

  } catch (error: any) {
    console.error('Error creating VAPI assistant:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create VAPI assistant' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[userId]/vapi-assistant - Delete user's VAPI assistant
export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !await checkAdminAccess(session)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { userId } = params;
    
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const db = await connectToDatabase();
    const vapiAssistantsCollection = db.collection('vapi_assistants');

    // Find the assistant
    const assistant = await vapiAssistantsCollection.findOne({ 
      userId: new ObjectId(userId) 
    });

    if (!assistant) {
      return NextResponse.json({ error: 'Assistant not found' }, { status: 404 });
    }

    const vapiService = new VapiService();
    
    // Delete from VAPI
    await vapiService.deleteAssistant(assistant.assistantId);

    // Delete from database
    await vapiAssistantsCollection.deleteOne({ 
      userId: new ObjectId(userId) 
    });

    return NextResponse.json({
      message: 'VAPI assistant deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting VAPI assistant:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete VAPI assistant' },
      { status: 500 }
    );
  }
}
