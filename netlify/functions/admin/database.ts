// Database connection and schema for admin functions
// Uses existing AgenticVoice MongoDB database with av_ prefixed collections
import { MongoClient, Db } from 'mongodb';

let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  const client = new MongoClient(uri);
  await client.connect();
  
  // Use existing AgenticVoice database
  cachedDb = client.db(process.env.DB_NAME || 'agenticvoice');
  return cachedDb;
}

// Database schemas and validation - matching existing av_ collections
export interface UserDocument {
  _id?: string;
  name: string;
  email: string;
  image?: string;
  role: 'FREE' | 'ESSENTIAL' | 'PRO' | 'ENTERPRISE' | 'ADMIN' | 'SUPER_ADMIN' | 'GOD_MODE';
  industryType: 'MEDICAL' | 'LEGAL' | 'SALES' | 'OTHER';
  accountStatus: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  hasAccess: boolean;
  customerId?: string;
  priceId?: string;
  company?: string;
  preferences?: Record<string, any>;
  isEmailVerified: boolean;
  isTwoFactorEnabled: boolean;
  lastLoginAt?: Date;
  loginCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoleDocument {
  _id?: string;
  name: string;
  description: string;
  is_system: boolean;
  permissions: string[];
  created_at: Date;
  updated_at: Date;
}

export interface PermissionDocument {
  _id?: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  created_at: Date;
  updated_at: Date;
}

export interface SubscriptionPlanDocument {
  _id?: string;
  name: string;
  description: string;
  monthly_price: number;
  annual_price: number;
  voice_agent_limit: number;
  call_minutes_limit: number;
  features: Record<string, any>;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CustomerSubscriptionDocument {
  _id?: string;
  user_id: string;
  plan_id: string;
  stripe_subscription_id?: string;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  current_period_start: Date;
  current_period_end: Date;
  cancel_at_period_end: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AuditLogDocument {
  _id?: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: 'AUTH' | 'USER_MGMT' | 'ASSISTANT' | 'CALL' | 'BILLING' | 'SYSTEM' | 'SECURITY';
  status: 'SUCCESS' | 'FAILURE' | 'WARNING';
  sessionId?: string;
  correlationId?: string;
  metadata?: Record<string, any>;
  hipaaRelevant: boolean;
  timestamp: Date;
  createdAt: Date;
}

// Helper functions for database operations
export async function createAuditLog(db: Db, logData: Omit<AuditLogDocument, '_id' | 'createdAt' | 'timestamp'>) {
  const collection = db.collection<AuditLogDocument>('av_audit_logs');
  
  const now = new Date();
  const auditLog: AuditLogDocument = {
    ...logData,
    timestamp: now,
    createdAt: now,
  };

  const result = await collection.insertOne(auditLog);
  return result.insertedId;
}

export async function validatePermission(db: Db, userId: string, resource: string, action: string): Promise<boolean> {
  try {
    // Get user from av_users collection
    const usersCollection = db.collection<UserDocument>('av_users');
    const user = await usersCollection.findOne({ _id: userId });
    
    if (!user) {
      return false;
    }

    // Check role-based permissions - admin roles have full access
    const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'GOD_MODE'];
    if (adminRoles.includes(user.role)) {
      return true;
    }

    // Non-admin users don't have admin permissions
    return false;
  } catch (error) {
    console.error('Permission validation error:', error);
    return false;
  }
}

// Initialize default roles and permissions
export async function initializeDefaultData(db: Db) {
  const rolesCollection = db.collection<RoleDocument>('roles');
  const permissionsCollection = db.collection<PermissionDocument>('permissions');

  // Create default permissions
  const defaultPermissions = [
    { name: 'view:users', description: 'View users', resource: 'users', action: 'view' },
    { name: 'create:users', description: 'Create users', resource: 'users', action: 'create' },
    { name: 'update:users', description: 'Update users', resource: 'users', action: 'update' },
    { name: 'delete:users', description: 'Delete users', resource: 'users', action: 'delete' },
    { name: 'view:roles', description: 'View roles', resource: 'roles', action: 'view' },
    { name: 'create:roles', description: 'Create roles', resource: 'roles', action: 'create' },
    { name: 'update:roles', description: 'Update roles', resource: 'roles', action: 'update' },
    { name: 'delete:roles', description: 'Delete roles', resource: 'roles', action: 'delete' },
    { name: 'view:subscriptions', description: 'View subscriptions', resource: 'subscriptions', action: 'view' },
    { name: 'update:subscriptions', description: 'Update subscriptions', resource: 'subscriptions', action: 'update' },
    { name: 'view:analytics', description: 'View analytics', resource: 'analytics', action: 'view' },
    { name: 'view:audit_logs', description: 'View audit logs', resource: 'audit_logs', action: 'view' },
    { name: 'view:system', description: 'View system settings', resource: 'system', action: 'view' },
    { name: 'update:system', description: 'Update system settings', resource: 'system', action: 'update' },
  ];

  for (const permission of defaultPermissions) {
    const existingPermission = await permissionsCollection.findOne({ name: permission.name });
    if (!existingPermission) {
      await permissionsCollection.insertOne({
        ...permission,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }
  }

  // Create default admin role
  const adminRole = await rolesCollection.findOne({ name: 'admin' });
  if (!adminRole) {
    const allPermissions = await permissionsCollection.find({}).toArray();
    const permissionIds = allPermissions.map(p => p._id?.toString() || '');

    await rolesCollection.insertOne({
      name: 'admin',
      description: 'Full administrative access',
      is_system: true,
      permissions: permissionIds,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  // Create default user role
  const userRole = await rolesCollection.findOne({ name: 'user' });
  if (!userRole) {
    await rolesCollection.insertOne({
      name: 'user',
      description: 'Standard user access',
      is_system: true,
      permissions: [], // No admin permissions
      created_at: new Date(),
      updated_at: new Date(),
    });
  }
}

export default connectToDatabase;
