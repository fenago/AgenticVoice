import { Handler } from '@netlify/functions';
import { connectToDatabase, createAuditLog } from './database';

// Function to handle new user registration with default settings
export const handleNewUserRegistration = async (userData: {
  email: string;
  name?: string;
  provider: 'google' | 'email';
  providerId?: string;
}) => {
  const db = await connectToDatabase();
  const usersCollection = db.collection('av_users');

  // Check if user already exists
  const existingUser = await usersCollection.findOne({ email: userData.email });
  
  if (existingUser) {
    // User exists, just update login info
    await usersCollection.updateOne(
      { email: userData.email },
      {
        $set: {
          lastLoginAt: new Date(),
          updatedAt: new Date()
        },
        $inc: { loginCount: 1 }
      }
    );

    await createAuditLog(db, {
      userId: existingUser._id.toString(),
      action: 'user_login',
      resource: 'user_account',
      details: { 
        provider: userData.provider,
        method: 'existing_user_login'
      },
      ipAddress: 'system',
      severity: 'LOW',
      category: 'USER_AUTH',
      status: 'SUCCESS',
      hipaaRelevant: false,
    });

    return existingUser;
  }

  // Create new user with FREE role as default
  const newUser = {
    email: userData.email,
    name: userData.name || userData.email.split('@')[0],
    role: 'FREE', // Default role for new users
    industryType: 'GENERAL',
    accountStatus: 'ACTIVE',
    hasAccess: true,
    company: null,
    phone: null,
    website: null,
    
    // Authentication fields
    isEmailVerified: userData.provider === 'google' ? true : false,
    isTwoFactorEnabled: false,
    
    // Activity tracking
    lastLoginAt: new Date(),
    loginCount: 1,
    lastAdminActivity: null,
    adminActionCount: 0,
    
    // Timestamps
    createdAt: new Date(),
    updatedAt: new Date(),
    
    // Provider info
    providers: [{
      provider: userData.provider,
      providerId: userData.providerId || userData.email,
      connectedAt: new Date()
    }],
    
    // Subscription info
    subscriptionStatus: 'FREE',
    subscriptionTier: 'FREE',
    trialEndsAt: null,
    paidUntil: null,
    
    // Usage limits for FREE tier
    monthlyCallsUsed: 0,
    monthlyCallsLimit: 10, // FREE tier limit
    
    // HIPAA and compliance
    hipaaCompliant: false,
    dataRetentionDays: 30, // FREE tier retention
    
    // Preferences
    preferences: {
      emailNotifications: true,
      marketingEmails: false,
      securityAlerts: true
    }
  };

  const result = await usersCollection.insertOne(newUser);

  // Log user registration
  await createAuditLog(db, {
    userId: result.insertedId.toString(),
    action: 'user_registration',
    resource: 'user_account',
    details: { 
      provider: userData.provider,
      role: 'FREE',
      method: 'new_user_creation'
    },
    ipAddress: 'system',
    severity: 'LOW',
    category: 'USER_MGMT',
    status: 'SUCCESS',
    hipaaRelevant: false,
  });

  return { ...newUser, _id: result.insertedId };
};

// NextAuth callback handler to set default role
export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { user, account, profile } = JSON.parse(event.body || '{}');

    if (!user?.email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'User email is required' }),
      };
    }

    // Handle user registration/login
    const userData = {
      email: user.email,
      name: user.name || profile?.name,
      provider: account?.provider === 'google' ? 'google' : 'email',
      providerId: account?.providerAccountId
    };

    const resultUser = await handleNewUserRegistration(userData);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        user: {
          id: resultUser._id.toString(),
          email: resultUser.email,
          name: resultUser.name,
          role: resultUser.role
        }
      }),
    };

  } catch (error) {
    console.error('User registration error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Registration failed',
        message: (error as Error).message
      }),
    };
  }
};

// Helper function to upgrade user role when they purchase a plan
export const upgradeUserRole = async (userId: string, newRole: string, planDetails: any) => {
  const db = await connectToDatabase();
  const usersCollection = db.collection('av_users');

  const updateData = {
    role: newRole,
    subscriptionStatus: 'ACTIVE',
    subscriptionTier: newRole,
    paidUntil: planDetails.paidUntil,
    monthlyCallsLimit: getCallLimitForRole(newRole),
    hipaaCompliant: ['PRO', 'ENTERPRISE'].includes(newRole),
    dataRetentionDays: getRetentionDaysForRole(newRole),
    updatedAt: new Date()
  };

  await usersCollection.updateOne(
    { _id: userId },
    { $set: updateData }
  );

  // Log role upgrade
  await createAuditLog(db, {
    userId,
    action: 'role_upgrade',
    resource: 'user_account',
    details: { 
      newRole,
      oldRole: 'FREE', // Assuming upgrade from FREE
      planDetails
    },
    ipAddress: 'system',
    severity: 'MEDIUM',
    category: 'USER_MGMT',
    status: 'SUCCESS',
    hipaaRelevant: ['PRO', 'ENTERPRISE'].includes(newRole),
  });
};

// Helper functions for role-based limits
function getCallLimitForRole(role: string): number {
  const limits = {
    'FREE': 10,
    'ESSENTIAL': 100,
    'PRO': 500,
    'ENTERPRISE': 2000
  };
  return limits[role as keyof typeof limits] || 10;
}

function getRetentionDaysForRole(role: string): number {
  const retention = {
    'FREE': 30,
    'ESSENTIAL': 90,
    'PRO': 365,
    'ENTERPRISE': 2555 // 7 years for HIPAA compliance
  };
  return retention[role as keyof typeof retention] || 30;
}
