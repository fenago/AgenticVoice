import { UserRole } from '@/types/auth';

// Security permissions
export interface SecurityPermission {
  key: string;
  name: string;
  description: string;
  category: string;
}

export interface PermissionCategory {
  name: string;
  permissions: SecurityPermission[];
}

export interface RolePermissions {
  role: UserRole;
  permissions: string[];
  lastModified: Date;
  modifiedBy: string;
}

export interface PermissionMatrix {
  [role: string]: string[];
}

export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    name: 'User Management',
    permissions: [
      { key: 'users.view', name: 'View Users', description: 'Can view user list and details', category: 'User Management' },
      { key: 'users.create', name: 'Create Users', description: 'Can create new users', category: 'User Management' },
      { key: 'users.edit', name: 'Edit Users', description: 'Can edit user information', category: 'User Management' },
      { key: 'users.delete', name: 'Delete Users', description: 'Can delete users', category: 'User Management' },
      { key: 'users.suspend', name: 'Suspend Users', description: 'Can suspend and unsuspend users', category: 'User Management' },
      { key: 'users.roles', name: 'Manage Roles', description: 'Can change user roles', category: 'User Management' },
    ],
  },
  {
    name: 'Billing & Subscriptions',
    permissions: [
      { key: 'billing.view', name: 'View Billing', description: 'Can view billing history and invoices', category: 'Billing & Subscriptions' },
      { key: 'billing.edit', name: 'Edit Billing', description: 'Can modify billing information', category: 'Billing & Subscriptions' },
      { key: 'subscriptions.manage', name: 'Manage Subscriptions', description: 'Can change subscription plans', category: 'Billing & Subscriptions' },
      { key: 'pricing.configure', name: 'Configure Pricing', description: 'Can set and change pricing models', category: 'Billing & Subscriptions' },
    ],
  },
  {
    name: 'CRM',
    permissions: [
      { key: 'crm.view', name: 'View CRM Data', description: 'Can view contacts, deals, and companies', category: 'CRM' },
      { key: 'crm.create', name: 'Create CRM Entries', description: 'Can create new contacts, deals', category: 'CRM' },
      { key: 'crm.edit', name: 'Edit CRM Data', description: 'Can edit CRM records', category: 'CRM' },
      { key: 'crm.delete', name: 'Delete CRM Data', description: 'Can delete CRM records', category: 'CRM' },
      { key: 'crm.export', name: 'Export CRM Data', description: 'Can export CRM data to CSV', category: 'CRM' },
    ],
  },
  {
    name: 'VAPI & Voice',
    permissions: [
        { key: 'vapi.view', name: 'View VAPI Usage', description: 'Can view VAPI analytics and usage', category: 'VAPI & Voice' },
        { key: 'vapi.manage', name: 'Manage VAPI Settings', description: 'Can manage VAPI assistants and settings', category: 'VAPI & Voice' },
        { key: 'calls.monitor', name: 'Monitor Calls', description: 'Can monitor live and past calls', category: 'VAPI & Voice' },
    ],
  },
  {
    name: 'System & Security',
    permissions: [
      { key: 'settings.view', name: 'View Settings', description: 'Can view system settings', category: 'System & Security' },
      { key: 'settings.edit', name: 'Edit Settings', description: 'Can edit system settings', category: 'System & Security' },
      { key: 'security.manage', name: 'Manage Security', description: 'Can manage security settings like 2FA', category: 'System & Security' },
      { key: 'audit.logs', name: 'View Audit Logs', description: 'Can view audit logs for all actions', category: 'System & Security' },
      { key: 'integrations.manage', name: 'Manage Integrations', description: 'Can manage third-party integrations', category: 'System & Security' },
    ],
  },
];

// Audit log types
export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userEmail: string;
  action: AuditAction;
  category: AuditCategory;
  details: AuditDetails;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  outcome: 'SUCCESS' | 'FAILURE' | 'WARNING';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  complianceFlags?: ComplianceFlag[];
}

export enum AuditAction {
  // User actions
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_REGISTER = 'USER_REGISTER',
  USER_UPDATE = 'USER_UPDATE',
  USER_DELETE = 'USER_DELETE',
  USER_SUSPEND = 'USER_SUSPEND',
  USER_UNSUSPEND = 'USER_UNSUSPEND',
  USER_ROLE_CHANGE = 'USER_ROLE_CHANGE',
  USER_IMPERSONATE = 'USER_IMPERSONATE',
  
  // Admin actions
  ADMIN_LOGIN = 'ADMIN_LOGIN',
  ADMIN_ACTION = 'ADMIN_ACTION',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
  ROLE_MODIFY = 'ROLE_MODIFY',
  SYSTEM_CONFIG_CHANGE = 'SYSTEM_CONFIG_CHANGE',
  
  // Security actions
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_RESET = 'PASSWORD_RESET',
  TWO_FACTOR_ENABLE = 'TWO_FACTOR_ENABLE',
  TWO_FACTOR_DISABLE = 'TWO_FACTOR_DISABLE',
  API_KEY_GENERATE = 'API_KEY_GENERATE',
  API_KEY_REVOKE = 'API_KEY_REVOKE',
  SECURITY_BREACH = 'SECURITY_BREACH',
  
