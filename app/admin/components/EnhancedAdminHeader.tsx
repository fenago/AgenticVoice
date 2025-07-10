'use client';

import React, { useState, useRef, useEffect } from 'react';

import { useRouter } from 'next/navigation';
import { useSpring, animated, config } from '@react-spring/web';
import { 
  Search, 
  Bell, 
  User, 
  LogOut, 
  Settings, 
  HelpCircle,
  Shield,
  Moon,
  Sun,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { DesignSystem } from '@/app/admin/styles/design-system';
import { Button, Input, Typography, Card } from '@/app/admin/components/ui';
import { useBreakpoint } from '../hooks/useBreakpoint';

interface AdminHeaderProps {
  onMenuToggle?: () => void;
  sidebarCollapsed?: boolean;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'warning' | 'success' | 'error';
  unread: boolean;
  avatar?: string;
}

// 🔔 Mock Notifications Data
const mockNotifications: NotificationItem[] = [
  {
    id: '1',
    title: 'New User Registration',
    message: 'John Doe has registered for a PRO account',
    time: '2 minutes ago',
    type: 'success',
    unread: true,
    avatar: 'JD'
  },
  {
    id: '2',
    title: 'Payment Failed',
    message: 'Subscription payment failed for Acme Corp',
    time: '1 hour ago',
    type: 'error',
    unread: true,
    avatar: 'AC'
  },
  {
    id: '3',
    title: 'System Maintenance',
    message: 'Scheduled maintenance completed successfully',
    time: '3 hours ago',
    type: 'info',
    unread: false
  },
  {
    id: '4',
    title: 'Voice Assistant Update',
    message: 'New VAPI assistant features are now available',
    time: '1 day ago',
    type: 'info',
    unread: true
  }
];

export function EnhancedAdminHeader({ onMenuToggle, sidebarCollapsed, user }: AdminHeaderProps) {
  const router = useRouter();
  const { isMobile } = useBreakpoint();
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Refs for click outside handling
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Calculated values
  const unreadCount = mockNotifications.filter(n => n.unread).length;
  const adminUser = user || {
    name: 'Admin User',
    email: 'admin@agenticvoice.net',
    image: null
  };

  // React Spring animations
  const headerSpring = useSpring({
    marginLeft: sidebarCollapsed ? '80px' : '280px',
    config: config.gentle
  });

  const searchSpring = useSpring({
    transform: searchQuery ? 'scale(1.02)' : 'scale(1)',
    config: config.gentle
  });

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/admin/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    // Mark as read and navigate
    console.log('Notification clicked:', notification);
    setShowNotifications(false);
  };

  const handleLogout = () => {
    router.push('/api/auth/signout');
  };

  const getNotificationIcon = (type: NotificationItem['type']) => {
    const icons = {
      info: '💡',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    return icons[type];
  };

  const getNotificationColor = (type: NotificationItem['type']) => {
    const colors = {
      info: DesignSystem.colors.primary[500],
      success: DesignSystem.colors.success,
      warning: DesignSystem.colors.warning,
      error: DesignSystem.colors.error
    };
    return colors[type];
  };

  return (
    <>
      {/* Main Header */}
      <animated.header
        style={{
          ...headerSpring,
          position: 'fixed',
          top: 0,
          right: 0,
          height: '72px',
          backgroundColor: 'white',
          borderBottom: `1px solid ${DesignSystem.colors.neutral[200]}`,
          boxShadow: DesignSystem.shadows.sm,
          zIndex: DesignSystem.zIndex.header,
          display: 'flex',
          alignItems: 'center',
          padding: `0 ${DesignSystem.spacing[6]}`,
        }}
      >
        {/* Mobile Menu Button (hidden on desktop) */}
        {isMobile && (
          <div style={{ marginRight: DesignSystem.spacing[4] }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        )}

        {/* Search Bar */}
        <animated.div
          style={{
            ...searchSpring,
            flex: 1,
            maxWidth: '600px',
            marginRight: DesignSystem.spacing[6]
          }}
        >
          <form onSubmit={handleSearch}>
            <Input
              type="text"
              placeholder="Search users, assistants, calls, or anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={16} />}
              style={{
                backgroundColor: DesignSystem.colors.neutral[50],
                border: `1px solid ${DesignSystem.colors.neutral[200]}`,
                borderRadius: DesignSystem.borderRadius.lg,
                fontSize: DesignSystem.typography.fontSize.sm,
              }}
            />
          </form>
        </animated.div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: DesignSystem.spacing[2] }}>
          {/* Help Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/help')}
            style={{ 
              padding: DesignSystem.spacing[2],
              minWidth: 'auto'
            }}
          >
            <HelpCircle size={20} />
          </Button>

          {/* Notifications */}
          <div style={{ position: 'relative' }} ref={notificationsRef}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
              style={{ 
                position: 'relative',
                padding: DesignSystem.spacing[2],
                minWidth: 'auto'
              }}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    backgroundColor: DesignSystem.colors.error,
                    color: 'white',
                    borderRadius: DesignSystem.borderRadius.full,
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: DesignSystem.typography.fontWeight.bold,
                  }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
            </Button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <animated.div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: DesignSystem.spacing[2],
                  width: '380px',
                  backgroundColor: 'white',
                  borderRadius: DesignSystem.borderRadius.lg,
                  boxShadow: DesignSystem.shadows.lg,
                  border: `1px solid ${DesignSystem.colors.neutral[200]}`,
                  zIndex: DesignSystem.zIndex.dropdown,
                }}
              >
                {/* Header */}
                <div
                  style={{
                    padding: DesignSystem.spacing[4],
                    borderBottom: `1px solid ${DesignSystem.colors.neutral[200]}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography variant="heading-sm" weight="semibold">
                    Notifications
                  </Typography>
                  <Button variant="ghost" size="sm">
                    Mark all read
                  </Button>
                </div>

                {/* Notifications List */}
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {mockNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      style={{
                        padding: DesignSystem.spacing[4],
                        borderBottom: `1px solid ${DesignSystem.colors.neutral[100]}`,
                        cursor: 'pointer',
                        backgroundColor: notification.unread ? DesignSystem.colors.neutral[50] : 'transparent',
                        transition: `background-color ${DesignSystem.animations.transition.normal}`,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: DesignSystem.spacing[3] }}>
                        {/* Avatar/Icon */}
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: DesignSystem.borderRadius.full,
                            backgroundColor: getNotificationColor(notification.type),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: DesignSystem.typography.fontWeight.semibold,
                            flexShrink: 0,
                          }}
                        >
                          {notification.avatar || getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="body-sm"
                            weight="medium"
                            style={{ marginBottom: DesignSystem.spacing[1] }}
                          >
                            {notification.title}
                          </Typography>
                          <Typography
                            variant="body-sm"
                            color="muted"
                            style={{ marginBottom: DesignSystem.spacing[2] }}
                          >
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="muted">
                            {notification.time}
                          </Typography>
                        </div>

                        {/* Unread Indicator */}
                        {notification.unread && (
                          <div
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: DesignSystem.borderRadius.full,
                              backgroundColor: DesignSystem.colors.primary[500],
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div style={{ padding: DesignSystem.spacing[3], textAlign: 'center' }}>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      router.push('/admin/notifications');
                      setShowNotifications(false);
                    }}
                  >
                    View all notifications
                  </Button>
                </div>
              </animated.div>
            )}
          </div>

          {/* User Menu */}
          <div style={{ position: 'relative' }} ref={userMenuRef}>
            <Button
              variant="ghost"
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: DesignSystem.spacing[2],
                padding: DesignSystem.spacing[2],
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: DesignSystem.borderRadius.full,
                  backgroundColor: DesignSystem.colors.primary[500],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: DesignSystem.typography.fontWeight.semibold,
                }}
              >
                {adminUser.image ? (
                  <img 
                    src={adminUser.image} 
                    alt={adminUser.name || 'Admin'} 
                    style={{ width: '100%', height: '100%', borderRadius: 'inherit' }}
                  />
                ) : (
                  adminUser.name?.charAt(0) || 'A'
                )}
              </div>

              {/* Name & Chevron */}
              <div style={{ display: 'flex', alignItems: 'center', gap: DesignSystem.spacing[1] }}>
                <Typography variant="body-sm" weight="medium">
                  {adminUser.name || 'Admin User'}
                </Typography>
                <ChevronDown
                  size={16}
                  style={{
                    color: DesignSystem.colors.neutral[400],
                    transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: `transform ${DesignSystem.animations.transition.normal}`,
                  }}
                />
              </div>
            </Button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <animated.div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: DesignSystem.spacing[2],
                  width: '240px',
                  backgroundColor: 'white',
                  borderRadius: DesignSystem.borderRadius.lg,
                  boxShadow: DesignSystem.shadows.lg,
                  border: `1px solid ${DesignSystem.colors.neutral[200]}`,
                  zIndex: DesignSystem.zIndex.dropdown,
                }}
              >
                {/* User Info */}
                <div
                  style={{
                    padding: DesignSystem.spacing[4],
                    borderBottom: `1px solid ${DesignSystem.colors.neutral[200]}`,
                  }}
                >
                  <Typography variant="body-sm" weight="medium">
                    {adminUser.name || 'Admin User'}
                  </Typography>
                  <Typography variant="caption" color="muted">
                    {adminUser.email || 'admin@agenticvoice.net'}
                  </Typography>
                  <div
                    style={{
                      marginTop: DesignSystem.spacing[2],
                      padding: `${DesignSystem.spacing[1]} ${DesignSystem.spacing[2]}`,
                      backgroundColor: DesignSystem.colors.primary[50],
                      borderRadius: DesignSystem.borderRadius.md,
                      display: 'inline-block',
                    }}
                  >
                    <Typography variant="caption" color="primary" weight="medium">
                      Super Admin
                    </Typography>
                  </div>
                </div>

                {/* Menu Items */}
                <div style={{ padding: DesignSystem.spacing[2] }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      router.push('/admin/profile');
                      setShowUserMenu(false);
                    }}
                    style={{
                      width: '100%',
                      justifyContent: 'flex-start',
                      gap: DesignSystem.spacing[3],
                      marginBottom: DesignSystem.spacing[1],
                    }}
                  >
                    <User size={16} />
                    Profile Settings
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      router.push('/admin/security');
                      setShowUserMenu(false);
                    }}
                    style={{
                      width: '100%',
                      justifyContent: 'flex-start',
                      gap: DesignSystem.spacing[3],
                      marginBottom: DesignSystem.spacing[1],
                    }}
                  >
                    <Shield size={16} />
                    Security
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      router.push('/admin/settings');
                      setShowUserMenu(false);
                    }}
                    style={{
                      width: '100%',
                      justifyContent: 'flex-start',
                      gap: DesignSystem.spacing[3],
                      marginBottom: DesignSystem.spacing[2],
                    }}
                  >
                    <Settings size={16} />
                    Settings
                  </Button>

                  <div style={{ height: '1px', backgroundColor: DesignSystem.colors.neutral[200], margin: `${DesignSystem.spacing[2]} 0` }} />

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      justifyContent: 'flex-start',
                      gap: DesignSystem.spacing[3],
                      color: DesignSystem.colors.error,
                    }}
                  >
                    <LogOut size={16} />
                    Sign Out
                  </Button>
                </div>
              </animated.div>
            )}
          </div>
        </div>
      </animated.header>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && isMobile && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: DesignSystem.zIndex.modal,
          }}
          onClick={() => setShowMobileMenu(false)}
        >
          {/* Mobile Menu Content */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '280px',
              height: '100%',
              backgroundColor: 'white',
              boxShadow: DesignSystem.shadows.xl,
              padding: DesignSystem.spacing[4],
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Typography variant="heading-sm" gradient style={{ marginBottom: DesignSystem.spacing[4] }}>
              AgenticVoice Admin
            </Typography>
            {/* Mobile navigation items would go here */}
          </div>
        </div>
      )}
    </>
  );
}
