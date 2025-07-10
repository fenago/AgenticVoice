import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth-config';

// Mock analytics data - replace with real HubSpot API integration
const mockAnalytics = {
  overview: {
    totalWorkflows: 15,
    activeWorkflows: 12,
    totalEnrollments: 2847,
    totalCompletions: 1923,
    avgConversionRate: 67.5,
    avgEmailOpenRate: 74.2,
    avgEmailClickRate: 18.6
  },
  performanceMetrics: [
    {
      date: '2024-01-15',
      enrollments: 89,
      completions: 56,
      conversionRate: 62.9,
      emailsSent: 267,
      emailsOpened: 198,
      emailsClicked: 47
    },
    {
      date: '2024-01-16',
      enrollments: 92,
      completions: 61,
      conversionRate: 66.3,
      emailsSent: 276,
      emailsOpened: 205,
      emailsClicked: 52
    },
    {
      date: '2024-01-17',
      enrollments: 85,
      completions: 58,
      conversionRate: 68.2,
      emailsSent: 255,
      emailsOpened: 189,
      emailsClicked: 48
    },
    {
      date: '2024-01-18',
      enrollments: 94,
      completions: 64,
      conversionRate: 68.1,
      emailsSent: 282,
      emailsOpened: 209,
      emailsClicked: 55
    },
    {
      date: '2024-01-19',
      enrollments: 87,
      completions: 59,
      conversionRate: 67.8,
      emailsSent: 261,
      emailsOpened: 194,
      emailsClicked: 49
    },
    {
      date: '2024-01-20',
      enrollments: 91,
      completions: 62,
      conversionRate: 68.1,
      emailsSent: 273,
      emailsOpened: 203,
      emailsClicked: 51
    },
    {
      date: '2024-01-21',
      enrollments: 88,
      completions: 60,
      conversionRate: 68.2,
      emailsSent: 264,
      emailsOpened: 196,
      emailsClicked: 50
    }
  ],
  topPerformingWorkflows: [
    {
      id: '3',
      name: 'Customer Onboarding',
      enrollments: 45,
      completions: 38,
      conversionRate: 84.4,
      avgEmailOpenRate: 91.1,
      avgEmailClickRate: 34.2
    },
    {
      id: '2',
      name: 'Demo Request Follow-up',
      enrollments: 89,
      completions: 67,
      conversionRate: 75.3,
      avgEmailOpenRate: 82.1,
      avgEmailClickRate: 28.7
    },
    {
      id: '1',
      name: 'New Lead Nurturing',
      enrollments: 156,
      completions: 89,
      conversionRate: 57.1,
      avgEmailOpenRate: 68.5,
      avgEmailClickRate: 12.3
    }
  ],
  workflowsByType: [
    { type: 'lead_nurturing', count: 5, totalEnrollments: 487 },
    { type: 'sales_sequence', count: 4, totalEnrollments: 312 },
    { type: 'customer_onboarding', count: 2, totalEnrollments: 89 },
    { type: 'retention', count: 2, totalEnrollments: 156 },
    { type: 'e_commerce', count: 2, totalEnrollments: 203 }
  ],
  recentActivity: [
    {
      id: '1',
      workflowName: 'New Lead Nurturing',
      contactName: 'John Smith',
      action: 'enrolled',
      timestamp: '2024-01-21T14:30:00Z',
      status: 'active'
    },
    {
      id: '2',
      workflowName: 'Demo Request Follow-up',
      contactName: 'Sarah Johnson',
      action: 'completed',
      timestamp: '2024-01-21T13:45:00Z',
      status: 'completed'
    },
    {
      id: '3',
      workflowName: 'Customer Onboarding',
      contactName: 'Mike Wilson',
      action: 'email_opened',
      timestamp: '2024-01-21T12:20:00Z',
      status: 'active'
    },
    {
      id: '4',
      workflowName: 'New Lead Nurturing',
      contactName: 'Emily Davis',
      action: 'email_clicked',
      timestamp: '2024-01-21T11:10:00Z',
      status: 'active'
    },
    {
      id: '5',
      workflowName: 'Demo Request Follow-up',
      contactName: 'Robert Brown',
      action: 'enrolled',
      timestamp: '2024-01-21T10:05:00Z',
      status: 'active'
    }
  ]
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user role
    const userRole = (session.user as any).role;
    if (!['ADMIN', 'GOD_MODE', 'MARKETING'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';
    const workflowId = searchParams.get('workflowId');

    // If specific workflow analytics requested
    if (workflowId) {
      // In real implementation, fetch specific workflow analytics from HubSpot
      const workflowAnalytics = {
        workflowId,
        metrics: mockAnalytics.performanceMetrics,
        summary: {
          totalEnrollments: 156,
          totalCompletions: 89,
          conversionRate: 57.1,
          avgEmailOpenRate: 68.5,
          avgEmailClickRate: 12.3
        }
      };

      return NextResponse.json({
        success: true,
        analytics: workflowAnalytics
      });
    }

    // Return overall analytics
    return NextResponse.json({
      success: true,
      analytics: mockAnalytics,
      timeRange
    });

  } catch (error) {
    console.error('Error fetching workflow analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch workflow analytics' },
      { status: 500 }
    );
  }
}
