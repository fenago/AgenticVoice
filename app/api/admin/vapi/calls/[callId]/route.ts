import { NextRequest, NextResponse } from 'next/server';
import { vapiService } from '@/libs/vapi';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth-config';
import { UserRole } from '@/types/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { callId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || ![UserRole.ADMIN, UserRole.GOD_MODE].includes(session.user.role as UserRole)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { callId } = params;

    if (!callId) {
      return NextResponse.json({ message: 'Call ID is required' }, { status: 400 });
    }

    const callDetails = await vapiService.getCall(callId);

    return NextResponse.json(callDetails);
  } catch (error: any) {
    console.error(`Failed to fetch call details for ${params.callId}:`, error);
    return NextResponse.json({ message: error.message || 'Failed to fetch call details' }, { status: 500 });
  }
}
