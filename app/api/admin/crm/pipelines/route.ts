import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth-config';

// Types for pipeline management
interface PipelineStage {
  id: string;
  name: string;
  probability: number;
  requirements: string[];
  order: number;
  color: string;
  closedWon: boolean;
  closedLost: boolean;
}

interface Pipeline {
  id: string;
  name: string;
  type: 'deals' | 'tickets';
  description: string;
  stages: PipelineStage[];
  isDefault: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  analytics: {
    totalDeals: number;
    conversionRate: number;
    averageDealSize: number;
    averageCycleTime: number;
  };
}

// Mock data for pipelines
const mockPipelines: Pipeline[] = [
  {
    id: 'pipeline_1',
    name: 'Standard Sales Pipeline',
    type: 'deals',
    description: 'Default sales process for inbound leads and opportunities',
    isDefault: true,
    active: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-12-01T10:00:00Z',
    stages: [
      {
        id: 'stage_1',
        name: 'Lead Qualified',
        probability: 10,
        requirements: ['Contact information verified', 'Budget confirmed'],
        order: 1,
        color: '#f3f4f6',
        closedWon: false,
        closedLost: false
      },
      {
        id: 'stage_2',
        name: 'Discovery Call',
        probability: 25,
        requirements: ['Initial discovery completed', 'Pain points identified'],
        order: 2,
        color: '#dbeafe',
        closedWon: false,
        closedLost: false
      },
      {
        id: 'stage_3',
        name: 'Proposal Sent',
        probability: 50,
        requirements: ['Proposal delivered', 'Timeline discussed'],
        order: 3,
        color: '#fef3c7',
        closedWon: false,
        closedLost: false
      },
      {
        id: 'stage_4',
        name: 'Negotiation',
        probability: 75,
        requirements: ['Terms negotiated', 'Decision maker engaged'],
        order: 4,
        color: '#fed7aa',
        closedWon: false,
        closedLost: false
      },
      {
        id: 'stage_5',
        name: 'Closed Won',
        probability: 100,
        requirements: ['Contract signed', 'Payment received'],
        order: 5,
        color: '#dcfce7',
        closedWon: true,
        closedLost: false
      },
      {
        id: 'stage_6',
        name: 'Closed Lost',
        probability: 0,
        requirements: ['Reason documented'],
        order: 6,
        color: '#fee2e2',
        closedWon: false,
        closedLost: true
      }
    ],
    analytics: {
      totalDeals: 245,
      conversionRate: 32,
      averageDealSize: 12500,
      averageCycleTime: 45
    }
  },
  {
    id: 'pipeline_2',
    name: 'Enterprise Sales',
    type: 'deals',
    description: 'Complex sales process for enterprise clients',
    isDefault: false,
    active: true,
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-12-01T10:00:00Z',
    stages: [
      {
        id: 'stage_e1',
        name: 'Initial Contact',
        probability: 5,
        requirements: ['Stakeholder identified', 'Initial meeting scheduled'],
        order: 1,
        color: '#f3f4f6',
        closedWon: false,
        closedLost: false
      },
      {
        id: 'stage_e2',
        name: 'Needs Assessment',
        probability: 15,
        requirements: ['Requirements gathering completed', 'Technical assessment done'],
        order: 2,
        color: '#dbeafe',
        closedWon: false,
        closedLost: false
      },
      {
        id: 'stage_e3',
        name: 'Technical Validation',
        probability: 30,
        requirements: ['POC completed', 'Technical approval received'],
        order: 3,
        color: '#e0e7ff',
        closedWon: false,
        closedLost: false
      },
      {
        id: 'stage_e4',
        name: 'Business Case',
        probability: 45,
        requirements: ['ROI analysis completed', 'Budget approved'],
        order: 4,
        color: '#fef3c7',
        closedWon: false,
        closedLost: false
      },
      {
        id: 'stage_e5',
        name: 'Proposal Review',
        probability: 60,
        requirements: ['Proposal submitted', 'Stakeholder review initiated'],
        order: 5,
        color: '#fed7aa',
        closedWon: false,
        closedLost: false
      },
      {
        id: 'stage_e6',
        name: 'Contract Negotiation',
        probability: 80,
        requirements: ['Legal review completed', 'Terms agreed'],
        order: 6,
        color: '#fde68a',
        closedWon: false,
        closedLost: false
      },
      {
        id: 'stage_e7',
        name: 'Closed Won',
        probability: 100,
        requirements: ['Contract signed', 'Implementation planned'],
        order: 7,
        color: '#dcfce7',
        closedWon: true,
        closedLost: false
      },
      {
        id: 'stage_e8',
        name: 'Closed Lost',
        probability: 0,
        requirements: ['Loss reason documented', 'Follow-up scheduled'],
        order: 8,
        color: '#fee2e2',
        closedWon: false,
        closedLost: true
      }
    ],
    analytics: {
      totalDeals: 87,
      conversionRate: 18,
      averageDealSize: 85000,
      averageCycleTime: 120
    }
  },
  {
    id: 'pipeline_3',
    name: 'Support Tickets',
    type: 'tickets',
    description: 'Customer support workflow for ticket resolution',
    isDefault: true,
    active: true,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-12-01T10:00:00Z',
    stages: [
      {
        id: 'stage_t1',
        name: 'New',
        probability: 0,
        requirements: ['Ticket created', 'Priority assigned'],
        order: 1,
        color: '#f3f4f6',
        closedWon: false,
        closedLost: false
      },
      {
        id: 'stage_t2',
        name: 'Assigned',
        probability: 20,
        requirements: ['Agent assigned', 'Initial response sent'],
        order: 2,
        color: '#dbeafe',
        closedWon: false,
        closedLost: false
      },
      {
        id: 'stage_t3',
        name: 'In Progress',
        probability: 50,
        requirements: ['Work started', 'Customer contacted'],
        order: 3,
        color: '#fef3c7',
        closedWon: false,
        closedLost: false
      },
      {
        id: 'stage_t4',
        name: 'Pending Customer',
        probability: 60,
        requirements: ['Waiting for customer response'],
        order: 4,
        color: '#fed7aa',
        closedWon: false,
        closedLost: false
      },
      {
        id: 'stage_t5',
        name: 'Resolved',
        probability: 90,
        requirements: ['Solution provided', 'Customer confirmation pending'],
        order: 5,
        color: '#d1fae5',
        closedWon: false,
        closedLost: false
      },
      {
        id: 'stage_t6',
        name: 'Closed',
        probability: 100,
        requirements: ['Issue resolved', 'Customer satisfied'],
        order: 6,
        color: '#dcfce7',
        closedWon: true,
        closedLost: false
      }
    ],
    analytics: {
      totalDeals: 1247,
      conversionRate: 94,
      averageDealSize: 0,
      averageCycleTime: 3
    }
  }
];

