import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth-config';
import { MongoClient } from 'mongodb';
import { UserRole } from '@/types/auth';

const MONGODB_URI = process.env.MONGODB_URI!;

// Helper function to connect to MongoDB
async function connectToDatabase() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  return client.db('test');
}

// Helper function to check admin access
async function checkAdminAccess(session: any) {
  if (!session?.user?.role) return false;
  
  const adminRoles = [UserRole.GOD_MODE, UserRole.ADMIN, UserRole.MARKETING];
  return adminRoles.includes(session.user.role);
}

// GET /api/admin/analytics - Get comprehensive analytics data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !await checkAdminAccess(session)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('range') || '30d'; // 24h, 7d, 30d, 90d, 1y
    const includeCharts = searchParams.get('charts') === 'true';

    const db = await connectToDatabase();
    
    // Calculate date ranges
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const usersCollection = db.collection('av_users');
    const accountsCollection = db.collection('av_accounts');
    const sessionsCollection = db.collection('av_sessions');

    // Basic user metrics
    const totalUsers = await usersCollection.countDocuments();
    const newUsers = await usersCollection.countDocuments({
      createdAt: { $gte: startDate }
    });
    const activeUsers = await usersCollection.countDocuments({
      lastLoginAt: { $gte: startDate }
    });

    // User role distribution
    const roleDistribution = await usersCollection.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    // Industry distribution
    const industryDistribution = await usersCollection.aggregate([
      {
        $group: {
          _id: '$industryType',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    // Account status distribution
    const statusDistribution = await usersCollection.aggregate([
      {
        $group: {
          _id: '$accountStatus',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    // Growth metrics (daily registrations over time range)
    let growthData: Array<{
      _id: any;
      count: number;
    }> = [];
    let aggregationUnit = 'day';
    
    if (includeCharts) {
      aggregationUnit = timeRange === '24h' ? 'hour' : 
                       timeRange === '7d' ? 'day' : 'day';
      
      growthData = await usersCollection.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: aggregationUnit === 'hour' ? {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' },
              hour: { $hour: '$createdAt' }
            } : {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ]).toArray() as Array<{ _id: any; count: number }>;
    }

    // Login activity analysis
    const loginActivity = await usersCollection.aggregate([
      {
        $match: {
          loginCount: { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          averageLogins: { $avg: '$loginCount' },
          totalLogins: { $sum: '$loginCount' },
          maxLogins: { $max: '$loginCount' },
          usersWithLogins: { $sum: 1 }
        }
      }
    ]).toArray();

    // Session analytics
    const sessionStats = await sessionsCollection.aggregate([
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          activeSessions: {
            $sum: {
              $cond: [
                { $gt: ['$expires', now] },
                1,
                0
              ]
            }
          }
        }
      }
    ]).toArray();

    // Top performing metrics
    const topUsers = await usersCollection.find({
      loginCount: { $gt: 0 }
    })
    .sort({ loginCount: -1 })
    .limit(10)
    .project({ 
      email: 1, 
      name: 1, 
      role: 1, 
      loginCount: 1, 
      lastLoginAt: 1 
    })
    .toArray();

    // Recent activity
    const recentUsers = await usersCollection.find({
      createdAt: { $gte: startDate }
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .project({ 
      email: 1, 
      name: 1, 
      role: 1, 
      createdAt: 1, 
      industryType: 1 
    })
    .toArray();

    // Calculate conversion metrics
    const emailVerifiedUsers = await usersCollection.countDocuments({
      emailVerified: { $ne: null }
    });
    
    const verificationRate = totalUsers > 0 ? 
      Math.round((emailVerifiedUsers / totalUsers) * 100) : 0;

    const activationRate = totalUsers > 0 ? 
      Math.round((activeUsers / totalUsers) * 100) : 0;

    // Prepare response
    const analytics = {
      timeRange,
      period: {
        start: startDate.toISOString(),
        end: now.toISOString()
      },
      overview: {
        totalUsers,
        newUsers,
        activeUsers,
        activationRate,
        emailVerifiedUsers,
        verificationRate,
        averageLoginsPerUser: loginActivity[0]?.averageLogins || 0,
        totalLogins: loginActivity[0]?.totalLogins || 0
      },
      distribution: {
        roles: roleDistribution.map(item => ({
          role: item._id || 'Unknown',
          count: item.count,
          percentage: Math.round((item.count / totalUsers) * 100)
        })),
        industries: industryDistribution.map(item => ({
          industry: item._id || 'Unknown',
          count: item.count,
          percentage: Math.round((item.count / totalUsers) * 100)
        })),
        statuses: statusDistribution.map(item => ({
          status: item._id || 'Unknown',
          count: item.count,
          percentage: Math.round((item.count / totalUsers) * 100)
        }))
      },
      sessions: {
        total: sessionStats[0]?.totalSessions || 0,
        active: sessionStats[0]?.activeSessions || 0,
        activePercentage: sessionStats[0]?.totalSessions > 0 ? 
          Math.round((sessionStats[0].activeSessions / sessionStats[0].totalSessions) * 100) : 0
      },
      topUsers: topUsers.map(user => ({
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        loginCount: user.loginCount,
        lastLogin: user.lastLoginAt
      })),
      recentActivity: recentUsers.map(user => ({
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        industry: user.industryType,
        joinedAt: user.createdAt
      })),
      trends: includeCharts ? {
        growth: growthData.map(item => ({
          date: aggregationUnit === 'hour' ? 
            `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')} ${String(item._id.hour).padStart(2, '0')}:00` :
            `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
          registrations: item.count
        }))
      } : null,
      generatedAt: now.toISOString(),
      generatedBy: session.user.email
    };

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Error generating analytics:', error);
    return NextResponse.json({ error: 'Failed to generate analytics' }, { status: 500 });
  }
}
