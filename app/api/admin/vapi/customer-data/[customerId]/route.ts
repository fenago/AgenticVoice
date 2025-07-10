import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/libs/auth-config';
import { VapiService } from '@/libs/vapi';
import { UserRole } from '@/types/auth';

/**
 * @swagger
 * /api/admin/vapi/customer-data/{customerId}:
 *   get:
 *     summary: Fetches VAPI data for a specific customer
 *     description: Retrieves all calls, phone numbers, and assistants associated with a specific customer ID from the VAPI API.
 *     tags:
 *       - VAPI Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The Stripe customer ID of the user.
 *     responses:
 *       200:
 *         description: Successfully retrieved customer-specific data.
 *       400:
 *         description: Bad Request. Customer ID is missing.
 *       403:
 *         description: Forbidden. User is not an admin.
 *       404:
 *         description: Customer not found.
 *       500:
 *         description: Internal Server Error.
 */
export async function GET(
  request: Request,
  { params }: { params: { customerId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const adminRoles = [UserRole.ADMIN, UserRole.GOD_MODE];

    if (!session?.user?.role || !adminRoles.includes(session.user.role as UserRole)) {
      return new NextResponse(JSON.stringify({ message: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { customerId } = params;
    if (!customerId) {
      return new NextResponse(JSON.stringify({ message: 'Customer ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`VAPI Customer Data endpoint hit for customer: ${customerId} by admin: ${session.user.email}`);

    const vapiService = new VapiService();
        const customerData = await vapiService.findCustomerByQuery(customerId);

    if (!customerData) {
        return new NextResponse(JSON.stringify({ message: 'Customer data not found.' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    return NextResponse.json(customerData);

  } catch (error: any) {
    console.error(`Error fetching VAPI data for customer:`, error);
    return new NextResponse(JSON.stringify({ message: 'An internal server error occurred.', details: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
    });
  }
}
