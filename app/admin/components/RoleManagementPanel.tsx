'use client';

import { useState, useEffect } from 'react';
import { useAdminToast } from '@/app/admin/hooks/useAdminToast';
import { UserRole } from '@/types/auth';
import {
  PermissionMatrix,
  RolePermissions,
  SecurityPermission,
  PERMISSION_CATEGORIES,
} from '@/app/admin/types/security';
import { DesignSystem } from '@/app/admin/styles/design-system';
import Typography from '@/app/admin/components/ui/Typography';

// Role hierarchy defines which roles are implicitly included by higher roles.
const roleHierarchy: Record<UserRole, UserRole[]> = {
  [UserRole.FREE]: [],
  [UserRole.ESSENTIAL]: [UserRole.FREE],
  [UserRole.PRO]: [UserRole.ESSENTIAL, UserRole.FREE],
  [UserRole.ENTERPRISE]: [UserRole.PRO, UserRole.ESSENTIAL, UserRole.FREE],
  [UserRole.CUSTOM]: [UserRole.ENTERPRISE, UserRole.PRO, UserRole.ESSENTIAL, UserRole.FREE], // Custom is a high-level client
  [UserRole.MARKETING]: [UserRole.ENTERPRISE, UserRole.PRO, UserRole.ESSENTIAL, UserRole.FREE], // Marketing has broad access
  [UserRole.ADMIN]: [UserRole.MARKETING, UserRole.CUSTOM, UserRole.ENTERPRISE, UserRole.PRO, UserRole.ESSENTIAL, UserRole.FREE],
  [UserRole.GOD_MODE]: [UserRole.ADMIN, UserRole.MARKETING, UserRole.CUSTOM, UserRole.ENTERPRISE, UserRole.PRO, UserRole.ESSENTIAL, UserRole.FREE],
};

// Default permissions assigned to each role.
const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.FREE]: ['users.view'],
  [UserRole.ESSENTIAL]: ['users.view', 'billing.view'],
  [UserRole.PRO]: ['users.view', 'billing.view', 'crm.view'],
  [UserRole.ENTERPRISE]: ['users.view', 'billing.view', 'crm.view', 'vapi.view'],
  [UserRole.CUSTOM]: ['users.view', 'billing.view', 'crm.view', 'vapi.view'], // Custom starts with Enterprise permissions
  [UserRole.MARKETING]: [
    'users.view', 'users.edit',
    'crm.view', 'crm.create', 'crm.edit', 'crm.export',
    'settings.view'
  ],
  [UserRole.ADMIN]: [
    'users.view', 'users.edit', 'users.suspend',
    'billing.view', 'billing.edit', 'subscriptions.manage',
    'crm.view', 'crm.edit',
    'settings.view', 'settings.edit',
    'audit.logs'
  ],
  [UserRole.GOD_MODE]: [
    // God mode has all permissions
    ...Object.values(PERMISSION_CATEGORIES).flatMap(category => 
      category.permissions.map(p => p.key)
    )
  ]
};

interface RoleManagementPanelProps {
  className?: string;
}

const ALLOWED_ROLES = [UserRole.ADMIN, UserRole.GOD_MODE];

function isAllowedRole(role: any): role is UserRole {
  return ALLOWED_ROLES.includes(role);
}

export function RoleManagementPanel({ className }: RoleManagementPanelProps) {
  const [roles, setRoles] = useState<RolePermissions[]>([]);
  const [permissionMatrix, setPermissionMatrix] = useState<PermissionMatrix>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showSuccessToast, showErrorToast } = useAdminToast();

  useEffect(() => {
    // Fetch roles and permissions
  }, []);

  const handlePermissionChange = (roleName: UserRole, permissionKey: string, checked: boolean) => {
    // Handle permission change
  };

  const canChangeRole = (currentUserRole: UserRole, targetUserRole: UserRole, newRole: UserRole): boolean => {
    if (currentUserRole === UserRole.GOD_MODE) return true;
    if (newRole === UserRole.GOD_MODE) {
      return false; // Only God mode can assign God mode
    }
    const hierarchy = roleHierarchy[currentUserRole];
    return hierarchy.includes(targetUserRole);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={className}>
      <Typography variant="heading-md">Role & Permission Management</Typography>
      {/* Rest of the component JSX */}
    </div>
  );
}
