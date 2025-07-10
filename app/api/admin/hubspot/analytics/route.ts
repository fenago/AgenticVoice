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

// GET /api/admin/hubspot/analytics - Get HubSpot engagement analytics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !await checkAdminAccess(session)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const userId = searchParams.get('userId');

    let targetEmail = email;

    // If userId provided, get email from database
    if (userId && !email) {
      if (!ObjectId.isValid(userId)) {
        return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
      }
      
      const db = await connectToDatabase();
      const usersCollection = db.collection('av_users');
      const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
      
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      targetEmail = user.email;
    }

    if (!targetEmail) {
      return NextResponse.json({ 
        error: 'Email or userId parameter required' 
      }, { status: 400 });
    }

    // Initialize HubSpot service
    const hubspotService = new HubSpotService();
    
    // Find contact by email
    const contact = await hubspotService.findContactByEmail(targetEmail);
    
    if (!contact) {
      return NextResponse.json({ 
        error: 'Contact not found in HubSpot' 
      }, { status: 404 });
    }

    // Get detailed analytics
    const analytics = await hubspotService.getContactAnalytics(contact.id);

    return NextResponse.json({
      success: true,
      contact: {
        id: contact.id,
        email: targetEmail,
        properties: contact.properties,
        analytics: analytics.properties || {}
      }
    });

  } catch (error) {
    console.error('Error fetching HubSpot analytics:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
