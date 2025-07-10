import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/libs/next-auth';
import { UserRole } from '@/types/auth';

import User, { IUser } from '@/models/User';
import { VapiService, VapiCall } from '@/libs/vapi';
import { getSubscriptionStartDate } from '@/libs/stripe';
import mongoose from 'mongoose';

/**
 * @swagger
 * /api/admin/vapi/find-customer:
 *   post:
 *     summary: Finds a customer and fetches their VAPI data
 *     description: Searches for a user by various identifiers (ID, email, name, Stripe ID, HubSpot ID) and returns their associated VAPI data, including total call duration.
 *     tags:
 *       - VAPI Admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *                 description: The search query (e.g., email, name, any ID).
 *     responses:
 *       200:
 *         description: Successfully found the customer and their data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 vapiData:
 *                   type: object
 *                 totalCallMinutes:
 *                   type: number
 *       400:
 *         description: Bad request, query is missing.
 *       401:
 *         description: Unauthorized, user is not authenticated.
 *       403:
 *         description: Forbidden, user is not an admin.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const adminRoles = [UserRole.ADMIN, UserRole.GOD_MODE];
  if (!session.user?.role || !adminRoles.includes(session.user.role)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const { query, startDate, endDate } = await req.json();
    if (!query) {
      return NextResponse.json({ message: 'Search query is required' }, { status: 400 });
    }

        await mongoose.connect(process.env.MONGODB_URI!);

    const searchConditions = [];
    // Add conditions for case-insensitive search on name and email
    searchConditions.push({ name: { $regex: new RegExp(query, 'i') } });
    searchConditions.push({ email: { $regex: new RegExp(query, 'i') } });

    // Add conditions for exact matches on IDs
    if (mongoose.Types.ObjectId.isValid(query)) {
      searchConditions.push({ _id: new mongoose.Types.ObjectId(query) });
    }
    searchConditions.push({ customerId: query });
    searchConditions.push({ hubspotContactId: query });
    searchConditions.push({ vapiAssistantId: query });

        const user = await User.findOne<IUser>({ $or: searchConditions }).lean();

    if (!user) {
      return NextResponse.json({ message: `User not found with query: ${query}` }, { status: 404 });
    }

    if (!user.customerId) {
      return NextResponse.json({ message: 'User found, but does not have a Stripe Customer ID.' }, { status: 404 });
    }

    const vapiService = new VapiService();
            const vapiData = await vapiService.findCustomerByQuery(user.customerId);

    if (!vapiData) {
      return new NextResponse(JSON.stringify({ message: 'Customer not found.' }), { status: 404 });
    }

    // --- Advanced Call Duration Calculations ---
    const allCalls = await vapiService.listCallsForCustomer(vapiData.id);

    const successfulCalls = allCalls.filter((call: VapiCall) => call.status === 'ended');
    const totalSuccessfulCalls = successfulCalls.length;

    // 1. Lifetime Minutes
        const lifetimeSeconds = allCalls.reduce((acc: number, call: VapiCall) => {
      if (call.startedAt && call.endedAt) {
        return acc + (new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime());
      }
      return acc;
    }, 0) / 1000;
    const lifetimeMinutes = Math.round(lifetimeSeconds / 60);

    // 2. Current Month Minutes
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const currentMonthSeconds = allCalls
      .filter((call: VapiCall) => {
        const callDate = new Date(call.startedAt);
        return callDate >= startOfMonth && callDate <= endOfMonth;
      })
      .reduce((acc: number, call: VapiCall) => {
        if (call.startedAt && call.endedAt) {
          return acc + (new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime());
        }
        return acc;
      }, 0) / 1000;
    const currentMonthMinutes = Math.round(currentMonthSeconds / 60);

    // 3. Date Range Minutes (if specified)
    let dateRangeMinutes = null;
    if (startDate && endDate) {
      const rangeStart = new Date(startDate);
      const rangeEnd = new Date(endDate);
      const dateRangeSeconds = allCalls
        .filter((call: VapiCall) => {
          const callDate = new Date(call.startedAt);
          return callDate >= rangeStart && callDate <= rangeEnd;
        })
        .reduce((acc: number, call: VapiCall) => {
          if (call.startedAt && call.endedAt) {
            return acc + (new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime());
          }
          return acc;
        }, 0) / 1000;
      dateRangeMinutes = Math.round(dateRangeSeconds / 60);
    }

        // 4. First Month Usage (based on Stripe subscription start date)
    let firstMonthMinutes = null;
    let subscriptionStartDate: Date | null = null;
    if (user.customerId) {
            subscriptionStartDate = await getSubscriptionStartDate(user.customerId);
      if (subscriptionStartDate) {
        const firstMonthEndDate = new Date(subscriptionStartDate);
        firstMonthEndDate.setMonth(firstMonthEndDate.getMonth() + 1);

        const firstMonthSeconds = allCalls
          .filter(call => {
            const callDate = new Date(call.startedAt);
            return callDate >= subscriptionStartDate && callDate < firstMonthEndDate;
          })
          .reduce((acc, call) => {
            if (call.startedAt && call.endedAt) {
              return acc + (new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime());
            }
            return acc;
          }, 0) / 1000;
        firstMonthMinutes = Math.round(firstMonthSeconds / 60);
      }
    }

    return NextResponse.json({
      user,
      vapiData,
      metrics: {
        lifetimeMinutes,
        currentMonthMinutes,
        dateRangeMinutes,
        firstMonthMinutes,
      },
      subscriptionStartDate,
    });

  } catch (error: any) {
    console.error('Error in find-customer route:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
