import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth-config';
import { VapiService } from '@/libs/vapi';
import User from '@/models/User';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'GOD_MODE'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const vapiService = new VapiService();
    const customers = await vapiService.listUniqueCustomers();

    return NextResponse.json(customers);

  } catch (error: any) {
    console.error('Error fetching unique customers:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
