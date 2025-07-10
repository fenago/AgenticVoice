'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { DesignSystem } from '@/app/admin/styles/design-system';
import { Typography } from '@/app/admin/components/ui';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<any>;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  showHome?: boolean;
  separator?: React.ReactNode;
  className?: string;
}

// 🗺️ Route to breadcrumb mapping for automatic generation
const routeToBreadcrumb: Record<string, BreadcrumbItem[]> = {
  '/admin': [
    { label: 'Dashboard', icon: Home }
  ],
  '/admin/users': [
    { label: 'Dashboard', href: '/admin', icon: Home },
    { label: 'User Management' }
  ],
  '/admin/users/roles': [
    { label: 'Dashboard', href: '/admin', icon: Home },
    { label: 'User Management', href: '/admin/users' },
    { label: 'User Roles' }
  ],
  '/admin/users/activity': [
    { label: 'Dashboard', href: '/admin', icon: Home },
    { label: 'User Management', href: '/admin/users' },
    { label: 'Activity Logs' }
  ],
  '/admin/assistants': [
    { label: 'Dashboard', href: '/admin', icon: Home },
    { label: 'Voice AI Assistants' }
  ],
  '/admin/assistants/voice': [
    { label: 'Dashboard', href: '/admin', icon: Home },
    { label: 'Voice AI Assistants', href: '/admin/assistants' },
    { label: 'Voice Settings' }
  ],
  '/admin/assistants/analytics': [
    { label: 'Dashboard', href: '/admin', icon: Home },
    { label: 'Voice AI Assistants', href: '/admin/assistants' },
    { label: 'Call Analytics' }
  ],
  '/admin/subscriptions': [
    { label: 'Dashboard', href: '/admin', icon: Home },
    { label: 'Subscriptions' }
  ],
  '/admin/subscriptions/plans': [
    { label: 'Dashboard', href: '/admin', icon: Home },
    { label: 'Subscriptions', href: '/admin/subscriptions' },
    { label: 'Subscription Plans' }
  ],
  '/admin/subscriptions/billing': [
    { label: 'Dashboard', href: '/admin', icon: Home },
    { label: 'Subscriptions', href: '/admin/subscriptions' },
    { label: 'Customer Billing' }
  ],
  '/admin/subscriptions/analytics': [
    { label: 'Dashboard', href: '/admin', icon: Home },
    { label: 'Subscriptions', href: '/admin/subscriptions' },
    { label: 'Payment Analytics' }
  ],
  '/admin/calls': [
    { label: 'Dashboard', href: '/admin', icon: Home },
    { label: 'Call Records' }
  ],
  '/admin/calls/analytics': [
    { label: 'Dashboard', href: '/admin', icon: Home },
    { label: 'Call Records', href: '/admin/calls' },
    { label: 'Call Analytics' }
  ],
  '/admin/calls/quality': [
    { label: 'Dashboard', href: '/admin', icon: Home },
    { label: 'Call Records', href: '/admin/calls' },
    { label: 'Quality Control' }
  ],
  '/admin/security': [
    { label: 'Dashboard', href: '/admin', icon: Home },
    { label: 'Security & Audit' }
  ],
  '/admin/security/audit': [
    { label: 'Dashboard', href: '/admin', icon: Home },
    { label: 'Security & Audit', href: '/admin/security' },
    { label: 'Audit Logs' }
  ],
  '/admin/security/access': [
    { label: 'Dashboard', href: '/admin', icon: Home },
    { label: 'Security & Audit', href: '/admin/security' },
    { label: 'Access Control' }
  ],
  '/admin/security/monitor': [
    { label: 'Dashboard', href: '/admin', icon: Home },
    { label: 'Security & Audit', href: '/admin/security' },
    { label: 'System Monitor' }
  ],
  '/admin/settings': [
    { label: 'Dashboard', href: '/admin', icon: Home },
    { label: 'Settings' }
  ],
  '/admin/settings/general': [
    { label: 'Dashboard', href: '/admin', icon: Home },
    { label: 'Settings', href: '/admin/settings' },
    { label: 'General Settings' }
  ],
  '/admin/settings/api': [
    { label: 'Dashboard', href: '/admin', icon: Home },
    { label: 'Settings', href: '/admin/settings' },
    { label: 'API Configuration' }
  ],
  '/admin/settings/notifications': [
    { label: 'Dashboard', href: '/admin', icon: Home },
    { label: 'Settings', href: '/admin/settings' },
    { label: 'Notifications' }
  ]
};

