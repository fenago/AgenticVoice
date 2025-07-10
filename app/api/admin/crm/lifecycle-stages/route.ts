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

    const hubspot = new HubSpotService();
    const lifecycleStages = await hubspot.getLifecycleStages();
    
    return NextResponse.json({ 
      success: true,
      lifecycleStages 
    });
    
  } catch (error) {
    console.error('Error fetching lifecycle stages:', error);
    return NextResponse.json({
      error: 'Failed to fetch lifecycle stages',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
