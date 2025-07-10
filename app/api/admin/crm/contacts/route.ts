import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../libs/auth-config';
import { HubSpotService } from '../../../../../libs/hubspot';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['ADMIN', 'GOD_MODE', 'MARKETING'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const leadStatus = searchParams.get('leadStatus') || '';
    const lifecycleStage = searchParams.get('lifecycleStage') || '';
    const sortBy = searchParams.get('sortBy') || 'createdate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const hubspot = new HubSpotService();
    
    const filters = [];
    
    if (search) {
      filters.push({
        propertyName: 'email',
        operator: 'CONTAINS_TOKEN',
        value: search
      });
    }
    
    if (leadStatus) {
      filters.push({
        propertyName: 'hs_lead_status',
        operator: 'EQ',
        value: leadStatus
      });
    }
    
    if (lifecycleStage) {
      filters.push({
        propertyName: 'lifecyclestage',
        operator: 'EQ', 
        value: lifecycleStage
      });
    }

    // Use the existing searchContacts method from HubSpotService
    const searchResponse = await hubspot.searchContacts({
      filters: filters.length > 0 ? filters : undefined,
      properties: [
        'firstname', 'lastname', 'email', 'phone', 'company',
        'lifecyclestage', 'hs_lead_status', 'createdate', 'lastmodifieddate',
        'hubspotscore', 'hs_analytics_num_page_views', 'hs_analytics_num_visits'
      ],
      sorts: [{
        propertyName: sortBy,
        direction: sortOrder.toLowerCase() === 'desc' ? 'DESCENDING' : 'ASCENDING'
      }],
      offset: (page - 1) * limit,
      limit
    });
    
    const contacts = searchResponse.results || [];
    const contactsWithEngagement = contacts.map((contact: any) => {
      const props = contact.properties || {};
      return {
        id: contact.id,
        // Flatten properties to match frontend interface
        email: props.email,
        firstname: props.firstname,
        lastname: props.lastname,
        company: props.company,
        phone: props.phone,
        createdate: props.createdate,
        lastmodifieddate: props.lastmodifieddate,
        lifecyclestage: props.lifecyclestage,
        hs_lead_status: props.hs_lead_status,
        hubspotscore: props.hubspotscore,
        jobtitle: props.jobtitle,
        city: props.city,
        state: props.state,
        country: props.country,
        // Additional computed fields
        recentEngagements: [] as any[], // Simplified - engagements require separate API calls
        associatedCompanies: [] as any[], // Simplified - companies require separate API calls  
        displayName: `${props.firstname || ''} ${props.lastname || ''}`.trim() || props.email || 'Unknown',
        leadScore: parseInt(props.hubspotscore) || 0,
        pageViews: parseInt(props.hs_analytics_num_page_views) || 0,
        visits: parseInt(props.hs_analytics_num_visits) || 0
      };
    });

    return NextResponse.json({
      contacts: contactsWithEngagement,
      pagination: {
        page,
        limit,
        total: searchResponse.total || contacts.length,
        totalPages: Math.ceil((searchResponse.total || contacts.length) / limit),
        hasNext: searchResponse.paging?.next?.after
      }
    });
  } catch (error) {
    console.error('Contacts API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['ADMIN', 'GOD_MODE', 'MARKETING'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { action } = data;
    
    const hubspot = new HubSpotService();
    
    // Handle different actions
    switch (action) {
      case 'create':
        const result = await hubspot.createContact(data.contactData);
        return NextResponse.json({ 
          success: true,
          contact: result,
          message: 'Contact created successfully' 
        });
        
      case 'batchUpdate':
        const batchUpdateResult = await hubspot.batchUpdateContacts(data.updates);
        return NextResponse.json({ 
          success: true,
          result: batchUpdateResult,
          message: `${data.updates.length} contacts updated successfully` 
        });
        
      case 'batchDelete':
        const batchDeleteResult = await hubspot.batchDeleteContacts(data.contactIds);
        return NextResponse.json({ 
          success: true,
          result: batchDeleteResult,
          message: `${data.contactIds.length} contacts deleted successfully` 
        });
        
      case 'import':
        const importResult = await hubspot.importContacts(data.contactsData);
        return NextResponse.json({ 
          success: true,
          result: importResult,
          message: `${data.contactsData.length} contacts imported successfully` 
        });
        
      case 'associateCompany':
        await hubspot.associateContactWithCompany(data.contactId, data.companyId);
        return NextResponse.json({ 
          success: true,
          message: 'Contact associated with company successfully' 
        });
        
      case 'associateDeal':
        await hubspot.associateContactWithDeal(data.contactId, data.dealId);
        return NextResponse.json({ 
          success: true,
          message: 'Contact associated with deal successfully' 
        });
        
      case 'updateLeadScore':
        await hubspot.updateContactLeadScore(data.contactId, data.score, data.notes);
        return NextResponse.json({ 
          success: true,
          message: 'Lead score updated successfully' 
        });
        
      default:
        // Default create action
        const createResult = await hubspot.createContact(data);
        return NextResponse.json({ 
          success: true,
          contact: createResult,
          message: 'Contact created successfully' 
        });
    }
    
  } catch (error) {
    console.error('Error in POST contacts:', error);
    return NextResponse.json({
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['ADMIN', 'GOD_MODE', 'MARKETING'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { contactId, ...updateData } = data;
    
    if (!contactId) {
      return NextResponse.json({ error: 'Contact ID is required' }, { status: 400 });
    }
    
    const hubspot = new HubSpotService();
    
    // Update contact
    const result = await hubspot.updateContact(contactId, updateData);
    
    return NextResponse.json({ 
      success: true,
      contact: result,
      message: 'Contact updated successfully' 
    });
    
  } catch (error) {
    console.error('Error updating contact:', error);
    return NextResponse.json({
      error: 'Failed to update contact',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['ADMIN', 'GOD_MODE', 'MARKETING'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get('contactId');
    
    if (!contactId) {
      return NextResponse.json({ error: 'Contact ID is required' }, { status: 400 });
    }
    
    const hubspot = new HubSpotService();
    
    // Delete contact
    await hubspot.deleteContact(contactId);
    
    return NextResponse.json({ 
      success: true,
      message: 'Contact deleted successfully' 
    });
    
  } catch (error) {
    console.error('Error deleting contact:', error);
    return NextResponse.json({
      error: 'Failed to delete contact',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
