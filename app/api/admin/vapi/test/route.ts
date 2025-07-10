import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth-config';
import { vapiService } from '@/libs/vapi';

// POST /api/admin/vapi/test - Test VAPI connection and functionality
export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    // Check admin privileges
    if (!['ADMIN', 'GOD_MODE'].includes(session.user.role)) {
      return NextResponse.json({ 
        error: 'Admin access required' 
      }, { status: 403 });
    }

    // Test VAPI connection
    const testResult = await vapiService.testConnection();
    
    return NextResponse.json({
      success: testResult.success,
      message: testResult.message,
      details: testResult.details,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('VAPI test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'VAPI test failed',
      message: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
