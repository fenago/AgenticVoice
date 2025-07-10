import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/libs/auth-config';
import { VapiService } from '@/libs/vapi';
import { UserRole } from '@/types/auth';

/**
 * @swagger
 * /api/admin/vapi/system-data:
 *   get:
 *     summary: Fetches system-wide VAPI data
 *     description: Retrieves aggregated system-wide VAPI analytics, including revenue, call volume, and performance trends. This is a "Big Picture" endpoint for the admin dashboard.
 *     tags:
 *       - VAPI Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved system-wide data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 schema:
 *                   $ref: '#/components/schemas/VapiSystemAnalytics'
 *       403:
 *         description: Forbidden. User is not an admin.
 *       500:
 *         description: Internal Server Error. Could be a missing VAPI_API_KEY or other server issue.
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    const adminRoles = [UserRole.ADMIN, UserRole.GOD_MODE];
    if (!session?.user?.role || !adminRoles.includes(session.user.role as UserRole)) {
      return new NextResponse(JSON.stringify({ message: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`VAPI System Data endpoint hit by admin: ${session.user.email}`);

    const vapiService = new VapiService();
    const analytics = await vapiService.getSystemAnalytics();

    return NextResponse.json(analytics);

  } catch (error: any) {
    console.error('Error fetching VAPI system data:', error);
    
    if (error.message.includes('VAPI_API_KEY is not set')) {
        return new NextResponse(JSON.stringify({ message: 'VAPI API Key is not configured on the server.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    return new NextResponse(JSON.stringify({ message: 'An internal server error occurred.', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
