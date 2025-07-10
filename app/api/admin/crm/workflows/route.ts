import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth-config';

// Define interfaces for type safety
interface WorkflowProperty {
  name: string;
  value: string;
}

interface WorkflowTriggerConditionProperty {
  property: string;
  operator: string;
  value: string;
}

interface WorkflowTriggerConditions {
  properties?: WorkflowTriggerConditionProperty[];
  formId?: string;
  dealStage?: string;
}

interface WorkflowAction {
  id: string;
  type: string;
  delay?: number;
  subject?: string;
  template?: string;
  content?: string;
  score?: number;
  assignedTo?: string;
  reason?: string;
  description?: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Inactive' | 'Draft';
  type: string;
  triggerType: string;
  triggerConditions: WorkflowTriggerConditions;
  actions: WorkflowAction[];
  created?: string; // Optional as it's not in all mock objects
  lastModified?: string; // Optional
  updatedAt?: string; // Optional
  properties?: WorkflowProperty[]; // Optional
  analytics?: any; // Optional for summary stats
}

// Mock workflow data - replace with HubSpot API integration
const mockWorkflows: Workflow[] = [
  {
    id: '1',
    name: 'New Lead Nurturing',
    description: 'Nurture new leads with educational content over 7 days',
    status: 'Active',
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
      emailClickRate: 12.3
    },
    created: '2024-01-15T10:00:00Z',
    
  },
  {
    id: '2',
    name: 'Demo Request Follow-up',
    description: 'Follow up with contacts who requested a demo',
    status: 'Active',
    type: 'sales_sequence',
    triggerType: 'form_submission',
    triggerConditions: {
      formId: 'demo_request_form',
      properties: []
    },
    actions: [
      {
        id: 'task_1',
        type: 'create_task',
        delay: 0,
        assignedTo: 'sales_team',
        subject: 'Schedule demo call',
        description: 'Contact requested demo - schedule within 24 hours'
      },
      {
        id: 'email_1',
        type: 'email',
        delay: 3600000, // 1 hour
        subject: 'Demo Confirmation',
        template: 'demo_confirmation',
        content: 'Demo scheduling confirmation email'
      },
      {
        id: 'email_2',
        type: 'email',
        delay: 172800000, // 2 days
        subject: 'Demo Preparation Materials',
        template: 'demo_prep',
        content: 'Pre-demo materials and agenda'
      }
    ],
    analytics: {
      enrolled: 89,
      completed: 67,
      conversionRate: 75.3,
      emailOpenRate: 82.1,
      emailClickRate: 28.7
    },
    created: '2024-01-10T14:20:00Z',
    
  },
  {
    id: '3',
    name: 'Customer Onboarding',
    description: 'Welcome and onboard new customers',
    status: 'Active',
    type: 'customer_onboarding',
    triggerType: 'deal_closed_won',
    triggerConditions: {
      dealStage: 'closedwon',
      properties: []
    },
    actions: [
      {
        id: 'email_1',
        type: 'email',
        delay: 0,
        subject: 'Welcome to AgenticVoice - Let\'s Get Started!',
        template: 'customer_welcome',
        content: 'Customer welcome and onboarding kickoff'
      },
      {
        id: 'task_1',
        type: 'create_task',
        delay: 86400000, // 1 day
        assignedTo: 'customer_success',
        subject: 'Schedule onboarding call',
        description: 'Schedule customer onboarding session'
      },
      {
        id: 'email_2',
        type: 'email',
        delay: 604800000, // 1 week
        subject: 'How are you getting on?',
        template: 'check_in',
        content: 'Check-in email with helpful resources'
      }
    ],
    analytics: {
      enrolled: 45,
      completed: 38,
      conversionRate: 84.4,
      emailOpenRate: 91.1,
      emailClickRate: 34.2
    },
    created: '2024-01-05T11:30:00Z',
    
  }
];

