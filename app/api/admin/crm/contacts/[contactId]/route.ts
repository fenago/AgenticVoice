import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../../libs/auth-config';
import { HubSpotService } from '../../../../../../libs/hubspot';

export async function GET(
  request: NextRequest,
  { params }: { params: { contactId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['ADMIN', 'GOD_MODE', 'MARKETING'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contactId } = params;
    const hubspot = new HubSpotService();

    const [contact, timeline, companies, deals, tickets] = await Promise.all([
      hubspot.getContactById(contactId, [
        'firstname', 'lastname', 'email', 'phone', 'company', 'website',
        'lifecyclestage', 'hs_lead_status', 'createdate', 'lastmodifieddate',
        'hubspotscore', 'hs_analytics_num_page_views', 'hs_analytics_num_visits',
        'hs_analytics_last_timestamp', 'hs_social_linkedin_clicks',
        'jobtitle', 'state', 'city', 'country', 'zip', 'message'
      ]),
      hubspot.getContactActivityTimeline(contactId),
      hubspot.getContactCompanies(contactId),
      hubspot.getContactDeals(contactId),
      hubspot.getContactTickets(contactId)
    ]);

    const contactDetails = {
      id: contact.id,
      properties: contact.properties,
      displayName: `${contact.properties.firstname || ''} ${contact.properties.lastname || ''}`.trim() || contact.properties.email,
      leadScore: parseInt(contact.properties.hubspotscore) || 0,
      engagementStats: {
        pageViews: parseInt(contact.properties.hs_analytics_num_page_views) || 0,
        visits: parseInt(contact.properties.hs_analytics_num_visits) || 0,
        lastActivity: contact.properties.hs_analytics_last_timestamp,
        linkedinClicks: parseInt(contact.properties.hs_social_linkedin_clicks) || 0
      },
      timeline: timeline.map((engagement: any) => ({
        id: engagement.id,
        type: engagement.type,
        timestamp: engagement.timestamp,
        title: engagement.title || engagement.body?.substring(0, 100),
        body: engagement.body,
        owner: engagement.ownerName
      })),
      associatedCompanies: companies,
      associatedDeals: deals,
      associatedTickets: tickets,
      createdAt: contact.properties.createdate,
      updatedAt: contact.properties.lastmodifieddate
    };

    return NextResponse.json({ contact: contactDetails });
  } catch (error) {
    console.error('Contact Details API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact details' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { contactId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['ADMIN', 'GOD_MODE', 'MARKETING'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contactId } = params;
    const updateData = await request.json();
    const hubspot = new HubSpotService();

    const updatedContact = await hubspot.updateContact(contactId, {
      properties: {
        firstname: updateData.firstName,
        lastname: updateData.lastName,
        email: updateData.email,
        phone: updateData.phone,
        company: updateData.company,
        jobtitle: updateData.jobTitle,
        lifecyclestage: updateData.lifecycleStage,
        hs_lead_status: updateData.leadStatus,
        state: updateData.state,
        city: updateData.city,
        country: updateData.country,
        zip: updateData.zip,
        ...updateData.customProperties
      }
    });

    // Track contact update event
    await hubspot.trackEvent({
      eventName: 'contact_updated_via_admin',
      contactId,
      properties: {
        updated_by: session.user.email,
        update_method: 'admin_dashboard'
      }
    });

    return NextResponse.json({ contact: updatedContact });
  } catch (error) {
    console.error('Update Contact API Error:', error);
    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { contactId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['ADMIN', 'GOD_MODE'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contactId } = params;
    const hubspot = new HubSpotService();

    await hubspot.deleteContact(contactId);

    // Track contact deletion event
    await hubspot.trackEvent({
      eventName: 'contact_deleted_via_admin',
      properties: {
        deleted_contact_id: contactId,
        deleted_by: session.user.email,
        deletion_method: 'admin_dashboard'
      }
    });

    return NextResponse.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Delete Contact API Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 }
    );
  }
}
