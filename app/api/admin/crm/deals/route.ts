import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import { HubSpotService } from '@/libs/hubspot';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check user permissions
    const userRole = (session.user as any).role;
    if (!['ADMIN', 'GOD_MODE', 'MARKETING'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const stage = searchParams.get('stage') || '';
    const owner = searchParams.get('owner') || '';
    const sortBy = searchParams.get('sortBy') || 'createdate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '50');
    const export_format = searchParams.get('export');

    let filters: any = {};
    if (search) {
      filters.dealname = search;
    }
    if (stage) {
      filters.dealstage = stage;
    }
    if (owner) {
      filters.hubspot_owner_id = owner;
    }

    try {
      const hubspot = new HubSpotService();
      const dealsData = await hubspot.searchDeals({
        filters: Object.keys(filters).length > 0 ? Object.entries(filters).map(([key, value]) => ({
          propertyName: key,
          operator: 'EQ',
          value: value
        })) : [],
        sorts: [{
          propertyName: sortBy,
          direction: sortOrder.toUpperCase()
        }],
        limit
      });

      if (export_format) {
        const exportData = {
          deals: dealsData.results || [],
          exported_at: new Date().toISOString(),
          total: dealsData.total || 0
        };
        
        return new NextResponse(JSON.stringify(exportData, null, 2), {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="deals-${new Date().toISOString().split('T')[0]}.json"`
          }
        });
      }

      return NextResponse.json({
        deals: dealsData.results || [],
        total: dealsData.total || 0,
        hasMore: dealsData.paging?.next?.after ? true : false
      });
    } catch (hubspotError) {
      console.error('HubSpot deals API error:', hubspotError);
      return NextResponse.json({
        deals: [],
        total: 0,
        hasMore: false,
        error: 'HubSpot API temporarily unavailable'
      });
    }
  } catch (error) {
    console.error('Deals API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userRole = (session.user as any).role;
    if (!['ADMIN', 'GOD_MODE', 'MARKETING'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Handle bulk actions
    if (body.action && body.dealIds) {
      const { action, dealIds } = body;
      
      if (action === 'delete') {
        const hubspot = new HubSpotService();
        const results = await Promise.allSettled(
          dealIds.map((id: string) => hubspot.deleteDeal(id))
        );
        
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        
        return NextResponse.json({
          success: true,
          message: `Deleted ${successful} deals${failed > 0 ? `, ${failed} failed` : ''}`
        });
      }
      
      return NextResponse.json(
        { error: 'Unsupported bulk action' },
        { status: 400 }
      );
    }

    // Create new deal
    const dealProperties = {
      dealname: body.dealname,
      amount: body.amount,
      closedate: body.closedate,
      dealstage: body.dealstage,
      probability: body.probability,
      dealtype: body.dealtype,
      description: body.description,
      // Company and contact associations would be handled separately
    };

    // Remove undefined values
    Object.keys(dealProperties).forEach(key => 
      dealProperties[key as keyof typeof dealProperties] === undefined && 
      delete dealProperties[key as keyof typeof dealProperties]
    );

    const hubspot = new HubSpotService();
    const newDeal = await hubspot.createDeal(dealProperties);
    
    return NextResponse.json({
      success: true,
      deal: newDeal
    });
  } catch (error) {
    console.error('Deal creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create deal' },
      { status: 500 }
    );
  }
}
