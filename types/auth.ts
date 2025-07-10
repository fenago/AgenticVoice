// Define user roles and permissions
export enum UserRole {
  FREE = 'FREE',
  ESSENTIAL = 'ESSENTIAL', 
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
  CUSTOM = 'CUSTOM',
  ADMIN = 'ADMIN',
  MARKETING = 'MARKETING',
  GOD_MODE = 'GOD_MODE'
}

export enum IndustryType {
  MEDICAL = 'MEDICAL',
  LEGAL = 'LEGAL', 
  SALES = 'SALES',
  OTHER = 'OTHER'
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  INACTIVE = 'INACTIVE'
}

// Permission helper types
export interface UserSession {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  industry: IndustryType;
  accountStatus: AccountStatus;
  hasAccess: boolean;
}
