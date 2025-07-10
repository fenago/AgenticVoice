import { Handler } from '@netlify/functions';
import { connectToDatabase, UserDocument, createAuditLog } from './database';
import { withAdminAuth, withRateLimit } from './middleware';
import { ObjectId } from 'mongodb';

// Protected admin users handler
const adminUsersHandler = async (event: any, context: any) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection<UserDocument>('av_users');
    
    // Get admin user from context (set by middleware)
    const adminUser = event.context?.user;
    if (!adminUser) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Admin context not found' }),
      };
    }

    switch (event.httpMethod) {
      case 'GET':
        return await handleGetUsers(usersCollection, event, adminUser.id, db);
      
      case 'POST':
        return await handleCreateUser(usersCollection, event, adminUser.id, db);
      
      case 'PUT':
        return await handleUpdateUser(usersCollection, event, adminUser.id, db);
      
      case 'DELETE':
        return await handleDeleteUser(usersCollection, event, adminUser.id, db);
      
      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }
  } catch (error) {
    console.error('Admin users API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

// Export with middleware protection
export const handler = withRateLimit(50)(withAdminAuth(adminUsersHandler));

async function handleGetUsers(collection: any, event: any, adminUserId: string, db: any) {
  const queryParams = event.queryStringParameters || {};
  const page = parseInt(queryParams.page) || 1;
  const limit = parseInt(queryParams.limit) || 10;
  const search = queryParams.search || '';
  const role = queryParams.role || '';
  const status = queryParams.status || '';

  // Build query
  const query: any = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
    ];
  }
  if (role) {
    query.role = role;
  }
  if (status) {
    query.accountStatus = status;
  }

  const skip = (page - 1) * limit;

  try {
    const [users, total] = await Promise.all([
      collection
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(query),
    ]);

    // Remove sensitive data
    const sanitizedUsers = users.map((user: UserDocument) => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      industryType: user.industryType,
      accountStatus: user.accountStatus,
      hasAccess: user.hasAccess,
      company: user.company,
      isEmailVerified: user.isEmailVerified,
      isTwoFactorEnabled: user.isTwoFactorEnabled,
      lastLoginAt: user.lastLoginAt,
      loginCount: user.loginCount,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    // Log the action
    await createAuditLog(db, {
      userId: adminUserId,
      action: 'view_users',
      resource: 'users',
      details: { query, total, page, limit },
      severity: 'LOW',
      category: 'USER_MGMT',
      status: 'SUCCESS',
      hipaaRelevant: false,
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        users: sanitizedUsers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }),
    };
  } catch (error) {
    console.error('Get users error:', error);
    
    await createAuditLog(db, {
      userId: adminUserId,
      action: 'view_users',
      resource: 'users',
      details: { error: (error as Error).message },
      severity: 'HIGH',
      category: 'USER_MGMT',
      status: 'FAILURE',
      hipaaRelevant: false,
    });

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Failed to fetch users' }),
    };
  }
}

async function handleUpdateUser(collection: any, event: any, adminUserId: string, db: any) {
  if (!event.body) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Request body is required' }),
    };
  }

  try {
    const { userId, updates } = JSON.parse(event.body);
    
    if (!userId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'User ID is required' }),
      };
    }

    // Get current user for audit trail
    const currentUser = await collection.findOne({ _id: new ObjectId(userId) });
    if (!currentUser) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'User not found' }),
      };
    }

    // Update user
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };

    const result = await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'User not found' }),
      };
    }

    // Log the action
    await createAuditLog(db, {
      userId: adminUserId,
      action: 'update_user',
      resource: 'users',
      resourceId: userId,
      details: { 
        before: currentUser,
        updates: updateData,
      },
      severity: 'MEDIUM',
      category: 'USER_MGMT',
      status: 'SUCCESS',
      hipaaRelevant: currentUser.industryType === 'MEDICAL',
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error('Update user error:', error);
    
    await createAuditLog(db, {
      userId: adminUserId,
      action: 'update_user',
      resource: 'users',
      details: { error: (error as Error).message },
      severity: 'HIGH',
      category: 'USER_MGMT',
      status: 'FAILURE',
      hipaaRelevant: false,
    });

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Failed to update user' }),
    };
  }
}

async function handleCreateUser(collection: any, event: any, adminUserId: string, db: any) {
  // Placeholder for create user functionality
  return {
    statusCode: 501,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ error: 'Create user not implemented yet' }),
  };
}

async function handleDeleteUser(collection: any, event: any, adminUserId: string, db: any) {
  // Placeholder for delete user functionality
  return {
    statusCode: 501,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ error: 'Delete user not implemented yet' }),
  };
}
