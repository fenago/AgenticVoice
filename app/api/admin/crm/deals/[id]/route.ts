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

    const hubspot = new HubSpotService();
    const deal = await hubspot.getDealById(params.id);
    
    if (!deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ deal });
  } catch (error) {
    console.error('Deal fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deal' },
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
    
    const dealProperties = {
      dealname: body.dealname,
      amount: body.amount,
      closedate: body.closedate,
      dealstage: body.dealstage,
      probability: body.probability,
      dealtype: body.dealtype,
      description: body.description,
    };

    // Remove undefined values
    Object.keys(dealProperties).forEach(key => 
      dealProperties[key as keyof typeof dealProperties] === undefined && 
      delete dealProperties[key as keyof typeof dealProperties]
    );

    const hubspot = new HubSpotService();
    const updatedDeal = await hubspot.updateDeal(params.id, dealProperties);
    
    return NextResponse.json({
      success: true,
      deal: updatedDeal
    });
  } catch (error) {
    console.error('Deal update error:', error);
    return NextResponse.json(
      { error: 'Failed to update deal' },
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

    const hubspot = new HubSpotService();
    await hubspot.deleteDeal(params.id);
    
    return NextResponse.json({
      success: true,
      message: 'Deal deleted successfully'
    });
  } catch (error) {
    console.error('Deal deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete deal' },
      { status: 500 }
    );
  }
}
