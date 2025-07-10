import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import { VapiService } from '@/libs/vapi';
import { UserRole } from '@/types/auth';

export async function GET(
  request: Request,
  { params }: { params: { customerId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || ![UserRole.ADMIN, UserRole.GOD_MODE].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { customerId } = params;
    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    const vapiService = new VapiService();
    const customerCalls = await vapiService.listCallsForCustomer(customerId);

    return NextResponse.json(customerCalls);
  } catch (error: any) {
    console.error(`Error fetching calls for customer ${params.customerId}:`, error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
