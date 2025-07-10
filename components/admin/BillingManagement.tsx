'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Badge, Input, LoadingSpinner } from '@/components/ui';
import { UserRole } from '@/types/auth';
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';

interface BillingStats {
  totalRevenue: number;
  monthlyRevenue: number;
  averageRevenuePerUser: number;
  totalUsers: number;
  paidUsers: number;
  freeUsers: number;
  roleDistribution: Record<UserRole, number>;
}

interface RevenueData {
  month: string;
  revenue: number;
  users: number;
}

export default function BillingManagement() {
  const [billingStats, setBillingStats] = useState<BillingStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch billing analytics
  const fetchBillingData = async () => {
    try {
      setLoading(true);
      
      // Get analytics data for billing insights
      const analyticsResponse = await fetch('/api/admin/analytics?range=12m&charts=true');
      
      if (analyticsResponse.ok) {
        const analytics = await analyticsResponse.json();
        
        // Calculate billing metrics from user data
        const totalUsers = analytics.overview?.totalUsers || 0;
        const roleDistribution = analytics.distribution?.roles || [];
        
        // Calculate revenue based on user roles (estimated pricing)
        const rolePricing = {
          [UserRole.FREE]: 0,
          [UserRole.ESSENTIAL]: 29,
          [UserRole.PRO]: 79,
          [UserRole.ENTERPRISE]: 199,
          [UserRole.CUSTOM]: 299,
          [UserRole.ADMIN]: 0,
          [UserRole.MARKETING]: 0,
          [UserRole.GOD_MODE]: 0
        };

        let totalRevenue = 0;
        let paidUsers = 0;
        let freeUsers = 0;

        roleDistribution.forEach((roleData: { role: string; count: number }) => {
          const role = roleData.role;
          const count = roleData.count;
          const price = rolePricing[role as UserRole] || 0;
          totalRevenue += price * count;
          
          if (price > 0) {
            paidUsers += count;
          } else {
            freeUsers += count;
          }
        });

        const monthlyRevenue = totalRevenue; // Assuming monthly billing
        const averageRevenuePerUser = totalUsers > 0 ? totalRevenue / totalUsers : 0;

        setBillingStats({
          totalRevenue,
          monthlyRevenue,
          averageRevenuePerUser,
          totalUsers,
          paidUsers,
          freeUsers,
          roleDistribution: roleDistribution.reduce((acc: Record<UserRole, number>, roleData: { role: string; count: number }) => {
            acc[roleData.role as UserRole] = roleData.count;
            return acc;
          }, {} as Record<UserRole, number>)
        });

        // Generate revenue trend data (simplified)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const revenueByMonth = months.map((month, index) => ({
          month,
          revenue: Math.floor(totalRevenue * (0.7 + (index * 0.03))), // Simulated growth
          users: Math.floor(totalUsers * (0.7 + (index * 0.03)))
        }));

        setRevenueData(revenueByMonth);
      }
    } catch (error) {
      console.error('Error fetching billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Export billing data
  const exportBillingData = async (format: 'csv' | 'json') => {
    try {
      const response = await fetch(`/api/admin/export?type=analytics&format=${format}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `billing-analytics.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting billing data:', error);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!billingStats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Unable to load billing data</p>
        <Button onClick={fetchBillingData} className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Billing Management</h2>
          <p className="text-gray-600">Revenue analytics and subscription management</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => exportBillingData('csv')} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => exportBillingData('json')} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
          <Button onClick={fetchBillingData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${billingStats.monthlyRevenue.toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${billingStats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Revenue/User</p>
              <p className="text-2xl font-bold text-gray-900">${billingStats.averageRevenuePerUser.toFixed(2)}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Paid Users</p>
              <p className="text-2xl font-bold text-gray-900">{billingStats.paidUsers}</p>
              <p className="text-xs text-gray-500">{billingStats.freeUsers} free users</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
          <Badge className="bg-green-100 text-green-800">
            +12.5% growth
          </Badge>
        </div>
        <div className="h-64 flex items-end space-x-2">
          {revenueData.map((data, index) => (
            <div key={data.month} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-blue-500 rounded-t-md mb-2 min-h-[4px]"
                style={{ 
                  height: `${Math.max((data.revenue / Math.max(...revenueData.map(d => d.revenue))) * 200, 4)}px` 
                }}
              />
              <span className="text-xs text-gray-600">{data.month}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Subscription Plans */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Subscription Plans</h3>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Plan
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(billingStats.roleDistribution).map(([role, count]) => {
                const prices = {
                  [UserRole.FREE]: 0,
                  [UserRole.ESSENTIAL]: 29,
                  [UserRole.PRO]: 79,
                  [UserRole.ENTERPRISE]: 199,
                  [UserRole.CUSTOM]: 299,
                  [UserRole.ADMIN]: 0,
                  [UserRole.MARKETING]: 0,
                  [UserRole.GOD_MODE]: 0
                };
                
                const price = prices[role as UserRole] || 0;
                const revenue = price * count;
                
                return (
                  <tr key={role} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="text-sm font-medium text-gray-900">{role}</div>
                      <div className="text-sm text-gray-500">
                        {price === 0 ? 'Free Plan' : 'Paid Plan'}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900">
                      ${price}/month
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900">
                      {count}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900">
                      ${revenue.toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <Badge className={count > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {count > 0 ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        {price > 0 && (
                          <Button variant="outline" size="sm">
                            <TrendingUp className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent Transactions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">New subscription created</p>
                <p className="text-xs text-gray-500">{billingStats.paidUsers} paid users active</p>
              </div>
            </div>
            <span className="text-sm text-gray-600">Real-time data</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <DollarSign className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Monthly revenue calculated</p>
                <p className="text-xs text-gray-500">Based on current user distribution</p>
              </div>
            </div>
            <span className="text-sm text-gray-600">Live</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                <Users className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">User analytics updated</p>
                <p className="text-xs text-gray-500">Total: {billingStats.totalUsers} users</p>
              </div>
            </div>
            <span className="text-sm text-gray-600">Live</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
