import React, { useState } from 'react';
import { 
  Card, 
  Button, 
  Input 
} from '../../../components/ui';
import { 
  Users, 
  Shield, 
  Lock, 
  Eye, 
  Settings, 
  UserPlus, 
  Trash2, 
  Edit, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Pause, 
  Play, 
  Crown 
} from 'lucide-react';
import { DesignSystem } from '../../../styles/design-system';

interface UserPermission {
  userId: string;
  email: string;
  name: string;
  role: 'viewer' | 'editor' | 'admin' | 'super_admin';
  permissions: string[];
  lastAccess?: Date;
  isActive: boolean;
}

interface RoleDefinition {
  name: string;
  description: string;
  permissions: string[];
  color: string;
}

interface AccessControlTabProps {
  accessControl: any[];
  setAccessControl: React.Dispatch<React.SetStateAction<any[]>>;
  saveSettings: (section: string, data: any) => Promise<void>;
}

const AccessControlTab: React.FC<AccessControlTabProps> = ({ accessControl, setAccessControl, saveSettings }) => {
  // Remove synthetic data per user requirements - use empty state
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);

  const roleDefinitions: RoleDefinition[] = [
    {
      name: 'Super Admin',
      description: 'Full system access with all permissions',
      permissions: ['all'],
      color: DesignSystem.colors.error
    },
    {
      name: 'Admin',
      description: 'CRM management with read/write access',
      permissions: ['crm.read', 'crm.write', 'contacts.manage', 'companies.manage', 'deals.manage', 'settings.manage'],
      color: DesignSystem.colors.primary[500]
    },
    {
      name: 'Editor',
      description: 'Can view and edit CRM data',
      permissions: ['crm.read', 'contacts.manage', 'companies.read', 'deals.read'],
      color: DesignSystem.colors.warning
    },
    {
      name: 'Viewer',
      description: 'Read-only access to CRM data',
      permissions: ['crm.read', 'contacts.read', 'companies.read', 'deals.read'],
      color: DesignSystem.colors.success
    }
  ];

  const allPermissions = [
    { key: 'all', label: 'All Permissions', description: 'Full system access' },
    { key: 'crm.read', label: 'CRM Read', description: 'View CRM data' },
    { key: 'crm.write', label: 'CRM Write', description: 'Modify CRM data' },
    { key: 'contacts.read', label: 'View Contacts', description: 'Read contact information' },
    { key: 'contacts.manage', label: 'Manage Contacts', description: 'Create, edit, delete contacts' },
    { key: 'companies.read', label: 'View Companies', description: 'Read company information' },
    { key: 'companies.manage', label: 'Manage Companies', description: 'Create, edit, delete companies' },
    { key: 'deals.read', label: 'View Deals', description: 'Read deal information' },
    { key: 'deals.manage', label: 'Manage Deals', description: 'Create, edit, delete deals' },
    { key: 'settings.manage', label: 'Manage Settings', description: 'Configure CRM settings' },
    { key: 'webhooks.manage', label: 'Manage Webhooks', description: 'Configure webhook endpoints' },
    { key: 'logs.view', label: 'View Logs', description: 'Access error logs and activity' }
  ];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Crown size={16} color={DesignSystem.colors.error} />;
      case 'admin':
        return <Shield size={16} color={DesignSystem.colors.primary[500]} />;
      case 'editor':
        return <Edit size={16} color={DesignSystem.colors.warning} />;
      case 'viewer':
        return <Eye size={16} color={DesignSystem.colors.success} />;
      default:
        return <Users size={16} color={DesignSystem.colors.neutral[600]} />;
    }
  };

  const getRoleColor = (role: string) => {
    const roleDefinition = roleDefinitions.find(r => 
      r.name.toLowerCase().replace(' ', '_') === role
    );
    return roleDefinition?.color || DesignSystem.colors.neutral[600];
  };

  const toggleUserStatus = (userId: string) => {
    setUserPermissions(prev => prev.map(user => 
      user.userId === userId 
        ? { ...user, isActive: !user.isActive }
        : user
    ));
  };

  const removeUser = (userId: string) => {
    setUserPermissions(prev => prev.filter(user => user.userId !== userId));
  };

  const updateUserRole = (userId: string, newRole: string) => {
    const roleDefinition = roleDefinitions.find(r => 
      r.name.toLowerCase().replace(' ', '_') === newRole
    );
    
    if (roleDefinition) {
      setUserPermissions(prev => prev.map(user => 
        user.userId === userId 
          ? { 
              ...user, 
              role: newRole as any,
              permissions: roleDefinition.permissions
            }
          : user
      ));
    }
  };

  return (
    <div className="access-control-tab">
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: DesignSystem.spacing[8]
      }}>
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: DesignSystem.colors.neutral[900] }}>
            Access Control
          </div>
          <div style={{ fontSize: '0.875rem', color: DesignSystem.colors.neutral[600], marginTop: DesignSystem.spacing[1] }}>
            Manage user permissions and role-based access to CRM features
          </div>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddUser(true)}
          style={{ display: 'flex', alignItems: 'center', gap: DesignSystem.spacing[2] }}
        >
          <UserPlus size={16} />
          Add User
        </Button>
      </div>

      {/* Access Statistics */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: DesignSystem.spacing[4],
        marginBottom: DesignSystem.spacing[8] 
      }}>
        <Card style={{ padding: DesignSystem.spacing[4], textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: DesignSystem.colors.primary[500] }}>
            {userPermissions.length || '--'}
          </div>
          <div style={{ fontSize: '0.875rem', color: DesignSystem.colors.neutral[600], marginTop: DesignSystem.spacing[1] }}>
            Total Users
          </div>
        </Card>
        <Card style={{ padding: DesignSystem.spacing[4], textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: DesignSystem.colors.success }}>
            {userPermissions.filter(u => u.isActive).length || '--'}
          </div>
          <div style={{ fontSize: '0.875rem', color: DesignSystem.colors.neutral[600], marginTop: DesignSystem.spacing[1] }}>
            Active Users
          </div>
        </Card>
        <Card style={{ padding: DesignSystem.spacing[4], textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: DesignSystem.colors.warning }}>
            {userPermissions.filter(u => u.role === 'admin' || u.role === 'super_admin').length || '--'}
          </div>
          <div style={{ fontSize: '0.875rem', color: DesignSystem.colors.neutral[600], marginTop: DesignSystem.spacing[1] }}>
            Administrators
          </div>
        </Card>
        <Card style={{ padding: DesignSystem.spacing[4], textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: DesignSystem.colors.primary[500] }}>
            --
          </div>
          <div style={{ fontSize: '0.875rem', color: DesignSystem.colors.neutral[600], marginTop: DesignSystem.spacing[1] }}>
            Active Today
          </div>
        </Card>
      </div>

      {/* Role Definitions */}
      <Card style={{
        padding: DesignSystem.spacing[4],
        marginBottom: DesignSystem.spacing[8]
      }}>
        <div style={{ 
          fontSize: '1.25rem', 
          fontWeight: 600, 
          color: DesignSystem.colors.neutral[900], 
          marginBottom: DesignSystem.spacing[4] 
        }}>
          Role Definitions
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: DesignSystem.spacing[4]
        }}>
          {roleDefinitions.map((role) => (
            <div
              key={role.name}
              style={{
                padding: DesignSystem.spacing[4],
                border: `2px solid ${role.color}`,
                borderRadius: DesignSystem.borderRadius.lg,
                backgroundColor: DesignSystem.colors.neutral[50]
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: DesignSystem.spacing[2],
                marginBottom: DesignSystem.spacing[2]
              }}>
                {getRoleIcon(role.name.toLowerCase().replace(' ', '_'))}
                <div style={{ color: role.color, fontSize: '1.125rem', fontWeight: 600 }}>
                  {role.name}
                </div>
              </div>
              <div style={{ 
                fontSize: '0.875rem', 
                color: DesignSystem.colors.neutral[600], 
                marginBottom: DesignSystem.spacing[2] 
              }}>
                {role.description}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: DesignSystem.spacing[1] }}>
                {role.permissions.slice(0, 3).map((permission) => (
                  <span
                    key={permission}
                    style={{
                      backgroundColor: role.color,
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: DesignSystem.borderRadius.full,
                      fontSize: '11px',
                      fontWeight: 500
                    }}
                  >
                    {permission === 'all' ? 'ALL' : permission.split('.')[1]?.toUpperCase() || permission.toUpperCase()}
                  </span>
                ))}
                {role.permissions.length > 3 && (
                  <span style={{
                    fontSize: '0.875rem', 
                    color: DesignSystem.colors.neutral[600]
                  }}>
                    +{role.permissions.length - 3} more
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* User Permissions List - Empty state */}
      {userPermissions.length === 0 ? (
        <Card style={{ padding: DesignSystem.spacing[8], textAlign: 'center' }}>
          <Users size={48} color={DesignSystem.colors.neutral[400]} style={{ marginBottom: DesignSystem.spacing[4] }} />
          <div style={{ fontSize: '1.125rem', fontWeight: 600, color: DesignSystem.colors.neutral[900], marginBottom: DesignSystem.spacing[2] }}>
            No Users Configured
          </div>
          <div style={{ fontSize: '0.875rem', color: DesignSystem.colors.neutral[600], marginBottom: DesignSystem.spacing[4] }}>
            Add users to manage their CRM access permissions and roles.
          </div>
          <Button variant="primary" onClick={() => setShowAddUser(true)}>
            Add First User
          </Button>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: DesignSystem.spacing[4] }}>
          {userPermissions.map((user) => (
            <Card
              key={user.userId}
              style={{
                padding: DesignSystem.spacing[4],
                border: `1px solid ${DesignSystem.colors.neutral[300]}`,
                borderLeft: `4px solid ${getRoleColor(user.role)}`,
                opacity: user.isActive ? 1 : 0.6
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: DesignSystem.spacing[2],
                    marginBottom: DesignSystem.spacing[2]
                  }}>
                    {getRoleIcon(user.role)}
                    <div>
                      <div style={{ fontSize: '1.125rem', fontWeight: 600, color: DesignSystem.colors.neutral[900] }}>
                        {user.name}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: DesignSystem.colors.neutral[600] }}>
                        {user.email}
                      </div>
                    </div>
                    <span style={{
                      backgroundColor: getRoleColor(user.role),
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: DesignSystem.borderRadius.full,
                      fontSize: '12px',
                      fontWeight: 500,
                      textTransform: 'uppercase'
                    }}>
                      {user.role.replace('_', ' ')}
                    </span>
                    {user.isActive ? (
                      <div style={{ 
                        color: DesignSystem.colors.success, 
                        backgroundColor: DesignSystem.colors.neutral[50], 
                        padding: DesignSystem.spacing[1], 
                        borderRadius: DesignSystem.borderRadius.full, 
                        fontSize: '0.75rem', 
                        fontWeight: 500
                      }}>
                        Active
                      </div>
                    ) : (
                      <div style={{ 
                        color: DesignSystem.colors.error, 
                        backgroundColor: DesignSystem.colors.neutral[50], 
                        padding: DesignSystem.spacing[1], 
                        borderRadius: DesignSystem.borderRadius.full, 
                        fontSize: '0.75rem', 
                        fontWeight: 500
                      }}>
                        Inactive
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: DesignSystem.spacing[2] }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleUserStatus(user.userId)}
                  >
                    {user.isActive ? <Pause size={16} /> : <Play size={16} />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingUser(user.userId)}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeUser(user.userId)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <Card style={{ padding: DesignSystem.spacing[8], maxWidth: '500px', width: '100%' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: DesignSystem.colors.neutral[900], marginBottom: DesignSystem.spacing[4] }}>
              Add New User
            </div>
            <div style={{ marginBottom: DesignSystem.spacing[4] }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: DesignSystem.colors.neutral[700], marginBottom: DesignSystem.spacing[1] }}>
                Email Address
              </label>
              <Input placeholder="user@example.com" />
            </div>
            <div style={{ marginBottom: DesignSystem.spacing[4] }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: DesignSystem.colors.neutral[700], marginBottom: DesignSystem.spacing[1] }}>
                Role
              </label>
              <select style={{
                width: '100%',
                padding: DesignSystem.spacing[2],
                border: `1px solid ${DesignSystem.colors.neutral[300]}`,
                borderRadius: DesignSystem.borderRadius.md,
                fontSize: '0.875rem'
              }}>
                {roleDefinitions.map(role => (
                  <option key={role.name} value={role.name.toLowerCase().replace(' ', '_')}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: DesignSystem.spacing[2], justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setShowAddUser(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => {
                // API integration would go here
                setShowAddUser(false);
              }}>
                Add User
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AccessControlTab;
