import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import { HubSpotService } from '@/libs/hubspot';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Role-based access control
    const userRole = (session.user as any).role;
    if (!['ADMIN', 'GOD_MODE', 'MARKETING'].includes(userRole)) {
      return NextResponse.json(
        { 
          error: 'Insufficient permissions',
          message: 'You must be an Admin, God Mode, or Marketing user to access tickets' 
        },
        { status: 403 }
      );
    }

    const ticketId = params.id;
    const hubspot = new HubSpotService();

    const ticket = await hubspot.getTicketById(ticketId);

    // Get associated contacts and companies
    const [contacts, companies] = await Promise.all([
      hubspot.getTicketContacts(ticketId).catch((): any[] => []),
      hubspot.getTicketCompanies(ticketId).catch((): any[] => [])
    ]);

    return NextResponse.json({
      ticket,
      contacts,
      companies
    });

  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket' },
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

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Role-based access control
    const userRole = (session.user as any).role;
    if (!['ADMIN', 'GOD_MODE', 'MARKETING'].includes(userRole)) {
      return NextResponse.json(
        { 
          error: 'Insufficient permissions',
          message: 'You must be an Admin, God Mode, or Marketing user to manage tickets' 
        },
        { status: 403 }
      );
    }

    const ticketId = params.id;
    const body = await request.json();
    
    const hubspot = new HubSpotService();
    const result = await hubspot.updateTicket(ticketId, body);

    return NextResponse.json({ ticket: result });

  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket' },
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

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Role-based access control
    const userRole = (session.user as any).role;
    if (!['ADMIN', 'GOD_MODE', 'MARKETING'].includes(userRole)) {
      return NextResponse.json(
        { 
          error: 'Insufficient permissions',
          message: 'You must be an Admin, God Mode, or Marketing user to manage tickets' 
        },
        { status: 403 }
      );
    }

    const ticketId = params.id;
    const hubspot = new HubSpotService();
    
    await hubspot.deleteTicket(ticketId);

    return NextResponse.json({ 
      message: 'Ticket deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json(
      { error: 'Failed to delete ticket' },
      { status: 500 }
    );
  }
}
