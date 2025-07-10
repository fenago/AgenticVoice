'use client';

import React from 'react';
import { Shield, ShieldCheck, ShieldAlert, Clock, Key, AlertTriangle } from 'lucide-react';

interface AdminSecurityIndicatorsProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    lastLoginAt?: Date;
    isTwoFactorEnabled?: boolean;
    lastAdminActivity?: Date;
    loginCount?: number;
    adminActionCount?: number;
  };
}

export const AdminSecurityIndicators: React.FC<AdminSecurityIndicatorsProps> = ({ user }) => {
  const formatLastActivity = (date?: Date) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Recently';
  };

  const getSecurityLevel = () => {
    let score = 0;
    if (user.isTwoFactorEnabled) score += 2;
    if (user.role === 'SUPER_ADMIN' || user.role === 'GOD_MODE') score += 1;
    if (user.lastLoginAt && new Date().getTime() - user.lastLoginAt.getTime() < 24 * 60 * 60 * 1000) score += 1;
    
    if (score >= 3) return { level: 'High', color: 'text-green-600', bgColor: 'bg-green-50', icon: ShieldCheck };
    if (score >= 2) return { level: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-50', icon: Shield };
    return { level: 'Low', color: 'text-red-600', bgColor: 'bg-red-50', icon: ShieldAlert };
  };

  const security = getSecurityLevel();
  const SecurityIcon = security.icon;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Security Level */}
      <div className={`${security.bgColor} border border-gray-200 rounded-lg p-4`}>
        <div className="flex items-center space-x-3">
          <div className={`${security.color} p-2 rounded-full bg-white`}>
            <SecurityIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Security Level</h3>
            <p className={`text-sm ${security.color} font-medium`}>{security.level}</p>
          </div>
        </div>
      </div>

      {/* 2FA Status */}
      <div className={`${user.isTwoFactorEnabled ? 'bg-green-50' : 'bg-red-50'} border border-gray-200 rounded-lg p-4`}>
        <div className="flex items-center space-x-3">
          <div className={`${user.isTwoFactorEnabled ? 'text-green-600' : 'text-red-600'} p-2 rounded-full bg-white`}>
            <Key className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Two-Factor Auth</h3>
            <p className={`text-sm font-medium ${user.isTwoFactorEnabled ? 'text-green-600' : 'text-red-600'}`}>
              {user.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}
            </p>
          </div>
        </div>
      </div>

      {/* Last Admin Activity */}
      <div className="bg-blue-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="text-blue-600 p-2 rounded-full bg-white">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Last Admin Activity</h3>
            <p className="text-sm text-blue-600 font-medium">{formatLastActivity(user.lastAdminActivity)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Role-based component visibility wrapper
interface RoleGuardProps {
  allowedRoles: string[];
  userRole: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  allowedRoles, 
  userRole, 
  children, 
  fallback = null 
}) => {
  if (!allowedRoles.includes(userRole)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

// Admin session timeout warning
interface AdminSessionWarningProps {
  isVisible: boolean;
  timeRemaining: number; // in seconds
  onExtend: () => void;
  onLogout: () => void;
}

export const AdminSessionWarning: React.FC<AdminSessionWarningProps> = ({
  isVisible,
  timeRemaining,
  onExtend,
  onLogout
}) => {
  if (!isVisible) return null;

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="text-amber-500 p-2 rounded-full bg-amber-50">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Session Expiring Soon</h3>
            <p className="text-sm text-gray-600">Your admin session will expire in:</p>
          </div>
        </div>
        
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-amber-500">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onExtend}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
          >
            Extend Session
          </button>
          <button
            onClick={onLogout}
            className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors duration-200"
          >
            Logout Now
          </button>
        </div>
      </div>
    </div>
  );
};

// Admin security status dashboard widget
export const AdminSecurityDashboard: React.FC<{ stats: any }> = ({ stats }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Overview</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.activeAdmins || 0}</div>
          <div className="text-sm text-gray-600">Active Admins</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.twoFactorEnabled || 0}</div>
          <div className="text-sm text-gray-600">2FA Enabled</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-600">{stats.failedLogins || 0}</div>
          <div className="text-sm text-gray-600">Failed Logins (24h)</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.adminActions || 0}</div>
          <div className="text-sm text-gray-600">Admin Actions (24h)</div>
        </div>
      </div>
    </div>
  );
};
