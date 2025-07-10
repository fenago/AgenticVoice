import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import { UserRole } from '@/types/auth';
import ButtonAccount from "@/components/ButtonAccount";

export const dynamic = "force-dynamic";

// This is a private page: It's protected by the layout.js component which ensures the user is authenticated.
// It's a server component which means you can fetch data (like the user profile) before the page is rendered.
// Auto-redirects users based on their role to appropriate portals.
export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  
  // Check user role and redirect accordingly
  if (session?.user?.role) {
    const userRole = session.user.role as UserRole;
    
    // Admin roles go to admin portal
    if (userRole === UserRole.GOD_MODE || 
        userRole === UserRole.ADMIN || 
        userRole === UserRole.MARKETING) {
      redirect('/admin');
    }
    
    // All other roles go to customer portal
    if (userRole === UserRole.FREE || 
        userRole === UserRole.ESSENTIAL || 
        userRole === UserRole.PRO || 
        userRole === UserRole.ENTERPRISE || 
        userRole === UserRole.CUSTOM) {
      redirect('/customer');
    }
  }
  
  // Fallback dashboard for users without proper roles
  return (
    <main className="min-h-screen p-8 pb-24">
      <section className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4">Welcome to AgenticVoice</h1>
          <p className="text-lg text-gray-600 mb-8">Setting up your account...</p>
        </div>
        
        <div className="max-w-md mx-auto">
          <ButtonAccount />
        </div>
        
        {/* Role Assignment Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-2xl mx-auto">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 text-yellow-600 mt-0.5">⚠️</div>
            <div>
              <h3 className="font-medium text-yellow-800 mb-2">Account Setup Required</h3>
              <p className="text-sm text-yellow-700 mb-4">
                Your account role is being configured. You'll be redirected to the appropriate portal once setup is complete.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Admin Users:</strong>
                  <ul className="mt-1 text-yellow-600">
                    <li>• Platform Admin Portal</li>
                    <li>• User Management</li>
                    <li>• System Configuration</li>
                  </ul>
                </div>
                <div>
                  <strong>Customer Users:</strong>
                  <ul className="mt-1 text-yellow-600">
                    <li>• Customer Portal</li>
                    <li>• AI Voice Assistants</li>
                    <li>• Account Management</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="bg-white border rounded-lg p-6 text-center">
            <h3 className="font-semibold mb-2">Customer Portal</h3>
            <p className="text-sm text-gray-600 mb-4">Manage your AI voice assistants and account</p>
            <a href="/customer" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              Go to Customer Portal
            </a>
          </div>
          
          <div className="bg-white border rounded-lg p-6 text-center">
            <h3 className="font-semibold mb-2">Admin Portal</h3>
            <p className="text-sm text-gray-600 mb-4">Platform administration and management</p>
            <a href="/admin" className="inline-block bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors">
              Go to Admin Portal
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
