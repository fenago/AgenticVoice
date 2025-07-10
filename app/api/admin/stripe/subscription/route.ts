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

// POST /api/admin/stripe/subscription - Create/update subscription
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['ADMIN', 'GOD_MODE'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { 
      userId, 
      priceId, 
      action = 'create', // 'create', 'update', 'cancel'
      subscriptionId,
      cancelAtPeriodEnd = false 
    } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

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
      return NextResponse.json(
        { error: 'User has no Stripe customer ID. Please sync customer first.' },
        { status: 400 }
      );
    }

    let subscription;

    switch (action) {
      case 'create':
        if (!priceId) {
          return NextResponse.json(
            { error: 'Price ID is required for creating subscription' },
            { status: 400 }
          );
        }

        subscription = await stripe.subscriptions.create({
          customer: user.customerId,
          items: [{ price: priceId }],
          payment_behavior: 'default_incomplete',
          expand: ['latest_invoice.payment_intent'],
          metadata: {
            userId: user._id.toString(),
            userRole: user.role || 'FREE',
            source: 'AgenticVoice_Admin',
          },
        });
        break;

      case 'update':
        if (!subscriptionId || !priceId) {
          return NextResponse.json(
            { error: 'Subscription ID and Price ID are required for updating' },
            { status: 400 }
          );
        }

        const existingSubscription = await stripe.subscriptions.retrieve(subscriptionId);
        
        subscription = await stripe.subscriptions.update(subscriptionId, {
          items: [{
            id: existingSubscription.items.data[0].id,
            price: priceId,
          }],
          metadata: {
            userId: user._id.toString(),
            userRole: user.role || 'FREE',
            source: 'AgenticVoice_Admin_Update',
            updatedAt: new Date().toISOString(),
          },
        });
        break;

      case 'cancel':
        if (!subscriptionId) {
          return NextResponse.json(
            { error: 'Subscription ID is required for canceling' },
            { status: 400 }
          );
        }

        if (cancelAtPeriodEnd) {
          subscription = await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true,
            metadata: {
              canceledBy: 'admin',
              canceledAt: new Date().toISOString(),
            },
          });
        } else {
          subscription = await stripe.subscriptions.cancel(subscriptionId);
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: create, update, or cancel' },
          { status: 400 }
        );
    }

    // Update user role based on subscription status
    if (subscription && subscription.status === 'active') {
      const price = await stripe.prices.retrieve(subscription.items.data[0].price.id);
      let newRole = 'FREE';
      
      // Map price to role (you'll need to customize this based on your pricing)
      const priceToRoleMap: { [key: string]: string } = {
        'price_starter': 'STARTER',
        'price_pro': 'PRO', 
        'price_enterprise': 'ENTERPRISE',
      };
      
      newRole = priceToRoleMap[price.id] || 'PRO';
      
      await User.findByIdAndUpdate(userId, {
        role: newRole,
        subscriptionStatus: subscription.status,
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        items: subscription.items.data,
        metadata: subscription.metadata,
      },
      message: `Subscription ${action === 'cancel' ? 'canceled' : action + 'd'} successfully`,
    });

  } catch (error) {
    console.error('Stripe subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to process subscription', details: error.message },
      { status: 500 }
    );
  }
}
