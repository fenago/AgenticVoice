'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { UserRole, AccountStatus } from '@/types/auth';
import { hasPermission, isAdmin, hasMarketingAccess, AuthUser } from '@/libs/auth-utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requireAdmin?: boolean;
  requireMarketing?: boolean;
  requireActive?: boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requireAdmin = false,
  requireMarketing = false,
  requireActive = true,
  redirectTo = '/login',
  fallback
}) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    // Not authenticated
    if (status === 'unauthenticated') {
      router.push(redirectTo);
      return;
    }

    // User exists but doesn't meet requirements
    if (session?.user) {
      const user = session.user as AuthUser;

      // Check if account is active
      if (requireActive && user.accountStatus !== AccountStatus.ACTIVE) {
        router.push('/account-suspended');
        return;
      }

      // Check admin requirement
      if (requireAdmin && !isAdmin(user)) {
        router.push('/unauthorized');
        return;
      }

      // Check marketing requirement
      if (requireMarketing && !hasMarketingAccess(user)) {
        router.push('/unauthorized');
        return;
      }

      // Check specific role requirement
      if (requiredRole && !hasPermission(user, requiredRole)) {
        router.push('/upgrade-required');
        return;
      }
    }
  }, [session, status, router, requiredRole, requireAdmin, requireMarketing, requireActive, redirectTo]);

  // Loading state
  if (status === 'loading') {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-secondary-medium-gray">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (status === 'unauthenticated') {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-secondary-dark-blue">Authentication Required</h2>
          <p className="mt-2 text-secondary-medium-gray">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Check all requirements
  if (session?.user) {
    const user = session.user as AuthUser;

    // Account not active
    if (requireActive && user.accountStatus !== AccountStatus.ACTIVE) {
      return fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-status-error">Account Suspended</h2>
            <p className="mt-2 text-secondary-medium-gray">Your account is currently suspended.</p>
          </div>
        </div>
      );
    }

    // Insufficient permissions
    if (
      (requireAdmin && !isAdmin(user)) ||
      (requireMarketing && !hasMarketingAccess(user)) ||
      (requiredRole && !hasPermission(user, requiredRole))
    ) {
      return fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-status-error">Access Denied</h2>
            <p className="mt-2 text-secondary-medium-gray">
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      );
    }
  }

  // All checks passed
  return <>{children}</>;
};

export default ProtectedRoute;
