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
  
  const adminRoles = [UserRole.GOD_MODE, UserRole.ADMIN];
  return adminRoles.includes(session.user.role);
}

// Convert data to CSV format
function convertToCSV(data: any[], headers: string[]): string {
  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

// GET /api/admin/export - Export data in various formats
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !await checkAdminAccess(session)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'users';
    const format = searchParams.get('format') || 'json';
    const includeMetrics = searchParams.get('metrics') === 'true';

    const db = await connectToDatabase();

    let data: any[] = [];
    let filename = '';
    let headers: string[] = [];

    switch (type) {
      case 'users':
        const usersCollection = db.collection('av_users');
        const users = await usersCollection.find({}).toArray();
        
        data = users.map(user => ({
          id: user._id?.toString(),
          email: user.email,
          name: user.name,
          role: user.role || 'FREE',
          accountStatus: user.accountStatus || 'ACTIVE',
          industryType: user.industryType || 'OTHER',
          hasAccess: user.hasAccess || false,
          createdAt: user.createdAt?.toISOString(),
          lastLoginAt: user.lastLoginAt?.toISOString(),
          loginCount: user.loginCount || 0,
          emailVerified: user.emailVerified?.toISOString() || null
        }));
        
        headers = ['id', 'email', 'name', 'role', 'accountStatus', 'industryType', 'hasAccess', 'createdAt', 'lastLoginAt', 'loginCount', 'emailVerified'];
        filename = `users_export_${new Date().toISOString().split('T')[0]}`;
        break;

      case 'analytics':
        if (!includeMetrics) {
          return NextResponse.json({ error: 'Analytics export requires metrics=true parameter' }, { status: 400 });
        }
        
        const usersCol = db.collection('av_users');
        
        // User count by role
        const roleStats = await usersCol.aggregate([
          { $group: { _id: '$role', count: { $sum: 1 } } }
        ]).toArray();
        
        // User count by account status
        const statusStats = await usersCol.aggregate([
          { $group: { _id: '$accountStatus', count: { $sum: 1 } } }
        ]).toArray();
        
        // User count by industry
        const industryStats = await usersCol.aggregate([
          { $group: { _id: '$industryType', count: { $sum: 1 } } }
        ]).toArray();
        
        // Monthly user registration trends
        const registrationTrends = await usersCol.aggregate([
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]).toArray();

        data = [
          ...roleStats.map(stat => ({ category: 'Role', type: stat._id || 'Unknown', count: stat.count })),
          ...statusStats.map(stat => ({ category: 'Status', type: stat._id || 'Unknown', count: stat.count })),
          ...industryStats.map(stat => ({ category: 'Industry', type: stat._id || 'Unknown', count: stat.count })),
          ...registrationTrends.map(stat => ({ 
            category: 'Registration', 
            type: `${stat._id.year}-${String(stat._id.month).padStart(2, '0')}`, 
            count: stat.count 
          }))
        ];
        
        headers = ['category', 'type', 'count'];
        filename = `analytics_export_${new Date().toISOString().split('T')[0]}`;
        break;

      case 'system':
        // System information and health metrics
        const systemInfo = {
          timestamp: new Date().toISOString(),
          database: 'MongoDB',
          collections: ['av_users', 'av_accounts', 'av_sessions'],
          totalUsers: await db.collection('av_users').countDocuments(),
          totalAccounts: await db.collection('av_accounts').countDocuments(),
          activeSessions: await db.collection('av_sessions').countDocuments(),
          exportedBy: session.user.email,
          exportType: 'system_health'
        };

        data = [systemInfo];
        headers = Object.keys(systemInfo);
        filename = `system_export_${new Date().toISOString().split('T')[0]}`;
        break;

      default:
        return NextResponse.json({ error: 'Invalid export type' }, { status: 400 });
    }

    // Return data in requested format
    if (format === 'csv') {
      const csvContent = convertToCSV(data, headers);
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}.csv"`
        }
      });
    } else {
      // Default to JSON
      return NextResponse.json({
        type,
        format,
        exportedAt: new Date().toISOString(),
        recordCount: data.length,
        exportedBy: session.user.email,
        data
      }, {
        headers: {
          'Content-Disposition': `attachment; filename="${filename}.json"`
        }
      });
    }

  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
