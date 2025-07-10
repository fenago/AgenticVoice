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

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const priority = searchParams.get('priority') || '';
    const sortBy = searchParams.get('sortBy') || 'createdate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const export_format = searchParams.get('export');

    const hubspot = new HubSpotService();

    // Build filters
    const filters: any[] = [];

    if (search) {
      filters.push({
        propertyName: 'subject',
        operator: 'CONTAINS_TOKEN',
        value: search
      });
    }

    if (status) {
      filters.push({
        propertyName: 'hs_pipeline_stage',
        operator: 'EQ',
        value: status
      });
    }

    if (priority) {
      filters.push({
        propertyName: 'hs_ticket_priority',
        operator: 'EQ',
        value: priority
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
        'createdate', 'hs_lastmodifieddate', 'source_type', 'hubspot_owner_id'
      ]
    };

    const response = await hubspot.searchTickets(searchParams_hubspot);

    // Handle export functionality
    if (export_format === 'csv') {
      const csvContent = convertToCSV(response.results || []);
      
      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="tickets.csv"'
        }
      });
    }

    return NextResponse.json({
      tickets: response.results || [],
      total: response.total || 0,
      hasMore: (response.results?.length || 0) === limit
    });

  } catch (error) {
    console.error('Error fetching tickets:', error);
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

    const body = await request.json();
    const { action } = body;

    const hubspot = new HubSpotService();

    if (action === 'create') {
      const { ticketData } = body;
      
      if (!ticketData.subject) {
        return NextResponse.json(
          { error: 'Subject is required' },
          { status: 400 }
        );
      }

      const result = await hubspot.createTicket(ticketData);
      return NextResponse.json({ ticket: result });

    } else if (action === 'bulk_delete') {
      const { ticketIds } = body;
      
      if (!Array.isArray(ticketIds) || ticketIds.length === 0) {
        return NextResponse.json(
          { error: 'No ticket IDs provided' },
          { status: 400 }
        );
      }

      const results = await Promise.allSettled(
        ticketIds.map((id: string) => hubspot.deleteTicket(id))
      );

      const successful = results.filter((r: any) => r.status === 'fulfilled').length;
      const failed = results.filter((r: any) => r.status === 'rejected').length;

      return NextResponse.json({
        message: `Successfully deleted ${successful} tickets${failed > 0 ? `, ${failed} failed` : ''}`,
        successful,
        failed
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error in tickets POST:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

function convertToCSV(tickets: any[]): string {
  if (!tickets.length) return '';

  const headers = ['Subject', 'Priority', 'Status', 'Created', 'Modified', 'Source'];
  const rows = tickets.map((ticket: any) => [
    ticket.properties?.subject || '',
    ticket.properties?.hs_ticket_priority || '',
    ticket.properties?.hs_pipeline_stage || '',
    ticket.properties?.createdate ? new Date(ticket.properties.createdate).toLocaleDateString() : '',
    ticket.properties?.hs_lastmodifieddate ? new Date(ticket.properties.hs_lastmodifieddate).toLocaleDateString() : '',
    ticket.properties?.source_type || ''
  ]);

  return [headers, ...rows]
    .map((row: any[]) => row.map((field: any) => `"${field}"`).join(','))
    .join('\n');
}
