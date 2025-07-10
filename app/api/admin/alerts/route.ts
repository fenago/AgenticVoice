import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth-config';
import { MongoClient } from 'mongodb';
import { UserRole } from '@/types/auth';

const MONGODB_URI = process.env.MONGODB_URI!;
const SERPER_API_KEY = process.env.SERPER_API_KEY!;

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

// Generate real-time system alerts
async function generateSystemAlerts(db: any) {
  const alerts = [];
  const now = new Date();
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  try {
    // Database health checks
    const usersCollection = db.collection('av_users');
    const accountsCollection = db.collection('av_accounts');
    const sessionsCollection = db.collection('av_sessions');

    // Check for new user registrations
    const newUsersToday = await usersCollection.countDocuments({
      createdAt: { $gte: last24Hours }
    });

    if (newUsersToday > 0) {
      alerts.push({
        id: `new-users-${Date.now()}`,
        type: 'success',
        title: 'New User Registrations',
        message: `${newUsersToday} new users registered in the last 24 hours`,
        timestamp: now.toISOString(),
        severity: 'info',
        action: 'View new users',
        actionUrl: '/admin?tab=users&filter=recent'
      });
    }

    // Check for inactive users
    const totalUsers = await usersCollection.countDocuments();
    const activeUsers = await usersCollection.countDocuments({
      lastLoginAt: { $gte: lastWeek }
    });

    if (totalUsers > 0) {
      const inactivePercent = Math.round(((totalUsers - activeUsers) / totalUsers) * 100);
      
      if (inactivePercent > 70) {
        alerts.push({
          id: `inactive-users-${Date.now()}`,
          type: 'warning',
          title: 'High Inactive User Rate',
          message: `${inactivePercent}% of users haven't logged in this week (${totalUsers - activeUsers}/${totalUsers})`,
          timestamp: now.toISOString(),
          severity: 'medium',
          action: 'Review user engagement',
          actionUrl: '/admin?tab=analytics'
        });
      }
    }

    // Check for role distribution
    const godModeUsers = await usersCollection.countDocuments({ role: 'GOD_MODE' });
    const adminUsers = await usersCollection.countDocuments({ role: 'ADMIN' });

    alerts.push({
      id: `admin-count-${Date.now()}`,
      type: 'info',
      title: 'Admin Role Summary',
      message: `Current admin users: ${godModeUsers} GOD_MODE, ${adminUsers} ADMIN`,
      timestamp: now.toISOString(),
      severity: 'info',
      action: 'Review admin roles',
      actionUrl: '/admin?tab=roles'
    });

    // System performance alerts
    const totalSessions = await sessionsCollection.countDocuments();
    const activeSessions = await sessionsCollection.countDocuments({
      expires: { $gt: now }
    });

    alerts.push({
      id: `sessions-${Date.now()}`,
      type: 'info',
      title: 'Session Activity',
      message: `${activeSessions} active sessions out of ${totalSessions} total`,
      timestamp: now.toISOString(),
      severity: 'info',
      action: 'View session details',
      actionUrl: '/admin?tab=analytics'
    });

    // Database health check
    alerts.push({
      id: `db-health-${Date.now()}`,
      type: 'success',
      title: 'Database Status',
      message: 'MongoDB connection healthy and responsive',
      timestamp: now.toISOString(),
      severity: 'info',
      action: 'View database stats',
      actionUrl: '/admin?tab=system'
    });

  } catch (error) {
    alerts.push({
      id: `system-error-${Date.now()}`,
      type: 'error',
      title: 'System Error',
      message: 'Error accessing database. Please check system status.',
      timestamp: now.toISOString(),
      severity: 'critical',
      action: 'Check system logs',
      actionUrl: '/admin?tab=logs'
    });
  }

  return alerts;
}