const workflowTemplates = [
  {
    id: 'lead_nurturing_basic',
    name: 'Basic Lead Nurturing',
    description: '5-email sequence to nurture new leads over 2 weeks',
    category: 'lead_nurturing',
    triggerType: 'contact_created',
    estimatedTime: '14 days',
    actions: [
      { type: 'email', delay: 0, subject: 'Welcome!', content: 'Welcome email' },
      { type: 'email', delay: 86400000, subject: 'Getting Started', content: 'Getting started guide' },
      { type: 'email', delay: 259200000, subject: 'Tips & Tricks', content: 'Best practices' },
      { type: 'email', delay: 604800000, subject: 'Case Study', content: 'Success story' },
      { type: 'email', delay: 1209600000, subject: 'Ready to Upgrade?', content: 'Upgrade CTA' }
    ]
  },
  {
    id: 'demo_follow_up',
    name: 'Demo Follow-up Sequence',
    description: 'Automated follow-up for demo requests and completions',
    category: 'sales_sequence',
    triggerType: 'form_submission',
    estimatedTime: '7 days',
    actions: [
      { type: 'create_task', delay: 0, subject: 'Schedule demo' },
      { type: 'email', delay: 3600000, subject: 'Demo confirmation' },
      { type: 'email', delay: 172800000, subject: 'Demo prep materials' },
      { type: 'email', delay: 432000000, subject: 'Follow-up after demo' }
    ]
  },
  {
    id: 'abandoned_cart',
    name: 'Abandoned Cart Recovery',
    description: 'Win back customers who abandoned their cart',
    category: 'e_commerce',
    triggerType: 'property_change',
    estimatedTime: '3 days',
    actions: [
      { type: 'email', delay: 3600000, subject: 'You left something behind' },
      { type: 'email', delay: 86400000, subject: 'Still thinking it over?' },
      { type: 'email', delay: 259200000, subject: 'Last chance - 10% off' }
    ]
  },
  {
    id: 'customer_onboarding',
    name: 'Customer Onboarding',
    description: 'Welcome new customers and ensure successful adoption',
    category: 'customer_success',
    triggerType: 'deal_closed_won',
    estimatedTime: '30 days',
    actions: [
      { type: 'email', delay: 0, subject: 'Welcome to the family!' },
      { type: 'create_task', delay: 86400000, subject: 'Schedule onboarding call' },
      { type: 'email', delay: 604800000, subject: 'Getting started checklist' },
      { type: 'email', delay: 1209600000, subject: 'Advanced features guide' },
      { type: 'email', delay: 2592000000, subject: 'How are you getting on?' }
    ]
  },
  {
    id: 'win_back_inactive',
    name: 'Win Back Inactive Users',
    description: 'Re-engage users who haven\'t been active recently',
    category: 'retention',
    triggerType: 'property_change',
    estimatedTime: '10 days',
    actions: [
      { type: 'email', delay: 0, subject: 'We miss you!' },
      { type: 'email', delay: 259200000, subject: 'What\'s new since you\'ve been away' },
      { type: 'email', delay: 604800000, subject: 'Special offer just for you' }
    ]
  },
  {
    id: 'referral_program',
    name: 'Referral Program',
    description: 'Encourage happy customers to refer friends',
    category: 'growth',
    triggerType: 'contact_property_change',
    estimatedTime: '14 days',
    actions: [
      { type: 'email', delay: 0, subject: 'Love us? Share the love!' },
      { type: 'email', delay: 604800000, subject: 'Referral reminder + bonus' },
      { type: 'lead_scoring', delay: 1209600000, score: 20, reason: 'Referral program participant' }
    ]
  }
];

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
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const templates = searchParams.get('templates');

    // Return templates if requested
    if (templates === 'true') {
      const category = searchParams.get('category');
      let filteredTemplates = workflowTemplates;
      
      if (category) {
        filteredTemplates = workflowTemplates.filter((template: any) => 
          template.category === category
        );
      }

      return NextResponse.json({
        success: true,
        templates: filteredTemplates
      });
    }

    // Filter workflows
    let filteredWorkflows = mockWorkflows;
    
    if (type) {
      filteredWorkflows = filteredWorkflows.filter((workflow: any) => workflow.type === type);
    }
    
    if (status) {
      filteredWorkflows = filteredWorkflows.filter((workflow: any) => workflow.status === status);
    }

    // Calculate summary stats
    const totalWorkflows = filteredWorkflows.length;
    const activeWorkflows = filteredWorkflows.filter((w: any) => w.status === 'active').length;
    const totalEnrolled = filteredWorkflows.reduce((sum: number, w: any) => sum + w.analytics.enrolled, 0);
    const avgConversionRate = filteredWorkflows.reduce((sum: number, w: any) => sum + w.analytics.conversionRate, 0) / totalWorkflows;

    return NextResponse.json({
      success: true,
      workflows: filteredWorkflows,
      summary: {
        totalWorkflows,
        activeWorkflows,
        totalEnrolled,
        avgConversionRate: Math.round(avgConversionRate * 10) / 10
      }
    });

  } catch (error) {
    console.error('Error fetching workflows:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch workflows' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user role - only ADMIN and GOD_MODE can create workflows
    const userRole = (session.user as any).role;
    if (!['ADMIN', 'GOD_MODE'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, type, triggerType, triggerConditions, actions, templateId } = body;

    // Validate required fields
    if (!name || !type || !triggerType) {
      return NextResponse.json(
        { success: false, error: 'Name, type, and trigger type are required' },
        { status: 400 }
      );
    }

    // If using template, merge template data
    let workflowData = {
      name,
      description: description || '',
      type,
      triggerType,
      triggerConditions: triggerConditions || {},
      actions: actions || []
    };

    if (templateId) {
      const template = workflowTemplates.find(t => t.id === templateId);
      if (template) {
        workflowData = {
          ...workflowData,
          description: workflowData.description || template.description,
          actions: template.actions
        };
      }
    }

    // In a real implementation, create workflow via HubSpot API
    // For now, return mock success response
    const newWorkflow = {
      id: Date.now().toString(),
      ...workflowData,
      status: 'draft',
      analytics: {
        enrolled: 0,
        completed: 0,
        conversionRate: 0,
        emailOpenRate: 0,
        emailClickRate: 0
      },
      created: new Date().toISOString(),
      
    };

    return NextResponse.json({
      success: true,
      workflow: newWorkflow,
      message: 'Workflow created successfully'
    });

  } catch (error) {
    console.error('Error creating workflow:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create workflow' },
      { status: 500 }
    );
  }
}
