import { Handler } from '@netlify/functions';
import { connectToDatabase, createAuditLog } from './database';
import { getToken } from 'next-auth/jwt';

// Admin roles that have access to admin dashboard
const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'GOD_MODE'] as const;
type AdminRole = typeof ADMIN_ROLES[number];

// Security middleware for admin endpoints
export async function withAdminAuth(handler: Handler): Promise<Handler> {
  return async (event, context) => {
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Content-Type': 'application/json',
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: '',
      };
    }

    try {
      // Extract auth token from header
      const authHeader = event.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ 
            error: 'Unauthorized',
            message: 'Valid authorization token required'
          }),
        };
      }

      // In production, decode NextAuth JWT token
      // For now, we'll validate using session lookup
      const token = authHeader.replace('Bearer ', '');
      
      // Connect to database
      const db = await connectToDatabase();
      
      // Get user from session/token (simplified for demo)
      // In real implementation, decode JWT and get user ID
      const userId = await validateAuthToken(token, db);
      
      if (!userId) {
        await createAuditLog(db, {
          userId: 'unknown',
          action: 'failed_admin_auth',
          resource: 'admin_access',
          details: { reason: 'invalid_token', endpoint: event.path },
          ipAddress: event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown',
          severity: 'HIGH',
          category: 'SECURITY',
          status: 'FAILURE',
          hipaaRelevant: false,
        });

        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ 
            error: 'Unauthorized',
            message: 'Invalid authentication token'
          }),
        };
      }

      // Get user details and validate admin role
      const usersCollection = db.collection('av_users');
      const user = await usersCollection.findOne({ _id: userId });

      if (!user) {
        await createAuditLog(db, {
          userId: userId.toString(),
          action: 'failed_admin_auth',
          resource: 'admin_access',
          details: { reason: 'user_not_found', endpoint: event.path },
          ipAddress: event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown',
          severity: 'HIGH',
          category: 'SECURITY',
          status: 'FAILURE',
          hipaaRelevant: false,
        });

        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ 
            error: 'Unauthorized',
            message: 'User not found'
          }),
        };
      }

      // Check if user has admin role
      if (!ADMIN_ROLES.includes(user.role as AdminRole)) {
        await createAuditLog(db, {
          userId: userId.toString(),
          action: 'failed_admin_access',
          resource: 'admin_access',
          details: { 
            reason: 'insufficient_role', 
            userRole: user.role,
            endpoint: event.path,
            requiredRoles: ADMIN_ROLES
          },
          ipAddress: event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown',
          severity: 'HIGH',
          category: 'SECURITY',
          status: 'FAILURE',
          hipaaRelevant: false,
        });

        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ 
            error: 'Forbidden',
            message: 'Admin access required'
          }),
        };
      }

      // Update last login and track admin activity
      await Promise.all([
        // Update user's last admin activity
        usersCollection.updateOne(
          { _id: userId },
          { 
            $set: { 
              lastAdminActivity: new Date(),
              updatedAt: new Date()
            },
            $inc: { adminActionCount: 1 }
          }
        ),
        
        // Log successful admin access
        createAuditLog(db, {
          userId: userId.toString(),
          action: 'admin_access_granted',
          resource: 'admin_access',
          details: { 
            endpoint: event.path,
            method: event.httpMethod,
            userRole: user.role
          },
          ipAddress: event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown',
          severity: 'LOW',
          category: 'ADMIN_ACCESS',
          status: 'SUCCESS',
          hipaaRelevant: false,
        })
      ]);

      // Add user context to event for the handler
      event.context = {
        ...event.context,
        user: {
          id: userId.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          isAdmin: true
        }
      };

      // Call the protected handler
      return await handler(event, context);

    } catch (error) {
      console.error('Admin auth middleware error:', error);
      
      // Log security error
      try {
        const db = await connectToDatabase();
        await createAuditLog(db, {
          userId: 'system',
          action: 'admin_middleware_error',
          resource: 'admin_access',
          details: { 
            error: (error as Error).message,
            endpoint: event.path
          },
          ipAddress: event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown',
          severity: 'CRITICAL',
          category: 'SYSTEM_ERROR',
          status: 'FAILURE',
          hipaaRelevant: false,
        });
      } catch (auditError) {
        console.error('Failed to log security error:', auditError);
      }

      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Internal server error',
          message: 'Authentication system error'
        }),
      };
    }
  };
}

// Validate auth token (simplified - in production, decode NextAuth JWT)
async function validateAuthToken(token: string, db: any): Promise<string | null> {
  // For demo purposes, using a simple token lookup
  // In production, this would decode and validate JWT from NextAuth
  
  if (token === 'demo-admin-token') {
    // Return demo admin user ID
    const usersCollection = db.collection('av_users');
    const adminUser = await usersCollection.findOne({ 
      role: { $in: ADMIN_ROLES }
    });
    
    return adminUser?._id || null;
  }
  
  // In production implementation:
  // 1. Decode NextAuth JWT token
  // 2. Validate token signature and expiration
  // 3. Extract user ID from token payload
  // 4. Return user ID if valid, null if invalid
  
  return null;
}

// Rate limiting for admin endpoints
export function withRateLimit(maxRequests: number = 100, windowMs: number = 60000) {
  const requests = new Map<string, number[]>();
  
  return function (handler: Handler): Handler {
    return async (event, context) => {
      const ip = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown';
      const now = Date.now();
      
      // Clean old requests
      const userRequests = requests.get(ip) || [];
      const validRequests = userRequests.filter(time => now - time < windowMs);
      
      // Check rate limit
      if (validRequests.length >= maxRequests) {
        return {
          statusCode: 429,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil(windowMs / 1000).toString(),
          },
          body: JSON.stringify({ 
            error: 'Too many requests',
            message: `Rate limit exceeded. Max ${maxRequests} requests per minute.`
          }),
        };
      }
      
      // Add current request
      validRequests.push(now);
      requests.set(ip, validRequests);
      
      return await handler(event, context);
    };
  };
}
