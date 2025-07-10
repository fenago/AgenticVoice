import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth-config';
import { MongoClient } from 'mongodb';
import { UserRole } from '@/types/auth';

const MONGODB_URI = process.env.MONGODB_URI!;

// Helper function to connect to MongoDB
async function connectToDatabase() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  return client.db('test'); // Using the test database where users actually exist
}

// Helper function to check admin access
async function checkAdminAccess(session: any) {
  if (!session?.user?.role) return false;
  
  const adminRoles = [UserRole.GOD_MODE, UserRole.ADMIN, UserRole.MARKETING];
  return adminRoles.includes(session.user.role);
}

// GET /api/admin/users - Get all users with pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !await checkAdminAccess(session)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';

    const db = await connectToDatabase();
    const usersCollection = db.collection('av_users');

    // Build query
    const query: any = {};
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }
    if (role && role !== 'all') {
      query.role = role;
    }

    // Get total count
    const totalUsers = await usersCollection.countDocuments(query);

    // Get paginated users
    const users = await usersCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    // Get user statistics
    const stats = await usersCollection.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    // Get activity metrics
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const newUsersThisWeek = await usersCollection.countDocuments({
      createdAt: { $gte: lastWeek }
    });

    const activeUsersThisWeek = await usersCollection.countDocuments({
      lastLoginAt: { $gte: lastWeek }
    });

    return NextResponse.json({
      users: users.map(user => ({
        id: user._id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role || 'FREE',
        accountStatus: user.accountStatus || 'ACTIVE',
        industryType: user.industryType || 'OTHER',
        hasAccess: user.hasAccess || false,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        loginCount: user.loginCount || 0,
        emailVerified: user.emailVerified,
        // Add sync IDs
        customerId: user.customerId,
        hubspotContactId: user.hubspotContactId,
        vapiAssistantId: user.vapiAssistantId
      })),
      pagination: {
        page,
        limit,
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit)
      },
      stats: {
        total: totalUsers,
        byRole: stats.reduce((acc, stat) => {
          acc[stat._id || 'FREE'] = stat.count;
          return acc;
        }, {} as Record<string, number>),
        newThisWeek: newUsersThisWeek,
        activeThisWeek: activeUsersThisWeek
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/users - Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !await checkAdminAccess(session)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { email, name, role, industryType, accountStatus } = body;

    if (!email || !name) {
      return NextResponse.json({ error: 'Email and name are required' }, { status: 400 });
    }

    const db = await connectToDatabase();
    const usersCollection = db.collection('av_users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Create new user
    const newUser = {
      email,
      name,
      role: role || UserRole.FREE,
      industryType: industryType || 'OTHER',
      accountStatus: accountStatus || 'ACTIVE',
      hasAccess: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      loginCount: 0,
      isEmailVerified: false
    };

    const result = await usersCollection.insertOne(newUser);

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: result.insertedId,
        ...newUser
      }
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