export function Breadcrumb({ 
  items, 
  showHome = true, 
  separator = <ChevronRight size={16} />,
  className = '' 
}: BreadcrumbProps) {
  const pathname = usePathname();
  
  // Use provided items or auto-generate from pathname
  const breadcrumbItems = items || routeToBreadcrumb[pathname] || [
    { label: 'Dashboard', href: '/admin', icon: Home }
  ];

  if (breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: DesignSystem.spacing[2],
        padding: `${DesignSystem.spacing[3]} 0`,
        flexWrap: 'wrap',
      }}
      className={className}
    >
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        const IconComponent = item.icon;

        return (
          <React.Fragment key={`${item.label}-${index}`}>
            {/* Breadcrumb Item */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: DesignSystem.spacing[1],
              }}
            >
              {/* Icon (only for first item or if specified) */}
              {IconComponent && (index === 0 || item.icon) && (
                <IconComponent
                  size={16}
                  style={{
                    color: isLast 
                      ? DesignSystem.colors.primary[600] 
                      : DesignSystem.colors.neutral[500],
                  }}
                />
              )}

              {/* Link or Text */}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  style={{
                    textDecoration: 'none',
                    transition: `color ${DesignSystem.animations.transition.normal}`,
                  }}
                >
                  <Typography
                    variant="body-sm"
                    color="secondary"
                    style={{
                      transition: `color ${DesignSystem.animations.transition.normal}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = DesignSystem.colors.primary[600];
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = DesignSystem.colors.neutral[600];
                    }}
                  >
                    {item.label}
                  </Typography>
                </Link>
              ) : (
                <Typography
                  variant="body-sm"
                  color={isLast ? 'primary' : 'secondary'}
                  weight={isLast ? 'medium' : 'normal'}
                >
                  {item.label}
                </Typography>
              )}
            </div>

            {/* Separator */}
            {!isLast && (
              <div
                style={{
                  color: DesignSystem.colors.neutral[400],
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {separator}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

// 🎨 Enhanced Breadcrumb with Actions
interface PageBreadcrumbProps extends BreadcrumbProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
}

export function PageBreadcrumb({ 
  title, 
  subtitle, 
  actions, 
  showBackButton, 
  onBack,
  ...breadcrumbProps 
}: PageBreadcrumbProps) {
  const pathname = usePathname();
  
  // Auto-generate title from last breadcrumb item if not provided
  const breadcrumbItems = breadcrumbProps.items || routeToBreadcrumb[pathname] || [];
  const autoTitle = breadcrumbItems[breadcrumbItems.length - 1]?.label || 'Page';

  return (
    <div
      style={{
        borderBottom: `1px solid ${DesignSystem.colors.neutral[200]}`,
        backgroundColor: 'white',
        padding: `${DesignSystem.spacing[4]} 0`,
        marginBottom: DesignSystem.spacing[6],
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: `0 ${DesignSystem.spacing[6]}`,
        }}
      >
        {/* Breadcrumb Navigation */}
        <Breadcrumb {...breadcrumbProps} />

        {/* Page Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginTop: DesignSystem.spacing[4],
            gap: DesignSystem.spacing[4],
          }}
        >
          {/* Title & Subtitle */}
          <div style={{ flex: 1 }}>
            <Typography
              variant="heading-lg"
              weight="bold"
              style={{ marginBottom: DesignSystem.spacing[1] }}
            >
              {title || autoTitle}
            </Typography>
            {subtitle && (
              <Typography variant="body-lg" color="muted">
                {subtitle}
              </Typography>
            )}
          </div>

          {/* Actions */}
          {actions && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: DesignSystem.spacing[2],
                flexShrink: 0,
              }}
            >
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 🔄 Hook for breadcrumb management
export function useBreadcrumb() {
  const pathname = usePathname();
  
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    return routeToBreadcrumb[pathname] || [
      { label: 'Dashboard', href: '/admin', icon: Home }
    ];
  };

  const getCurrentPage = (): string => {
    const breadcrumbs = getBreadcrumbs();
    return breadcrumbs[breadcrumbs.length - 1]?.label || 'Page';
  };

  return {
    breadcrumbs: getBreadcrumbs(),
    currentPage: getCurrentPage(),
    pathname
  };
}
