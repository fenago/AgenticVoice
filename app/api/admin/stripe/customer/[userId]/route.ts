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

// GET /api/admin/stripe/customer/[userId] - Get Stripe customer details
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
        customer: null,
        message: 'User has no Stripe customer ID',
      });
    }

    try {
      // Get customer from Stripe
      const stripeCustomer = await stripe.customers.retrieve(user.customerId, {
        expand: ['subscriptions', 'default_source'],
      });

      if (stripeCustomer.deleted) {
        return NextResponse.json({
          success: true,
          customer: null,
          message: 'Stripe customer was deleted',
        });
      }

      // Get customer's payment methods
      const paymentMethods = await stripe.paymentMethods.list({
        customer: user.customerId,
        type: 'card',
      });

      // Get customer's invoices
      const invoices = await stripe.invoices.list({
        customer: user.customerId,
        limit: 10,
      });

      return NextResponse.json({
        success: true,
        customer: {
          id: stripeCustomer.id,
          email: (stripeCustomer as Stripe.Customer).email,
          name: (stripeCustomer as Stripe.Customer).name,
          phone: (stripeCustomer as Stripe.Customer).phone,
          created: (stripeCustomer as Stripe.Customer).created,
          currency: (stripeCustomer as Stripe.Customer).currency,
          balance: (stripeCustomer as Stripe.Customer).balance,
          delinquent: (stripeCustomer as Stripe.Customer).delinquent,
          metadata: (stripeCustomer as Stripe.Customer).metadata,
          subscriptions: (stripeCustomer as Stripe.Customer).subscriptions?.data || [],
          paymentMethods: paymentMethods.data,
          invoices: invoices.data,
          defaultSource: (stripeCustomer as Stripe.Customer).default_source,
        },
      });

    } catch (stripeError: any) {
      if (stripeError.code === 'resource_missing') {
        return NextResponse.json({
          success: true,
          customer: null,
          message: 'Stripe customer not found',
        });
      }
      throw stripeError;
    }

  } catch (error) {
    console.error('Get Stripe customer error:', error);
    return NextResponse.json(
      { error: 'Failed to get Stripe customer', details: error.message },
      { status: 500 }
    );
  }
}
