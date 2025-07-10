import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import { HubSpotService } from '@/libs/hubspot';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userEmail = session.user.email;
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email required' },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'createdate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const hubspot = new HubSpotService();

    // First, find the contact by email to get their tickets
    const contactResponse = await hubspot.searchContacts({
      filters: [{
        propertyName: 'email',
        operator: 'EQ',
        value: userEmail
      }],
      limit: 1
    });

    if (!contactResponse.results?.length) {
      return NextResponse.json({
        tickets: [],
        total: 0,
        hasMore: false,
        message: 'No tickets found for this user'
      });
    }

    const contactId = contactResponse.results[0].id;

    // Build filters for tickets associated with this contact
    const filters: any[] = [];

    if (status) {
      filters.push({
        propertyName: 'hs_pipeline_stage',
        operator: 'EQ',
        value: status
      });
    }

    // Build sorts
    const sorts = [{
      propertyName: sortBy,
      direction: sortOrder.toUpperCase() === 'DESC' ? 'DESCENDING' : 'ASCENDING'
    }];

    const searchParams_hubspot = {
      filters,
      sorts,
      limit,
      offset,
      properties: [
        'subject', 'content', 'hs_ticket_priority', 'hs_pipeline_stage',
        'createdate', 'hs_lastmodifieddate', 'source_type'
      ]
    };

    // Search all tickets and then filter by associated contact
    const ticketResponse = await hubspot.searchTickets(searchParams_hubspot);
    
    // Filter tickets that are associated with this contact
    const userTickets = [];
    for (const ticket of ticketResponse.results || []) {
      try {
        const ticketContacts = await hubspot.getTicketContacts(ticket.id);
        if (ticketContacts.some((tc: any) => tc.id === contactId)) {
          userTickets.push(ticket);
        }
      } catch (error) {
        // Skip tickets that can't be checked for associations
        console.error('Error checking ticket associations:', error);
      }
    }

    return NextResponse.json({
      tickets: userTickets,
      total: userTickets.length,
      hasMore: false // Since we're filtering client-side, we don't have accurate pagination
    });

  } catch (error) {
    console.error('Error fetching customer tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userEmail = session.user.email;
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { subject, content, priority = 'MEDIUM' } = body;

    if (!subject || !content) {
      return NextResponse.json(
        { error: 'Subject and content are required' },
        { status: 400 }
      );
    }

    const hubspot = new HubSpotService();

    // Find or create contact
    let contactId;
    const contactResponse = await hubspot.searchContacts({
      filters: [{
        propertyName: 'email',
        operator: 'EQ',
        value: userEmail
      }],
      limit: 1
    });

    if (contactResponse.results?.length) {
      contactId = contactResponse.results[0].id;
    } else {
      // Create contact if it doesn't exist
      const newContact = await hubspot.createContact({
        email: userEmail,
        firstname: session.user.name?.split(' ')[0] || '',
        lastname: session.user.name?.split(' ').slice(1).join(' ') || ''
      });
      contactId = newContact.id;
    }

    // Create ticket
    const ticketData = {
      subject,
      content,
      priority,
      status: 'new',
      source_type: 'CHAT'
    };

    const ticket = await hubspot.createTicket(ticketData);

    // Associate ticket with contact
    await hubspot.associateTicketWithContact(ticket.id, contactId);

    return NextResponse.json({ 
      ticket,
      message: 'Ticket created successfully' 
    });

  } catch (error) {
    console.error('Error creating customer ticket:', error);
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
}
