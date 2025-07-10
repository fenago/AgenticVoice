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

// POST /api/admin/stripe/sync-customer - Create/update Stripe customer
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['ADMIN', 'GOD_MODE'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { userId, forceUpdate = false } = await request.json();

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

    let stripeCustomer;

    // Check if user already has a Stripe customer ID
    if (user.customerId && !forceUpdate) {
      try {
        stripeCustomer = await stripe.customers.retrieve(user.customerId);
        if (stripeCustomer.deleted) {
          // Customer was deleted, create new one
          stripeCustomer = null;
        }
      } catch (error) {
        console.error('Error retrieving existing Stripe customer:', error);
        stripeCustomer = null;
      }
    }

    // Create new customer if needed
    if (!stripeCustomer) {
      stripeCustomer = await stripe.customers.create({
        email: user.email,
        name: user.name || user.email,
        metadata: {
          userId: user._id.toString(),
          role: user.role || 'FREE',
          source: 'AgenticVoice_Admin',
          syncedAt: new Date().toISOString(),
        },
      });

      // Update user with Stripe customer ID
      await User.findByIdAndUpdate(userId, {
        customerId: stripeCustomer.id,
        updatedAt: new Date(),
      });
    } else if (forceUpdate) {
      // Update existing customer
      stripeCustomer = await stripe.customers.update(stripeCustomer.id, {
        email: user.email,
        name: user.name || user.email,
        metadata: {
          userId: user._id.toString(),
          role: user.role || 'FREE',
          source: 'AgenticVoice_Admin',
          syncedAt: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      customer: {
        id: stripeCustomer.id,
        email: (stripeCustomer as Stripe.Customer).email,
        name: (stripeCustomer as Stripe.Customer).name,
        created: (stripeCustomer as Stripe.Customer).created,
        metadata: (stripeCustomer as Stripe.Customer).metadata,
      },
      message: forceUpdate ? 'Customer updated successfully' : 'Customer synced successfully',
    });

  } catch (error) {
    console.error('Stripe customer sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync Stripe customer', details: error.message },
      { status: 500 }
    );
  }
}
