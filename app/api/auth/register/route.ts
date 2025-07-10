import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import HubSpotService from '@/libs/hubspot';
import { vapiService, VapiService } from '@/libs/vapi';
import { AssistantType, AssistantStatus } from '@/models/VapiAssistant';
import { UserSyncService } from '@/app/admin/services/userSyncService';
import { UserRole, IndustryType } from '@/types/auth';
import crypto from 'crypto';

const MONGODB_URI = process.env.MONGODB_URI!;

async function connectToDatabase() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  return client.db('test');
}

// POST /api/auth/register - User registration with HubSpot sync
export async function POST(request: NextRequest) {
  try {
    const { email, password, name, industryType } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ 
        error: 'Email and password are required' 
      }, { status: 400 });
    }

    const db = await connectToDatabase();
    const usersCollection = db.collection('av_users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ 
        error: 'User with this email already exists' 
      }, { status: 409 });
    }

    // Hash password using crypto
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    // Use UserSyncService for proper cross-platform registration
    const registrationResult = await UserSyncService.registerUserAcrossPlatforms({
      email,
      name: name || '',
      provider: 'credentials',
      role: UserRole.FREE,
      industryType: (industryType as IndustryType) || IndustryType.OTHER,
    });

    if (!registrationResult.success || !registrationResult.mongoUserId) {
      console.error('User registration failed:', registrationResult.errors);
      return NextResponse.json({
        error: 'Failed to register user across platforms',
        details: registrationResult.errors?.join(', ') || 'Unknown error'
      }, { status: 500 });
    }

    const userId = registrationResult.mongoUserId;

    // Add password to the user (UserSyncService doesn't handle passwords)
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          password: hashedPassword,
          hasAccess: false,
          loginCount: 0,
          emailVerified: false,
          updatedAt: new Date()
        }
      }
    );

    // Auto-create VAPI assistant for new user (this will be moved to UserSyncService in future)
    try {
      const vapiAssistant = await vapiService.createAssistantForUser({
        mongoUserId: userId,
        email: email,
        name: name,
      }, {
        name: `${name}'s Assistant`,
        firstMessage: `Hi ${name}, I'm your personal AI assistant. How can I help you today?`,
        systemMessage: `You are an AI assistant for ${name || email}. Be helpful, professional, and personalized to their needs.`
      });

      // Save assistant to VapiAssistant collection
      const vapiAssistantsCollection = db.collection('vapiassistants');
      await vapiAssistantsCollection.insertOne({
        name: vapiAssistant.name,
        description: `Personal assistant for ${name || email}`,
        type: AssistantType.CUSTOMER_SUPPORT,
        status: AssistantStatus.ACTIVE,
        userId: userId,
        vapiId: vapiAssistant.id,
        vapiUserId: vapiAssistant.id, // Corrected Key
        configuration: {
          model: vapiAssistant.model,
          voice: vapiAssistant.voice,
          firstMessage: vapiAssistant.firstMessage,
          systemMessage: vapiAssistant.systemMessage
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Update user with VAPI User ID
      await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        { 
          $set: { 
            vapiUserId: vapiAssistant.id, // Corrected Key
            updatedAt: new Date()
          }
        }
      );

      console.log(`VAPI assistant created for user ${email}: ${vapiAssistant.id}`);
    } catch (vapiError) {
      console.error('VAPI assistant creation failed during registration:', vapiError);
      // Don't fail registration if VAPI creation fails
    }

    // Create HubSpot contact for new user
    try {
      const HubSpotService = (await import('@/libs/hubspot')).default;
      const hubspotService = new HubSpotService();
      
      const hubspotContactId = await hubspotService.syncUserToContact({
        email,
        name: name || '',
        role: 'FREE',
        industryType: industryType || 'OTHER',
        hasAccess: false,
        loginCount: 1,
        lastLoginAt: new Date()
      });
      
      if (hubspotContactId) {
        // Update user with HubSpot contact ID
        await usersCollection.updateOne(
          { _id: new ObjectId(userId) },
          { 
            $set: { 
              hubspotContactId: hubspotContactId,
              updatedAt: new Date()
            }
          }
        );
        console.log(`✅ HubSpot contact created for new user ${email}: ${hubspotContactId}`);
      }
    } catch (hubspotError) {
      console.error('HubSpot contact creation failed during registration:', hubspotError);
      // Don't fail registration if HubSpot creation fails
    }

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: userId,
        email,
        name: name || '',
        role: 'FREE',
        industryType: industryType || 'OTHER',
        customerId: registrationResult.customerId
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