// GET - Fetch all pipelines
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user?.role;
    if (!['ADMIN', 'GOD_MODE', 'MARKETING'].includes(userRole || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const url = new URL(request.url);
    const type = url.searchParams.get('type');

    let filteredPipelines = mockPipelines;
    
    if (type && ['deals', 'tickets'].includes(type)) {
      filteredPipelines = mockPipelines.filter((p: any) => p.type === type);
    }

    console.log(`📊 Fetched ${filteredPipelines.length} pipelines`);

    return NextResponse.json({
      success: true,
      pipelines: filteredPipelines,
      total: filteredPipelines.length
    });

  } catch (error) {
    console.error('Error fetching pipelines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pipelines' },
      { status: 500 }
    );
  }
}

// POST - Create new pipeline
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user?.role;
    if (!['ADMIN', 'GOD_MODE'].includes(userRole || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { name, type, description, stages } = body;

    // Validate required fields
    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    console.log('🏗️ Creating new pipeline:', { name, type });

    // Create default stages if none provided
    const defaultStages = type === 'deals' ? [
      {
        id: `stage_${Date.now()}_1`,
        name: 'Lead',
        probability: 10,
        requirements: ['Contact information verified'],
        order: 1,
        color: '#f3f4f6',
        closedWon: false,
        closedLost: false
      },
      {
        id: `stage_${Date.now()}_2`,
        name: 'Qualified',
        probability: 25,
        requirements: ['Budget confirmed', 'Need identified'],
        order: 2,
        color: '#dbeafe',
        closedWon: false,
        closedLost: false
      },
      {
        id: `stage_${Date.now()}_3`,
        name: 'Proposal',
        probability: 50,
        requirements: ['Proposal sent'],
        order: 3,
        color: '#fef3c7',
        closedWon: false,
        closedLost: false
      },
      {
        id: `stage_${Date.now()}_4`,
        name: 'Negotiation',
        probability: 75,
        requirements: ['Terms discussed'],
        order: 4,
        color: '#fed7aa',
        closedWon: false,
        closedLost: false
      },
      {
        id: `stage_${Date.now()}_5`,
        name: 'Closed Won',
        probability: 100,
        requirements: ['Deal closed'],
        order: 5,
        color: '#dcfce7',
        closedWon: true,
        closedLost: false
      },
      {
        id: `stage_${Date.now()}_6`,
        name: 'Closed Lost',
        probability: 0,
        requirements: ['Reason documented'],
        order: 6,
        color: '#fee2e2',
        closedWon: false,
        closedLost: true
      }
    ] : [
      {
        id: `stage_${Date.now()}_1`,
        name: 'New',
        probability: 0,
        requirements: ['Ticket created'],
        order: 1,
        color: '#f3f4f6',
        closedWon: false,
        closedLost: false
      },
      {
        id: `stage_${Date.now()}_2`,
        name: 'In Progress',
        probability: 50,
        requirements: ['Work started'],
        order: 2,
        color: '#fef3c7',
        closedWon: false,
        closedLost: false
      },
      {
        id: `stage_${Date.now()}_3`,
        name: 'Resolved',
        probability: 90,
        requirements: ['Solution provided'],
        order: 3,
        color: '#d1fae5',
        closedWon: false,
        closedLost: false
      },
      {
        id: `stage_${Date.now()}_4`,
        name: 'Closed',
        probability: 100,
        requirements: ['Issue resolved'],
        order: 4,
        color: '#dcfce7',
        closedWon: true,
        closedLost: false
      }
    ];

    const newPipeline: Pipeline = {
      id: `pipeline_${Date.now()}`,
      name,
      type,
      description: description || '',
      stages: stages || defaultStages,
      isDefault: false,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      analytics: {
        totalDeals: 0,
        conversionRate: 0,
        averageDealSize: 0,
        averageCycleTime: 0
      }
    };

    console.log('✅ Pipeline created successfully:', newPipeline.id);

    return NextResponse.json({
      success: true,
      pipeline: newPipeline,
      message: 'Pipeline created successfully'
    });

  } catch (error) {
    console.error('Error creating pipeline:', error);
    return NextResponse.json(
      { error: 'Failed to create pipeline' },
      { status: 500 }
    );
  }
}
