import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../../libs/auth-config';
import { HubSpotService } from '../../../../../../libs/hubspot';

export async function GET(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['ADMIN', 'GOD_MODE', 'MARKETING'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companyId } = params;
    const hubspot = new HubSpotService();

    const [company, contacts, deals, tickets, engagements] = await Promise.all([
      hubspot.getCompanyById(companyId, [
        'name', 'domain', 'industry', 'numberofemployees', 'annualrevenue',
        'city', 'state', 'country', 'phone', 'createdate', 'lastmodifieddate',
        'hubspotscore', 'lifecyclestage', 'hs_lead_status', 'type',
        'description', 'founded_year', 'timezone', 'zip'
      ]),
      hubspot.getCompanyContacts(companyId),
      hubspot.getCompanyDeals(companyId),
      hubspot.getCompanyTickets(companyId),
      hubspot.getCompanyEngagements(companyId)
    ]);

    const dealStats = {
      total: deals.length,
      totalValue: deals.reduce((sum: number, deal: any) => sum + (parseFloat(deal.properties.amount) || 0), 0),
      closedWon: deals.filter((deal: any) => deal.properties.dealstage === 'closedwon').length,
      openDeals: deals.filter((deal: any) => !['closedwon', 'closedlost'].includes(deal.properties.dealstage)).length
    };

    const ticketStats = {
      total: tickets.length,
      open: tickets.filter((ticket: any) => ticket.properties.hs_ticket_pipeline_stage !== 'closed').length,
      closed: tickets.filter((ticket: any) => ticket.properties.hs_ticket_pipeline_stage === 'closed').length
    };

    const companyDetails = {
      id: company.id,
      properties: company.properties,
      displayName: company.properties.name || company.properties.domain,
      employeeCount: parseInt(company.properties.numberofemployees) || 0,
      annualRevenue: parseFloat(company.properties.annualrevenue) || 0,
      leadScore: parseInt(company.properties.hubspotscore) || 0,
      timeline: engagements.map((engagement: any) => ({
        id: engagement.id,
        type: engagement.type,
        timestamp: engagement.timestamp,
        title: engagement.title || engagement.body?.substring(0, 100),
        body: engagement.body,
        owner: engagement.ownerName
      })),
      associatedContacts: contacts.map((contact: any) => ({
        id: contact.id,
        name: `${contact.properties.firstname || ''} ${contact.properties.lastname || ''}`.trim(),
        email: contact.properties.email,
        jobTitle: contact.properties.jobtitle,
        phone: contact.properties.phone,
        lifecycleStage: contact.properties.lifecyclestage
      })),
      dealSummary: dealStats,
      ticketSummary: ticketStats,
      recentDeals: deals.slice(0, 5).map((deal: any) => ({
        id: deal.id,
        name: deal.properties.dealname,
        amount: parseFloat(deal.properties.amount) || 0,
        stage: deal.properties.dealstage,
        closeDate: deal.properties.closedate,
        probability: deal.properties.probability
      })),
      recentTickets: tickets.slice(0, 5).map((ticket: any) => ({
        id: ticket.id,
        subject: ticket.properties.subject,
        status: ticket.properties.hs_ticket_pipeline_stage,
        priority: ticket.properties.hs_ticket_priority,
        createDate: ticket.properties.createdate
      })),
      createdAt: company.properties.createdate,
      updatedAt: company.properties.lastmodifieddate
    };

    return NextResponse.json({ company: companyDetails });
  } catch (error) {
    console.error('Company Details API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company details' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['ADMIN', 'GOD_MODE', 'MARKETING'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companyId } = params;
    const updateData = await request.json();
    const hubspot = new HubSpotService();

    const updatedCompany = await hubspot.updateCompany(companyId, {
      properties: {
        name: updateData.name,
        domain: updateData.domain,
        industry: updateData.industry,
        numberofemployees: updateData.employeeCount?.toString(),
        annualrevenue: updateData.annualRevenue?.toString(),
        city: updateData.city,
        state: updateData.state,
        country: updateData.country,
        phone: updateData.phone,
        lifecyclestage: updateData.lifecycleStage,
        hs_lead_status: updateData.leadStatus,
        type: updateData.type,
        description: updateData.description,
        founded_year: updateData.foundedYear?.toString(),
        timezone: updateData.timezone,
        zip: updateData.zip,
        ...updateData.customProperties
      }
    });

    // Track company update event
    await hubspot.trackEvent({
      eventName: 'company_updated_via_admin',
      companyId,
      properties: {
        updated_by: session.user.email,
        update_method: 'admin_dashboard'
      }
    });

    return NextResponse.json({ company: updatedCompany });
  } catch (error) {
    console.error('Update Company API Error:', error);
    return NextResponse.json(
      { error: 'Failed to update company' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['ADMIN', 'GOD_MODE'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companyId } = params;
    const hubspot = new HubSpotService();

    await hubspot.deleteCompany(companyId);

    // Track company deletion event
    await hubspot.trackEvent({
      eventName: 'company_deleted_via_admin',
      properties: {
        deleted_company_id: companyId,
        deleted_by: session.user.email,
        deletion_method: 'admin_dashboard'
      }
    });

    return NextResponse.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Delete Company API Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete company' },
      { status: 500 }
    );
  }
}
