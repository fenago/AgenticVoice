import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth-config';
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';
import { ObjectId } from 'mongodb';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
});

// GET /api/admin/stripe/usage/[userId] - Get Stripe usage data
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['ADMIN', 'GOD_MODE'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { userId } = params;
    const url = new URL(request.url);
    const months = parseInt(url.searchParams.get('months') || '3');

    // Validate userId is a valid ObjectId
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
    }

    await connectMongo();

    // Get user from database
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.customerId) {
      return NextResponse.json({
        success: true,
        usage: null,
        message: 'User has no Stripe customer ID',
      });
    }

    try {
      // Get customer's subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: user.customerId,
        status: 'all',
        expand: ['data.items.data.price'],
      });

      // Get usage records for metered billing
      const usageData = [];
      
      for (const subscription of subscriptions.data) {
        for (const item of subscription.items.data) {
          if (item.price.billing_scheme === 'per_unit') {
            try {
              const usageRecords = await stripe.subscriptionItems.listUsageRecordSummaries(
                item.id,
                {
                  limit: 100,
                }
              );
              
              usageData.push({
                subscriptionId: subscription.id,
                itemId: item.id,
                priceId: item.price.id,
                productName: item.price.product as string,
                usageRecords: usageRecords.data,
              });
            } catch (usageError) {
              console.warn(`No usage records for subscription item ${item.id}`);
            }
          }
        }
      }

      // Get recent invoices with usage details
      const invoices = await stripe.invoices.list({
        customer: user.customerId,
        limit: months * 2, // Approximately 2 invoices per month
        expand: ['data.lines.data'],
      });

      // Calculate usage summary
      const usageSummary = {
        totalInvoices: invoices.data.length,
        totalAmountPaid: invoices.data
          .filter(inv => inv.status === 'paid')
          .reduce((sum, inv) => sum + inv.amount_paid, 0) / 100, // Convert from cents
        totalAmountDue: invoices.data
          .filter(inv => inv.status === 'open')
          .reduce((sum, inv) => sum + inv.amount_due, 0) / 100,
        currentMRR: 0, // Monthly Recurring Revenue
        usageCharges: 0,
      };

      // Calculate MRR from active subscriptions
      for (const subscription of subscriptions.data) {
        if (subscription.status === 'active') {
          for (const item of subscription.items.data) {
            const price = item.price;
            if (price.recurring?.interval === 'month') {
              usageSummary.currentMRR += (price.unit_amount || 0) / 100;
            } else if (price.recurring?.interval === 'year') {
              usageSummary.currentMRR += ((price.unit_amount || 0) / 100) / 12;
            }
          }
        }
      }

      // Calculate usage charges from recent invoices
      usageSummary.usageCharges = invoices.data
        .reduce((sum, invoice) => {
          const usageLines = invoice.lines.data.filter(line => 
            line.type === 'invoiceitem' || line.proration
          );
          return sum + usageLines.reduce((lineSum, line) => 
            lineSum + (line.amount / 100), 0
          );
        }, 0);

      return NextResponse.json({
        success: true,
        usage: {
          customerId: user.customerId,
          subscriptions: subscriptions.data.map(sub => ({
            id: sub.id,
            status: sub.status,
            current_period_start: sub.current_period_start,
            current_period_end: sub.current_period_end,
            items: sub.items.data.map(item => ({
              id: item.id,
              price: {
                id: item.price.id,
                unit_amount: item.price.unit_amount,
                currency: item.price.currency,
                billing_scheme: item.price.billing_scheme,
                recurring: item.price.recurring,
              },
              quantity: item.quantity,
            })),
          })),
          usageRecords: usageData,
          invoices: invoices.data.map(inv => ({
            id: inv.id,
            status: inv.status,
            amount_paid: inv.amount_paid / 100,
            amount_due: inv.amount_due / 100,
            created: inv.created,
            period_start: inv.period_start,
            period_end: inv.period_end,
            lines: inv.lines.data.length,
          })),
          summary: usageSummary,
        },
      });

    } catch (stripeError: any) {
      if (stripeError.code === 'resource_missing') {
        return NextResponse.json({
          success: true,
          usage: null,
          message: 'Stripe customer not found',
        });
      }
      throw stripeError;
    }

  } catch (error) {
    console.error('Get Stripe usage error:', error);
    return NextResponse.json(
      { error: 'Failed to get Stripe usage data', details: error.message },
      { status: 500 }
    );
  }
}
