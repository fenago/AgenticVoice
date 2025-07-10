'use client';

import React from 'react';

import { EnhancedAdminSidebar } from './EnhancedAdminSidebar';
import { EnhancedAdminHeader } from './EnhancedAdminHeader';
import { PageTransition } from './PageTransition';
import { PageLayout, ResponsiveContainer } from './ResponsiveLayout';
import { MobileMenu } from './MobileMenu';
import { useAdminStore } from '../hooks/useAdminStore';
import '../styles/responsive.css';

interface AdminLayoutProps {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

export function AdminLayout({ children, user }: AdminLayoutProps) {
  const { sidebarCollapsed, setSidebarCollapsed } = useAdminStore();

  // Prepare user data for mobile menu
  const adminUser = user ? {
    name: user.name || 'Admin User',
    email: user.email || 'admin@agenticvoice.net',
    avatar: user.image || undefined,
    role: 'Super Admin' // This would come from your user role system
  } : undefined;

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f8fafc', // DesignSystem.colors.neutral[50]
      position: 'relative'
    }}>
      {/* Enhanced Sidebar - Hidden on mobile */}
      <EnhancedAdminSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      {/* Enhanced Header */}
      <EnhancedAdminHeader 
        user={user}
        sidebarCollapsed={sidebarCollapsed}
        onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Mobile Menu */}
      <MobileMenu user={adminUser} />
      
      {/* Main Content Area with Page Layout */}
      <PageLayout 
        hasHeader={true}
        hasSidebar={true}
        sidebarCollapsed={sidebarCollapsed}
      >
        <ResponsiveContainer 
          maxWidth="1400px"
          padding="24px"
        >
          <main style={{ 
            minHeight: 'calc(100vh - 96px)', // Account for header height
            paddingTop: '24px',
            paddingBottom: '24px'
          }}>
            {children}
          </main>
        </ResponsiveContainer>
      </PageLayout>
    </div>
  );
}
