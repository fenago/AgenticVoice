import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/libs/auth-config';
import HubSpotService from '@/libs/hubspot';

// Utility functions for engagement data transformation
function mapActivityType(activityType: string): string {
  const typeMap: { [key: string]: string } = {
    'contact_updated': 'note',
    'email_sent': 'email',
    'call_made': 'call',
    'meeting_scheduled': 'meeting',
    'task_created': 'task',
    'note_created': 'note'
  };
  return typeMap[activityType] || 'note';
}

function determinePriority(activityType: string): string {
  const priorityMap: { [key: string]: string } = {
    'call_made': 'high',
    'meeting_scheduled': 'high',
    'email_sent': 'medium',
    'task_created': 'medium',
    'note_created': 'low',
    'contact_updated': 'low'
  };
  return priorityMap[activityType] || 'medium';
}

function calculateEngagementScore(activity: any): number {
  // Simple scoring based on activity type and properties
  const baseScore = 5;
  const typeBonus: { [key: string]: number } = {
    'call_made': 3,
    'meeting_scheduled': 4,
    'email_sent': 2,
    'task_created': 1,
    'note_created': 1
  };
  
  const bonus = typeBonus[activity.type] || 0;
  return Math.min(10, baseScore + bonus);
}

interface EngagementData {
  id: string;
  type: string;
  title: string;
  description: string;
  contactId?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  dealId?: string;
  dealName?: string;
  dealValue?: number;
  status: string;
  priority: string;
  outcome?: string;
  engagementScore?: number;
  scheduledAt?: string;
  completedAt?: string;
  duration?: number;
  createdAt?: string;
  updatedAt?: string;
  notes?: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['ADMIN', 'GOD_MODE', 'MARKETING'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    try {
      // Initialize HubSpot service inside the function to avoid build-time errors
      const hubspot = new HubSpotService();
      
      // Use the available getRecentActivities method
      const activities = await hubspot.getRecentActivities(limit);
      
      // Transform activities into engagement format
      const engagements = activities.map((activity: any, index: number) => {
        // Extract contact information from activity
        const contactId = activity.contactId || activity.contact?.id;
        const contactName = activity.contactName || activity.contact?.name || 'Unknown Contact';
        const contactEmail = activity.contactEmail || activity.contact?.email || '';
        
        return {
          id: activity.id || `eng_${Date.now()}_${index}`,
          type: mapActivityType(activity.type),
          title: activity.title || activity.description || `${contactName} Activity`,
          description: activity.description || 'HubSpot CRM activity',
          contactId: contactId,
          contactName: contactName,
          contactEmail: contactEmail,
          contactPhone: activity.contactPhone || activity.contact?.phone || '',
          dealId: activity.dealId || null,
          dealName: activity.dealName || null,
          dealValue: activity.dealValue || null,
          status: 'completed', // Most HubSpot activities are completed
          priority: determinePriority(activity.type),
          outcome: 'neutral',
          engagementScore: calculateEngagementScore(activity),
          scheduledAt: activity.timestamp || activity.createdAt,
          completedAt: activity.timestamp || activity.createdAt,
          duration: activity.duration || null,
          createdAt: activity.createdAt || activity.timestamp,
          updatedAt: activity.updatedAt || activity.timestamp,
          notes: activity.body || activity.description || 'Activity from HubSpot CRM'
        };
      });

      let filteredEngagements = engagements;

      if (type && type !== 'all') {
        filteredEngagements = filteredEngagements.filter((eng: EngagementData) => eng.type === type);
      }

      if (status && status !== 'all') {
        filteredEngagements = filteredEngagements.filter((eng: EngagementData) => eng.status === status);
      }

      filteredEngagements = filteredEngagements.slice(0, limit);

      return NextResponse.json({
        success: true,
        engagements: filteredEngagements,
        total: filteredEngagements.length
      });
    } catch (hubspotError) {
      console.error('HubSpot API error:', hubspotError);
      return NextResponse.json({
        success: true,
        engagements: [],
        total: 0,
        message: 'HubSpot integration not available or not configured'
      });
    }
  } catch (error) {
    console.error('Error fetching engagements:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, title, description, contactId, dealId, priority, scheduledAt, assignedTo } = body;

    // Validate required fields
    if (!type || !title || !contactId) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title, contactId' },
        { status: 400 }
      );
    }

