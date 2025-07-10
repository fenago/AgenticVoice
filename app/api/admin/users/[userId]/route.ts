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

// GET /api/admin/users/[id] - Get specific user
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

    return NextResponse.json({
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
      customerId: user.customerId,
      vapiUserId: user.vapiUserId,
      hubspotContactId: user.hubspotContactId
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/users/[id] - Update user
export async function PUT(
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

    const body = await request.json();
    const { name, role, industryType, accountStatus, hasAccess } = body;

    const db = await connectToDatabase();
    const usersCollection = db.collection('av_users');

    // Build update object
    const updateData: any = {
      updatedAt: new Date()
    };

    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (industryType !== undefined) updateData.industryType = industryType;
    if (accountStatus !== undefined) updateData.accountStatus = accountStatus;
    if (hasAccess !== undefined) updateData.hasAccess = hasAccess;

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get updated user
    const updatedUser = await usersCollection.findOne({ _id: new ObjectId(userId) });

    return NextResponse.json({
      message: 'User updated successfully',
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name,
        image: updatedUser.image,
        role: updatedUser.role || 'FREE',
        accountStatus: updatedUser.accountStatus || 'ACTIVE',
        industryType: updatedUser.industryType || 'OTHER',
        hasAccess: updatedUser.hasAccess || false,
        createdAt: updatedUser.createdAt,
        lastLoginAt: updatedUser.lastLoginAt,
        loginCount: updatedUser.loginCount || 0,
        emailVerified: updatedUser.emailVerified,
        updatedAt: updatedUser.updatedAt,
        customerId: updatedUser.customerId,
        vapiUserId: updatedUser.vapiUserId,
        hubspotContactId: updatedUser.hubspotContactId
      }
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] - Delete user (GOD_MODE only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only GOD_MODE can delete users
    if (!session || session.user.role !== UserRole.GOD_MODE) {
      return NextResponse.json({ error: 'Access denied - GOD_MODE required' }, { status: 403 });
    }

    const { userId } = params;
    
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const db = await connectToDatabase();
    const usersCollection = db.collection('av_users');

    // Prevent self-deletion
    const targetUser = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (targetUser?.email === session.user.email) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    const result = await usersCollection.deleteOne({ _id: new ObjectId(userId) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
