import { NextResponse, type NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth-config';
import { UserRole } from '@/types/auth';
import { VapiService } from '@/libs/vapi';

/**
 * GET /api/admin/vapi/calls
 * Retrieves a list of all VAPI calls.
 * Access: Admin only
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  // Temporary logging to debug authorization
  console.log('[VAPI CALLS API] Checking session:', JSON.stringify(session, null, 2));

  if (!session || ![UserRole.ADMIN, UserRole.GOD_MODE].includes(session.user.role)) {
    console.error('[VAPI CALLS API] Unauthorized access attempt. User role:', session?.user?.role);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const vapiService = new VapiService();
    const calls = await vapiService.listCalls();

    return NextResponse.json(calls);

  } catch (error: any) {
    console.error('[VAPI CALLS API] Error fetching VAPI calls:', {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json({ error: 'An internal server error occurred while fetching VAPI calls.' }, { status: 500 });
  }
}
