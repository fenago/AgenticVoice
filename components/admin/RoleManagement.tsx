'use client';

import { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { UserRole } from '@/types/auth';
import { Crown, Users, Shield, Info, CheckCircle } from 'lucide-react';

interface RoleDefinition {
  role: UserRole;
  name: string;
  description: string;
  permissions: string[];
  color: string;
}

interface RoleManagementProps {
  roleDefinitions: RoleDefinition[];
}

export default function RoleManagement({ roleDefinitions }: RoleManagementProps) {
  const [expandedRole, setExpandedRole] = useState<UserRole | null>(null);

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.GOD_MODE:
        return <Crown className="w-5 h-5 text-yellow-600" />;
      case UserRole.ADMIN:
      case UserRole.MARKETING:
        return <Shield className="w-5 h-5 text-red-600" />;
      case UserRole.ENTERPRISE:
      case UserRole.CUSTOM:
        return <Users className="w-5 h-5 text-green-600" />;
      default:
        return <Users className="w-5 h-5 text-blue-600" />;
    }
  };

  const getRoleLevel = (role: UserRole): number => {
    const levels = {
      [UserRole.FREE]: 1,
      [UserRole.ESSENTIAL]: 2,
      [UserRole.PRO]: 3,
      [UserRole.ENTERPRISE]: 4,
      [UserRole.CUSTOM]: 5,
      [UserRole.ADMIN]: 6,
      [UserRole.MARKETING]: 7,
      [UserRole.GOD_MODE]: 8
    };
    return levels[role] || 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Roles & Permissions</h2>
          <p className="text-gray-600">
            Manage user roles and understand permission levels across the platform
          </p>
        </div>
        <Button variant="primary">
          <Users className="w-4 h-4 mr-2" />
          Assign Roles
        </Button>
      </div>

      {/* Important Notice */}
      <Card className="border-yellow-200 bg-yellow-50">
        <div className="flex items-start gap-3 p-4">
          <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-800 mb-1">Database Notice</h3>
            <p className="text-sm text-yellow-700">
              This platform uses MongoDB collections with <code className="bg-yellow-200 px-1 rounded">av_</code> prefix 
              to avoid conflicts with other applications sharing the same database.
            </p>
          </div>
        </div>
      </Card>

      {/* Role Hierarchy Overview */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Role Hierarchy</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {roleDefinitions
              .sort((a, b) => getRoleLevel(a.role) - getRoleLevel(b.role))
              .map((roleDef) => (
                <div
                  key={roleDef.role}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    expandedRole === roleDef.role
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => 
                    setExpandedRole(expandedRole === roleDef.role ? null : roleDef.role)
                  }
                >
                  <div className="flex items-center gap-2 mb-2">
                    {getRoleIcon(roleDef.role)}
                    <span className="font-medium">{roleDef.name}</span>
                    <Badge variant="secondary">
                      Level {getRoleLevel(roleDef.role)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {roleDef.description}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </Card>

      {/* Detailed Role Information */}
      <div className="space-y-4">
        {roleDefinitions.map((roleDef) => (
          <Card
            key={roleDef.role}
            className={expandedRole === roleDef.role ? 'ring-2 ring-blue-500' : ''}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getRoleIcon(roleDef.role)}
                  <div>
                    <h3 className="text-lg font-semibold">{roleDef.name}</h3>
                    <p className="text-gray-600">{roleDef.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={roleDef.role === UserRole.GOD_MODE ? 'warning' : 
                            roleDef.role === UserRole.ADMIN ? 'destructive' : 'info'}
                  >
                    {roleDef.role}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => 
                      setExpandedRole(expandedRole === roleDef.role ? null : roleDef.role)
                    }
                  >
                    {expandedRole === roleDef.role ? 'Collapse' : 'Expand'}
                  </Button>
                </div>
              </div>

              {expandedRole === roleDef.role && (
                <div className="space-y-4 border-t pt-4">
                  <div>
                    <h4 className="font-medium mb-2">Permissions & Features:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {roleDef.permissions.map((permission, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">{permission}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" size="sm">
                      View Users with Role
                    </Button>
                    <Button variant="outline" size="sm">
                      Edit Permissions
                    </Button>
                    {(roleDef.role === UserRole.ADMIN || roleDef.role === UserRole.GOD_MODE) && (
                      <Button variant="destructive" size="sm">
                        Manage Admin Access
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-16">
              <Users className="w-5 h-5 mr-2" />
              Bulk Role Assignment
            </Button>
            <Button variant="outline" className="h-16">
              <Shield className="w-5 h-5 mr-2" />
              Permission Audit
            </Button>
            <Button variant="outline" className="h-16">
              <Crown className="w-5 h-5 mr-2" />
              Admin Tools
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