// Generate competitive intelligence alerts using SerperAPI
async function generateCompetitiveAlerts() {
  const alerts = [];
  
  try {
    // Search for AI voice assistant news
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: 'AI voice assistants market news 2024',
        type: 'news',
        gl: 'us',
        hl: 'en',
        num: 3
      })
    });

    if (response.ok) {
      const data = await response.json();
      
      if (data.news && data.news.length > 0) {
        alerts.push({
          id: `industry-news-${Date.now()}`,
          type: 'info',
          title: 'Industry Intelligence',
          message: `Latest AI voice assistant market news available (${data.news.length} articles)`,
          timestamp: new Date().toISOString(),
          severity: 'info',
          action: 'View market insights',
          actionUrl: '/admin?tab=insights',
          metadata: {
            articles: data.news.slice(0, 2).map((article: any) => ({
              title: article.title,
              source: article.source,
              link: article.link
            }))
          }
        });
      }
    }
  } catch (error) {
    console.error('Error fetching competitive alerts:', error);
    alerts.push({
      id: `competitive-error-${Date.now()}`,
      type: 'warning',
      title: 'Competitive Intelligence Unavailable',
      message: 'Unable to fetch market intelligence data',
      timestamp: new Date().toISOString(),
      severity: 'low',
      action: 'Retry market research',
      actionUrl: '/admin?tab=insights'
    });
  }

  return alerts;
}

// GET /api/admin/alerts - Get all system alerts
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !await checkAdminAccess(session)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const includeCompetitive = searchParams.get('competitive') === 'true';

    const db = await connectToDatabase();
    
    // Generate system alerts
    const systemAlerts = await generateSystemAlerts(db);
    
    // Generate competitive alerts if requested
    let competitiveAlerts: any[] = [];
    if (includeCompetitive) {
      competitiveAlerts = await generateCompetitiveAlerts();
    }

    const allAlerts = [...systemAlerts, ...competitiveAlerts];
    
    // Sort by severity and timestamp
    const severityOrder = { critical: 4, high: 3, medium: 2, info: 1, low: 0 };
    allAlerts.sort((a, b) => {
      const severityDiff = (severityOrder[b.severity as keyof typeof severityOrder] || 0) - 
                          (severityOrder[a.severity as keyof typeof severityOrder] || 0);
      if (severityDiff !== 0) return severityDiff;
      
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return NextResponse.json({
      alerts: allAlerts,
      summary: {
        total: allAlerts.length,
        critical: allAlerts.filter(a => a.severity === 'critical').length,
        high: allAlerts.filter(a => a.severity === 'high').length,
        medium: allAlerts.filter(a => a.severity === 'medium').length,
        info: allAlerts.filter(a => a.severity === 'info').length,
        low: allAlerts.filter(a => a.severity === 'low').length
      },
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Alerts fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' }, 
      { status: 500 }
    );
  }
}

// POST /api/admin/alerts - Acknowledge alerts
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !await checkAdminAccess(session)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { alertIds, action } = await request.json();
    
    if (!alertIds || !Array.isArray(alertIds)) {
      return NextResponse.json({ error: 'Invalid alert IDs' }, { status: 400 });
    }

    const db = await connectToDatabase();
    
    // Create acknowledgment record
    const acknowledgment = {
      alertIds,
      action: action || 'acknowledged',
      acknowledgedBy: session.user.email,
      acknowledgedAt: new Date(),
      status: 'acknowledged'
    };

    await db.collection('av_audit_logs').insertOne({
      action: 'alert_acknowledged',
      performedBy: session.user.email,
      details: acknowledgment,
      timestamp: new Date(),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
    });

    return NextResponse.json({ 
      success: true, 
      message: `${alertIds.length} alert(s) acknowledged`,
      acknowledgedBy: session.user.email,
      acknowledgedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Alert acknowledgment error:', error);
    return NextResponse.json(
      { error: 'Failed to acknowledge alerts' }, 
      { status: 500 }
    );
  }
}
