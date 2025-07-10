'use client';

import { useSession } from 'next-auth/react';
import { UserRole } from '@/types/auth';
import { hasPermission, isAdmin, hasMarketingAccess, AuthUser } from '@/libs/auth-utils';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requireAdmin?: boolean;
  requireMarketing?: boolean;
  fallback?: React.ReactNode;
  inverse?: boolean; // If true, shows children when requirements are NOT met
}

/**
 * RoleGuard - Conditionally renders children based on user role/permissions
 * Unlike ProtectedRoute, this doesn't redirect - it just shows/hides content
 */
const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  requiredRole,
  requireAdmin = false,
  requireMarketing = false,
  fallback = null,
  inverse = false
}) => {
  const { data: session, status } = useSession();

  // Loading or no session
  if (status === 'loading' || !session?.user) {
    return <>{fallback}</>;
  }

  const user = session.user as AuthUser;

  // Check all requirements
  let hasAccess = true;

  if (requireAdmin && !isAdmin(user)) {
    hasAccess = false;
  }

  if (requireMarketing && !hasMarketingAccess(user)) {
    hasAccess = false;
  }

  if (requiredRole && !hasPermission(user, requiredRole)) {
    hasAccess = false;
  }

  // Apply inverse logic if specified
  const shouldShow = inverse ? !hasAccess : hasAccess;

  return shouldShow ? <>{children}</> : <>{fallback}</>;
};

export default RoleGuard;