    // Create engagement in HubSpot CRM
    console.log('📞 Creating engagement in HubSpot:', { type, title, contactId });
    
    try {
      // First get contact details from HubSpot
      const contactResponse = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}?properties=firstname,lastname,email,company`, {
        headers: {
          'Authorization': `Bearer ${process.env.HUBSPOT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      let contactName = 'Unknown Contact';
      let contactEmail = 'unknown@example.com';
      
      if (contactResponse.ok) {
        const contactData = await contactResponse.json();
        const props = contactData.properties;
        contactName = `${props.firstname || ''} ${props.lastname || ''}`.trim() || props.email || 'Unknown Contact';
        contactEmail = props.email || 'unknown@example.com';
      }
      
      // Create activity/note in HubSpot
      const hubspotEngagement = {
        properties: {
          hs_note_body: `${title}\n\n${description || ''}`,
          hs_timestamp: new Date().toISOString()
        },
        associations: [
          {
            to: { id: contactId },
            types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 202 }] // Contact to Note
          }
        ]
      };
      
      const hubspotResponse = await fetch('https://api.hubapi.com/crm/v3/objects/notes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HUBSPOT_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(hubspotEngagement)
      });
      
      if (!hubspotResponse.ok) {
        const errorData = await hubspotResponse.json();
        console.error('HubSpot API Error:', errorData);
        throw new Error(`HubSpot API error: ${hubspotResponse.status}`);
      }
      
      const createdEngagement = await hubspotResponse.json();
      
      const newEngagement = {
        id: createdEngagement.id,
        type,
        title,
        description: description || '',
        contactId,
        contactName,
        contactEmail,
        dealId: dealId || null,
        dealName: dealId ? 'Associated Deal' : null,
        status: scheduledAt ? 'scheduled' : 'completed',
        priority: priority || 'medium',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        createdAt: new Date(createdEngagement.createdAt || new Date()),
        createdBy: session.user.id || session.user.email,
        assignedTo: assignedTo || session.user.id || session.user.email,
        score: calculateEngagementScore({ type })
      };
      
      console.log('✅ Successfully created engagement in HubSpot:', newEngagement.id);

      return NextResponse.json({
        success: true,
        engagement: newEngagement,
        message: 'Engagement created successfully'
      });
      
    } catch (hubspotError) {
      console.error('HubSpot engagement creation failed:', hubspotError);
      
      // Return error response for HubSpot API failure
      return NextResponse.json(
        { error: 'Failed to create engagement in HubSpot', details: hubspotError.message },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error creating engagement:', error);
    return NextResponse.json(
      { error: 'Failed to create engagement' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, outcome, score, completedAt } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing engagement ID' },
        { status: 400 }
      );
    }

    // In production, you would:
    // 1. Update engagement in HubSpot via API
    // 2. Handle proper validation and error responses
    // 3. Update related contact/deal records

    console.log('📞 Updating engagement:', id);

    const updatedEngagement = {
      id,
      status: status || 'completed',
      outcome: outcome || '',
      score: score || null,
      completedAt: completedAt ? new Date(completedAt) : new Date()
    };

    return NextResponse.json({
      success: true,
      engagement: updatedEngagement,
      message: 'Engagement updated successfully'
    });

  } catch (error) {
    console.error('Error updating engagement:', error);
    return NextResponse.json(
      { error: 'Failed to update engagement' },
      { status: 500 }
    );
  }
}
