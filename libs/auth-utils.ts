import { UserRole, IndustryType, AccountStatus } from '@/types/auth';

export interface AuthUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: UserRole;
  industryType?: IndustryType;
  accountStatus?: AccountStatus;
  isEmailVerified?: boolean;
  loginCount?: number;
  lastLoginAt?: Date;
}

// Permission helper functions - client-safe
export const hasPermission = (user: AuthUser | null, requiredRole: UserRole): boolean => {
  if (!user?.role) return false;
  
  const roleHierarchy: Record<UserRole, number> = {
    [UserRole.FREE]: 0,
    [UserRole.ESSENTIAL]: 1,
    [UserRole.PRO]: 2,
    [UserRole.ENTERPRISE]: 3,
    [UserRole.CUSTOM]: 4,
    [UserRole.ADMIN]: 5,
    [UserRole.MARKETING]: 6,
    [UserRole.GOD_MODE]: 7
  };

  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
};

export const isAdmin = (user: AuthUser | null): boolean => {
  return hasPermission(user, UserRole.ADMIN);
};

export const hasMarketingAccess = (user: AuthUser | null): boolean => {
  return hasPermission(user, UserRole.PRO);
};

export const canAccessIndustryFeatures = (user: AuthUser | null, industryType: IndustryType): boolean => {
  if (!user?.industryType) return false;
  return user.industryType === industryType || user.industryType === IndustryType.OTHER;
};

export const isMedicalUser = (user: AuthUser | null): boolean => {
  return user?.industryType === IndustryType.MEDICAL;
};

export const isLegalUser = (user: AuthUser | null): boolean => {
  return user?.industryType === IndustryType.LEGAL;
};

export const isSalesUser = (user: AuthUser | null): boolean => {
  return user?.industryType === IndustryType.SALES;
};
