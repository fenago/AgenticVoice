import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth-config';

interface PipelineTemplate {
  id: string;
  name: string;
  industry: string;
  description: string;
  type: 'deals' | 'tickets';
  stages: Array<{
    name: string;
    probability: number;
    requirements: string[];
    order: number;
    color: string;
    closedWon: boolean;
    closedLost: boolean;
  }>;
}

// Pre-built pipeline templates for different industries
const pipelineTemplates: PipelineTemplate[] = [
  {
    id: 'template_saas',
    name: 'SaaS Sales Pipeline',
    industry: 'Software as a Service',
    type: 'deals',
    description: 'Optimized for SaaS companies with trial-to-paid conversion focus',
    stages: [
      {
        name: 'Lead Captured',
        probability: 5,
        requirements: ['Contact information collected', 'Source tracked'],
        order: 1,
        color: '#f3f4f6',
        closedWon: false,
        closedLost: false
      },
      {
        name: 'Trial Started',
        probability: 15,
        requirements: ['Free trial activated', 'Onboarding email sent'],
        order: 2,
        color: '#dbeafe',
        closedWon: false,
        closedLost: false
      },
      {
        name: 'Product Demo',
        probability: 30,
        requirements: ['Demo scheduled', 'Use case identified'],
        order: 3,
        color: '#e0e7ff',
        closedWon: false,
        closedLost: false
      },
      {
        name: 'Trial Engagement',
        probability: 45,
        requirements: ['Active usage tracked', 'Value demonstrated'],
        order: 4,
        color: '#fef3c7',
        closedWon: false,
        closedLost: false
      },
      {
        name: 'Pricing Discussion',
        probability: 65,
        requirements: ['Budget confirmed', 'Pricing presented'],
        order: 5,
        color: '#fed7aa',
        closedWon: false,
        closedLost: false
      },
      {
        name: 'Contract Negotiation',
        probability: 80,
        requirements: ['Terms agreed', 'Contract drafted'],
        order: 6,
        color: '#fde68a',
        closedWon: false,
        closedLost: false
      },
      {
        name: 'Closed Won',
        probability: 100,
        requirements: ['Payment processed', 'Account activated'],
        order: 7,
        color: '#dcfce7',
        closedWon: true,
        closedLost: false
      },
      {
        name: 'Closed Lost',
        probability: 0,
        requirements: ['Loss reason documented', 'Nurture sequence started'],
        order: 8,
        color: '#fee2e2',
        closedWon: false,
        closedLost: true
      }
    ]
  },
  {
    id: 'template_ecommerce',
    name: 'E-commerce Sales',
    industry: 'E-commerce',
    type: 'deals',
    description: 'Designed for online retail and e-commerce businesses',
    stages: [
      {
        name: 'Website Visitor',
        probability: 2,
        requirements: ['Visitor tracked', 'Behavior analyzed'],
        order: 1,
        color: '#f3f4f6',
        closedWon: false,
        closedLost: false
      },
      {
        name: 'Cart Addition',
        probability: 10,
        requirements: ['Product added to cart', 'Intent captured'],
        order: 2,
        color: '#dbeafe',
        closedWon: false,
        closedLost: false
      },
      {
        name: 'Checkout Started',
        probability: 25,
        requirements: ['Checkout process initiated', 'Contact information provided'],
        order: 3,
        color: '#e0e7ff',
        closedWon: false,
        closedLost: false
      },
      {
        name: 'Payment Processing',
        probability: 85,
        requirements: ['Payment method entered', 'Order details confirmed'],
        order: 4,
        color: '#fde68a',
        closedWon: false,
        closedLost: false
      },
      {
        name: 'Order Completed',
        probability: 100,
        requirements: ['Payment successful', 'Order confirmation sent'],
        order: 5,
        color: '#dcfce7',
        closedWon: true,
        closedLost: false
      },
      {
        name: 'Cart Abandoned',
        probability: 0,
        requirements: ['Abandonment reason tracked', 'Recovery email sent'],
        order: 6,
        color: '#fee2e2',
        closedWon: false,
        closedLost: true
      }
    ]
  },
  {
    id: 'template_consulting',
    name: 'Consulting Services',
    industry: 'Professional Services',
    type: 'deals',
    description: 'Tailored for consulting and professional service providers',
    stages: [
      {
        name: 'Initial Inquiry',
        probability: 10,
        requirements: ['Inquiry received', 'Needs assessment scheduled'],
        order: 1,
        color: '#f3f4f6',
        closedWon: false,
        closedLost: false
      },
      {
        name: 'Discovery Meeting',
        probability: 25,
        requirements: ['Requirements gathered', 'Scope defined'],
        order: 2,
        color: '#dbeafe',
        closedWon: false,
        closedLost: false
      },
      {
        name: 'Proposal Development',
        probability: 40,
        requirements: ['Proposal created', 'Timeline established'],
        order: 3,
        color: '#e0e7ff',
        closedWon: false,
        closedLost: false
      },
      {
        name: 'Proposal Presented',
        probability: 55,
        requirements: ['Proposal delivered', 'Questions addressed'],
        order: 4,
        color: '#fef3c7',
        closedWon: false,
        closedLost: false
      },
      {
        name: 'Contract Negotiation',
        probability: 75,
        requirements: ['Terms discussed', 'SOW finalized'],
        order: 5,
        color: '#fed7aa',
        closedWon: false,
        closedLost: false
      },
      {
        name: 'Project Kickoff',
        probability: 100,
        requirements: ['Contract signed', 'Project team assigned'],
        order: 6,
        color: '#dcfce7',
        closedWon: true,
        closedLost: false
      },
      {
        name: 'Not Qualified',
        probability: 0,
        requirements: ['Qualification criteria not met'],
        order: 7,
        color: '#fee2e2',
        closedWon: false,
        closedLost: true
      }
    ]
  },
  {
    id: 'template_real_estate',
    name: 'Real Estate Sales',
    industry: 'Real Estate',
    type: 'deals',
    description: 'Designed for real estate agents and property sales',
    stages: [
      {
        name: 'Lead Generation',
        probability: 5,
        requirements: ['Interest expressed', 'Budget range identified'],
        order: 1,
        color: '#f3f4f6',
        closedWon: false,
        closedLost: false
      },
      {
        name: 'Property Viewing',
        probability: 20,
        requirements: ['Viewing scheduled', 'Property preferences noted'],
        order: 2,
        color: '#dbeafe',
        closedWon: false,
        closedLost: false
      },
      {
        name: 'Offer Preparation',
        probability: 45,
        requirements: ['Financing pre-approved', 'Offer strategy discussed'],
        order: 3,
        color: '#fef3c7',
        closedWon: false,
        closedLost: false
      },
      {
        name: 'Offer Submitted',
        probability: 60,
        requirements: ['Offer submitted', 'Negotiation initiated'],
        order: 4,
        color: '#fed7aa',
        closedWon: false,
        closedLost: false
      },
      {
        name: 'Under Contract',
        probability: 80,
        requirements: ['Offer accepted', 'Inspections scheduled'],
        order: 5,
        color: '#fde68a',
        closedWon: false,
        closedLost: false
      },
      {
        name: 'Closing',
        probability: 100,
        requirements: ['Final walkthrough completed', 'Documents signed'],
        order: 6,
        color: '#dcfce7',
        closedWon: true,
        closedLost: false
      },
      {
        name: 'Deal Fell Through',
        probability: 0,
        requirements: ['Issue documented', 'Future opportunities noted'],
        order: 7,
        color: '#fee2e2',
        closedWon: false,
        closedLost: true
      }
    ]
  },
  {
    id: 'template_support_standard',
    name: 'Standard Support Workflow',
    industry: 'Customer Support',
    type: 'tickets',
    description: 'General customer support ticket workflow',
    stages: [
      {
        name: 'New Ticket',
        probability: 0,
        requirements: ['Ticket created', 'Priority assigned'],
        order: 1,
        color: '#f3f4f6',
        closedWon: false,
        closedLost: false
      },
      {
        name: 'Triaged',
        probability: 20,
        requirements: ['Issue categorized', 'Agent assigned'],
        order: 2,
        color: '#dbeafe',
        closedWon: false,
        closedLost: false
      },
      {
        name: 'In Progress',
        probability: 50,
        requirements: ['Work initiated', 'Customer notified'],
        order: 3,
        color: '#fef3c7',
        closedWon: false,
        closedLost: false
      },
      {
        name: 'Pending Customer',
        probability: 60,
        requirements: ['Response requested', 'Follow-up scheduled'],
        order: 4,
        color: '#fed7aa',
        closedWon: false,
        closedLost: false
      },
      {
        name: 'Resolved',
        probability: 90,
        requirements: ['Solution provided', 'Customer confirmation pending'],
        order: 5,
        color: '#d1fae5',
        closedWon: false,
        closedLost: false
      },
      {
        name: 'Closed',
        probability: 100,
        requirements: ['Issue resolved', 'Customer satisfied'],
        order: 6,
        color: '#dcfce7',
        closedWon: true,
        closedLost: false
      }
    ]
  },
  {
    id: 'template_support_technical',
    name: 'Technical Support Pipeline',
    industry: 'Technical Support',
    type: 'tickets',
    description: 'Advanced technical support workflow with escalation paths',
    stages: [
      {
        name: 'Ticket Received',
        probability: 0,
        requirements: ['Issue logged', 'Severity assessed'],
        order: 1,
        color: '#f3f4f6',
        closedWon: false,
        closedLost: false
      },
      {
        name: 'Level 1 Support',
        probability: 30,
        requirements: ['Initial troubleshooting', 'Basic resolution attempted'],
        order: 2,
        color: '#dbeafe',
        closedWon: false,
        closedLost: false
      },
      {
        name: 'Level 2 Escalation',
        probability: 45,
        requirements: ['Advanced technical review', 'Specialist assigned'],
        order: 3,
        color: '#e0e7ff',
        closedWon: false,
        closedLost: false
      },
      {
        name: 'Development Review',
        probability: 60,
        requirements: ['Engineering team consulted', 'Code review initiated'],
        order: 4,
        color: '#fef3c7',
        closedWon: false,
        closedLost: false
      },
      {
        name: 'Solution Testing',
        probability: 80,
        requirements: ['Fix implemented', 'Testing in progress'],
        order: 5,
        color: '#fed7aa',
        closedWon: false,
        closedLost: false
      },
      {
        name: 'Customer Validation',
        probability: 90,
        requirements: ['Solution deployed', 'Customer testing'],
        order: 6,
        color: '#d1fae5',
        closedWon: false,
        closedLost: false
      },
      {
        name: 'Resolved',
        probability: 100,
        requirements: ['Issue fixed', 'Documentation updated'],
        order: 7,
        color: '#dcfce7',
        closedWon: true,
        closedLost: false
      }
    ]
  }
];

// GET - Fetch pipeline templates
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
    const industry = url.searchParams.get('industry');

    let filteredTemplates = pipelineTemplates;

    if (type && ['deals', 'tickets'].includes(type)) {
      filteredTemplates = filteredTemplates.filter((t: any) => t.type === type);
    }

    if (industry) {
      filteredTemplates = filteredTemplates.filter((t: any) => 
        t.industry.toLowerCase().includes(industry.toLowerCase())
      );
    }

    console.log(`📋 Fetched ${filteredTemplates.length} pipeline templates`);

    return NextResponse.json({
      success: true,
      templates: filteredTemplates,
      total: filteredTemplates.length
    });

  } catch (error) {
    console.error('Error fetching pipeline templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}
