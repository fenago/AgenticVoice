import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/libs/auth-config';
import { vapiService, VapiAssistant, VapiCall, VapiCustomer } from '@/libs/vapi';

// Define a more detailed interface for the response
interface CustomerDetailsResponse extends VapiCustomer {
  assistantsList: VapiAssistant[];
  callsList: VapiCall[];
}

export async function GET(
  request: Request,
  { params }: { params: { customerId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !['ADMIN', 'GOD_MODE'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { customerId } = params;

  if (!customerId) {
    return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
  }

  try {
    // Fetch all necessary data for the customer in parallel for efficiency
    const [customerData, assistantsList, callsList] = await Promise.all([
      vapiService.findCustomerByQuery(customerId), // This can resolve a stripeId to get aggregate data
      vapiService.listAssistantsForCustomer(customerId),
      vapiService.listCallsForCustomer(customerId, { limit: 100 }) // Get the last 100 calls
    ]);

    if (!customerData) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Combine all fetched data into a single response object
    const responseData: CustomerDetailsResponse = {
      ...customerData,
      assistantsList,
      callsList,
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error(`[VAPI API] Error fetching details for customer ${customerId}:`, error);
    return NextResponse.json(
      { error: `Failed to fetch customer details: ${error.message}` },
      { status: 500 }
    );
  }
}
