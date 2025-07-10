import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth-config';

// GET - Fetch pipeline by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user?.role;
    if (!['ADMIN', 'GOD_MODE', 'MARKETING'].includes(userRole || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const pipelineId = params.id;
    console.log(`🔍 Fetching pipeline: ${pipelineId}`);

    // In production, fetch from HubSpot API or database
    // For now, return mock data based on ID
    const mockPipeline = {
      id: pipelineId,
      name: 'Sample Pipeline',
      type: 'deals' as const,
      description: 'Sample pipeline description',
      isDefault: false,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stages: [
        {
          id: 'stage_1',
          name: 'Lead',
          probability: 10,
          requirements: ['Contact verified'],
          order: 1,
          color: '#f3f4f6',
          closedWon: false,
          closedLost: false
        }
      ],
      analytics: {
        totalDeals: 0,
        conversionRate: 0,
        averageDealSize: 0,
        averageCycleTime: 0
      }
    };

    return NextResponse.json({
      success: true,
      pipeline: mockPipeline
    });

  } catch (error) {
    console.error('Error fetching pipeline:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pipeline' },
      { status: 500 }
    );
  }
}

// PATCH - Update pipeline
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user?.role;
    if (!['ADMIN', 'GOD_MODE'].includes(userRole || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const pipelineId = params.id;
    const updates = await request.json();

    console.log(`🔄 Updating pipeline: ${pipelineId}`, updates);

    // In production, update in HubSpot API or database
    const updatedPipeline = {
      id: pipelineId,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      pipeline: updatedPipeline,
      message: 'Pipeline updated successfully'
    });

  } catch (error) {
    console.error('Error updating pipeline:', error);
    return NextResponse.json(
      { error: 'Failed to update pipeline' },
      { status: 500 }
    );
  }
}

// DELETE - Delete pipeline
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user?.role;
    if (!['ADMIN', 'GOD_MODE'].includes(userRole || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const pipelineId = params.id;
    console.log(`🗑️ Deleting pipeline: ${pipelineId}`);

    // In production, delete from HubSpot API or database
    // Check if pipeline has active deals before deletion

    return NextResponse.json({
      success: true,
      message: 'Pipeline deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting pipeline:', error);
    return NextResponse.json(
      { error: 'Failed to delete pipeline' },
      { status: 500 }
    );
  }
}
