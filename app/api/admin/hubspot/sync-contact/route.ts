import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth-config';
import { MongoClient, ObjectId } from 'mongodb';
import { UserRole } from '@/types/auth';
import HubSpotService from '@/libs/hubspot';

const MONGODB_URI = process.env.MONGODB_URI!;

async function connectToDatabase() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  return client.db('test');
}

async function checkAdminAccess(session: any) {
  if (!session?.user?.role) return false;
  const adminRoles = [UserRole.GOD_MODE, UserRole.ADMIN, UserRole.MARKETING];
  return adminRoles.includes(session.user.role);
}

// POST /api/admin/hubspot/sync-contact - Create/update HubSpot contact
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !await checkAdminAccess(session)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { userId } = await request.json();
    
    if (!userId || !ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Valid user ID required' }, { status: 400 });
    }

    // Get user from MongoDB
    const db = await connectToDatabase();
    const usersCollection = db.collection('av_users');
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Initialize HubSpot service and sync contact
    const hubspotService = new HubSpotService();
    const hubspotContactId = await hubspotService.syncUserToContact(user);

    if (hubspotContactId) {
      // Update user with HubSpot contact ID
      await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        { 
          $set: { 
            hubspotContactId,
            updatedAt: new Date()
          }
        }
      );

      return NextResponse.json({
        success: true,
        message: 'Contact synced successfully',
        hubspotContactId,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          hubspotContactId
        }
      });
    } else {
      return NextResponse.json({ 
        error: 'Failed to sync contact to HubSpot' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error syncing contact to HubSpot:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
