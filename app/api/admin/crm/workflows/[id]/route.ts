import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth-config';

// Mock workflow data - in real implementation, fetch from HubSpot API
const mockWorkflows = [
  {
    id: '1',
    name: 'New Lead Nurturing',
    description: 'Nurture new leads with educational content over 7 days',
    status: 'active',
    type: 'lead_nurturing',
    triggerType: 'contact_created',
    triggerConditions: {
      properties: [
        { property: 'lifecyclestage', operator: 'eq', value: 'lead' }
      ]
    },
    actions: [
      {
        id: 'email_1',
        type: 'email',
        delay: 0,
        subject: 'Welcome to AgenticVoice!',
        template: 'welcome_template',
        content: 'Welcome email with getting started guide'
      },
      {
        id: 'email_2',
        type: 'email',
        delay: 86400000, // 1 day
        subject: 'How to Get the Most Out of AgenticVoice',
        template: 'tips_template',
        content: 'Tips and best practices email'
      },
      {
        id: 'score_update',
        type: 'lead_scoring',
        delay: 172800000, // 2 days
        score: 10,
        reason: 'Completed initial email sequence'
      }
    ],
    analytics: {
      enrolled: 156,
      completed: 89,
      conversionRate: 57.1,
      emailOpenRate: 68.5,
      emailClickRate: 12.3,
      enrollmentHistory: [
        { date: '2024-01-15', enrolled: 12, completed: 8 },
        { date: '2024-01-16', enrolled: 15, completed: 9 },
        { date: '2024-01-17', enrolled: 18, completed: 12 },
        { date: '2024-01-18', enrolled: 14, completed: 10 },
        { date: '2024-01-19', enrolled: 16, completed: 11 },
        { date: '2024-01-20', enrolled: 13, completed: 8 },
        { date: '2024-01-21', enrolled: 11, completed: 7 }
      ]
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z'
  }
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const workflowId = params.id;
    
    // In real implementation, fetch from HubSpot API
    const workflow = mockWorkflows.find(w => w.id === workflowId);
    
    if (!workflow) {
      return NextResponse.json(
        { success: false, error: 'Workflow not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      workflow
    });

  } catch (error) {
    console.error('Error fetching workflow:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch workflow' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user role - only ADMIN and GOD_MODE can update workflows
    const userRole = (session.user as any).role;
    if (!['ADMIN', 'GOD_MODE'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const workflowId = params.id;
    const body = await request.json();
    
    // In real implementation, update via HubSpot API
    const workflow = mockWorkflows.find(w => w.id === workflowId);
    
    if (!workflow) {
      return NextResponse.json(
        { success: false, error: 'Workflow not found' },
        { status: 404 }
      );
    }

    // Update workflow properties
    const updatedWorkflow = {
      ...workflow,
      ...body,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      workflow: updatedWorkflow,
      message: 'Workflow updated successfully'
    });

  } catch (error) {
    console.error('Error updating workflow:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update workflow' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user role - only ADMIN and GOD_MODE can delete workflows
    const userRole = (session.user as any).role;
    if (!['ADMIN', 'GOD_MODE'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const workflowId = params.id;
    
    // In real implementation, delete via HubSpot API
    const workflow = mockWorkflows.find(w => w.id === workflowId);
    
    if (!workflow) {
      return NextResponse.json(
        { success: false, error: 'Workflow not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Workflow deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting workflow:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete workflow' },
      { status: 500 }
    );
  }
}
