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
  return { client, db: client.db('test') };
}

// Helper function to check admin access
async function checkAdminAccess(session: any) {
  if (!session?.user?.role) return false;
  
  const adminRoles = [UserRole.GOD_MODE, UserRole.ADMIN];
  return adminRoles.includes(session.user.role);
}

// POST /api/admin/users/[userId]/test-vapi - Test user's VAPI assistant
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

    const { client, db } = await connectToDatabase();
    let vapiService: VapiService;
    
    try {
      const vapiAssistantsCollection = db.collection('vapi_assistants');

      // Find the user's assistant
      const assistant = await vapiAssistantsCollection.findOne({ 
        userId: new ObjectId(userId) 
      });

      if (!assistant) {
        return NextResponse.json({
          success: false,
          message: 'No VAPI assistant found for this user. Please create an assistant first.',
          accessible: false
        });
      }

      try {
        vapiService = new VapiService();
      } catch (serviceError: any) {
        console.error('VapiService initialization error:', serviceError);
        return NextResponse.json({
          success: false,
          message: `VAPI Service Error: ${serviceError.message}. Please check VAPI_API_KEY environment variable.`,
          accessible: false
        });
      }
      
      // Test the assistant
      const testResult = await vapiService.testAssistant(assistant.assistantId);

      return NextResponse.json(testResult);
    } finally {
      // Always close the MongoDB connection
      await client.close();
    }

  } catch (error: any) {
    console.error('Error testing VAPI assistant:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to test VAPI assistant',
      accessible: false
    });
  }
}