  // Data actions
  DATA_EXPORT = 'DATA_EXPORT',
  DATA_IMPORT = 'DATA_IMPORT',
  DATA_DELETE = 'DATA_DELETE',
  DATA_ACCESS = 'DATA_ACCESS',
  
  // Billing actions
  BILLING_CHANGE = 'BILLING_CHANGE',
  SUBSCRIPTION_CHANGE = 'SUBSCRIPTION_CHANGE',
  PAYMENT_PROCESS = 'PAYMENT_PROCESS',
  
  // VAPI actions
  VAPI_ASSISTANT_CREATE = 'VAPI_ASSISTANT_CREATE',
  VAPI_ASSISTANT_DELETE = 'VAPI_ASSISTANT_DELETE',
  VAPI_CALL_START = 'VAPI_CALL_START',
  VAPI_CALL_END = 'VAPI_CALL_END'
}

export enum AuditCategory {
  AUTH = 'AUTH',
  USER_MANAGEMENT = 'USER_MANAGEMENT',
  SECURITY = 'SECURITY',
  ADMIN = 'ADMIN',
  DATA = 'DATA',
  BILLING = 'BILLING',
  VAPI = 'VAPI',
  SYSTEM = 'SYSTEM',
  COMPLIANCE = 'COMPLIANCE'
}

export interface AuditDetails {
  [key: string]: any;
  resource?: string;
  resourceId?: string;
  changes?: Record<string, { from: any; to: any }>;
  metadata?: Record<string, any>;
}

export interface ComplianceFlag {
  type: 'HIPAA' | 'GDPR' | 'SOX' | 'PCI_DSS';
  level: 'INFO' | 'WARNING' | 'VIOLATION';
  description: string;
}

// Security monitoring types
export interface SecurityEvent {
  id: string;
  timestamp: Date;
  type: SecurityEventType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  source: string;
  target?: string;
  description: string;
  details: Record<string, any>;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
}

export enum SecurityEventType {
  FAILED_LOGIN = 'FAILED_LOGIN',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  DATA_BREACH = 'DATA_BREACH',
  MALWARE_DETECTED = 'MALWARE_DETECTED',
  PHISHING_ATTEMPT = 'PHISHING_ATTEMPT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  IP_BLOCKED = 'IP_BLOCKED',
  CREDENTIAL_STUFFING = 'CREDENTIAL_STUFFING',
  SESSION_HIJACK = 'SESSION_HIJACK'
}

// API key management types
export interface ApiKey {
  id: string;
  name: string;
  key: string; // Only shown once during creation
  keyHash: string; // Stored hash
  userId: string;
  permissions: string[];
  createdAt: Date;
  lastUsed?: Date;
  expiresAt?: Date;
  isActive: boolean;
  usageCount: number;
  rateLimit?: {
    requests: number;
    window: number; // in seconds
  };
}

// IP restriction types
export interface IpRestriction {
  id: string;
  userId?: string; // If user-specific
  ipAddress: string;
  ipRange?: string; // CIDR notation
  type: 'ALLOW' | 'BLOCK';
  description: string;
  createdAt: Date;
  createdBy: string;
  isActive: boolean;
}

// Two-factor authentication types
export interface TwoFactorAuth {
  userId: string;
  isEnabled: boolean;
  method: '2FA_APP' | 'SMS' | 'EMAIL';
  backupCodes: string[];
  lastUsed?: Date;
  enabledAt: Date;
}

// Compliance settings types
export interface ComplianceSettings {
  hipaa: {
    enabled: boolean;
    dataRetentionDays: number;
    encryptionRequired: boolean;
    auditTrailRequired: boolean;
    accessLoggingEnabled: boolean;
  };
  gdpr: {
    enabled: boolean;
    consentRequired: boolean;
    dataPortabilityEnabled: boolean;
    rightToDeleteEnabled: boolean;
  };
  dataRetention: {
    auditLogsDays: number;
    userDataDays: number;
    vapiCallDataDays: number;
    billingDataDays: number;
    automaticDeletion: boolean;
  };
  security: {
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
      maxAge: number; // days
    };
    sessionPolicy: {
      maxInactiveDuration: number; // minutes
      maxConcurrentSessions: number;
      requireReauth: boolean;
    };
    ipRestrictions: {
      enabled: boolean;
      allowedIps: string[];
      blockedIps: string[];
    };
  };
}

// Security dashboard types
export interface SecurityDashboardData {
  securityScore: number;
  activeThreats: number;
  resolvedThreats: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recentEvents: SecurityEvent[];
  complianceStatus: {
    hipaa: 'COMPLIANT' | 'NON_COMPLIANT' | 'PARTIAL';
    gdpr: 'COMPLIANT' | 'NON_COMPLIANT' | 'PARTIAL';
    overall: 'COMPLIANT' | 'NON_COMPLIANT' | 'PARTIAL';
  };
  systemHealth: {
    authSystem: 'HEALTHY' | 'WARNING' | 'ERROR';
    database: 'HEALTHY' | 'WARNING' | 'ERROR';
    apiServices: 'HEALTHY' | 'WARNING' | 'ERROR';
    monitoring: 'HEALTHY' | 'WARNING' | 'ERROR';
  };
}


