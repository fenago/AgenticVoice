'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, Button, Badge } from '@/components/ui';
import { isAdmin } from '@/libs/auth-utils';
import { User, Shield, Settings, CreditCard, TestTube, ExternalLink } from 'lucide-react';

export default function TestPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Page</h1>
        <p className="text-gray-600">Test and navigate between different components and pages</p>
      </div>

      {/* Authentication Status */}
      <Card className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
        {session ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <span className="font-medium">Logged in as:</span>
              <span>{session.user?.name || session.user?.email}</span>
              <Badge variant="success">Authenticated</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="font-medium">Role:</span>
              <span>{session.user?.role || 'FREE'}</span>
              {isAdmin(session.user) && <Badge variant="warning">Admin Access</Badge>}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Industry:</span>
              <span>{session.user?.industryType || 'Not specified'}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            <span>Not authenticated</span>
            <Badge variant="destructive">Not Logged In</Badge>
          </div>
        )}
      </Card>

      {/* Navigation Links */}
      <Card className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Page Navigation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Dashboard */}
          <Link href="/dashboard" className="block">
            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <TestTube className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="font-medium">Dashboard</h3>
                  <p className="text-sm text-gray-600">Main user dashboard</p>
                </div>
                <ExternalLink className="w-4 h-4 ml-auto" />
              </div>
            </div>
          </Link>

          {/* Customer Portal */}
          <Link href="/customer" className="block">
            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <User className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="font-medium">Customer Portal</h3>
                  <p className="text-sm text-gray-600">Customer interface</p>
                </div>
                <ExternalLink className="w-4 h-4 ml-auto" />
              </div>
            </div>
          </Link>

          {/* Admin Panel (if admin) */}
          {isAdmin(session?.user) && (
            <Link href="/admin" className="block">
              <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-red-600" />
                  <div>
                    <h3 className="font-medium">Admin Panel</h3>
                    <p className="text-sm text-gray-600">Admin controls</p>
                  </div>
                  <ExternalLink className="w-4 h-4 ml-auto" />
                </div>
              </div>
            </Link>
          )}

          {/* Performance Page */}
          <Link href="/performance" className="block">
            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-purple-600" />
                <div>
                  <h3 className="font-medium">Performance</h3>
                  <p className="text-sm text-gray-600">Performance metrics</p>
                </div>
                <ExternalLink className="w-4 h-4 ml-auto" />
              </div>
            </div>
          </Link>

          {/* Billing */}
          <Link href="/billing" className="block">
            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-orange-600" />
                <div>
                  <h3 className="font-medium">Billing</h3>
                  <p className="text-sm text-gray-600">Subscription & payments</p>
                </div>
                <ExternalLink className="w-4 h-4 ml-auto" />
              </div>
            </div>
          </Link>

        </div>
      </Card>

      {/* UI Components Test */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">UI Components Test</h2>
        
        {/* Buttons */}
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Buttons</h3>
            <div className="flex flex-wrap gap-2">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="medical">Medical</Button>
              <Button variant="legal">Legal</Button>
              <Button variant="sales">Sales</Button>
            </div>
          </div>

          {/* Badges */}
          <div>
            <h3 className="font-medium mb-2">Badges</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="default">Primary</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="destructive">Error</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="info">Medical</Badge>
              <Badge variant="info">Legal</Badge>
              <Badge variant="info">Sales</Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
