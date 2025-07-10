import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';
import HubSpotService from '@/libs/hubspot';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// POST /api/webhooks/stripe - Handle Stripe webhook events
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('No Stripe signature found');
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    await connectMongo();

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'customer.created':
      case 'customer.updated':
        await handleCustomerChange(event.data.object as Stripe.Customer);
        break;

      case 'customer.deleted':
        await handleCustomerDeleted(event.data.object as Stripe.Customer);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed', details: error.message },
      { status: 500 }
    );
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  try {
    console.log('Processing subscription change:', subscription.id);

    const user = await User.findOne({ customerId: subscription.customer as string });
    if (!user) {
      console.error('User not found for customer:', subscription.customer);
      return;
    }

    const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'GOD_MODE'];
    const isUserAdmin = adminRoles.includes(user.role);

    let newRole = user.role;
    let vapiQuota = user.vapi?.usage?.monthlyLimit || 10;

    if (subscription.status === 'active' && subscription.items.data.length > 0) {
      const priceId = subscription.items.data[0].price.id;
      const priceConfig: { [key: string]: { role: string; vapiMinutes: number } } = {
        [process.env.STRIPE_PRICE_ID_STARTER!]: { role: 'STARTER', vapiMinutes: 100 },
        [process.env.STRIPE_PRICE_ID_PRO!]: { role: 'PRO', vapiMinutes: 500 },
        [process.env.STRIPE_PRICE_ID_ENTERPRISE!]: { role: 'ENTERPRISE', vapiMinutes: 2000 },
      };

      const config = priceConfig[priceId];
      if (config) {
        if (!isUserAdmin) {
          newRole = config.role;
        } else {
          console.log(`User ${user.email} is an admin (${user.role}). Skipping role update.`);
        }
        vapiQuota = config.vapiMinutes;
      }
    }

    user.role = newRole;
    user.subscriptionStatus = subscription.status;
    user.subscriptionId = subscription.id;
    if (user.vapi?.usage) {
      user.vapi.usage.monthlyLimit = vapiQuota;
    }

    // HubSpot Integration
    try {
      const hubspotService = new HubSpotService();
      const hubspotContactId = await hubspotService.syncUserToContact(user);
      if (hubspotContactId) {
        user.hubspotContactId = hubspotContactId;
      }

      const hubspotDealId = await hubspotService.createOrUpdateDealForSubscription(user, subscription);
      if (hubspotDealId) {
        user.hubspotDealId = hubspotDealId;
      }
      console.log(`HubSpot sync successful for ${user.email}`);
    } catch (error) {
      console.error(`HubSpot integration failed for ${user.email}:`, error);
    }

    await user.save();
    console.log(`User ${user.email} updated: role=${newRole}, vapiQuota=${vapiQuota}, status=${subscription.status}`);

  } catch (error) {
    console.error('Error handling subscription change:', error);
  }
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  try {
    console.log('Processing subscription cancellation:', subscription.id);

    const user = await User.findOne({ customerId: subscription.customer as string });
    
    if (!user) {
      console.error('User not found for customer:', subscription.customer);
      return;
    }

    // HubSpot Integration: Update deal to 'closedlost'
    try {
      if (user.hubspotContactId && user.hubspotDealId) {
        const hubspotService = new HubSpotService();
        // The subscription object still contains the necessary details for the deal update
        await hubspotService.createOrUpdateDealForSubscription(user, { ...subscription, status: 'canceled' });
        console.log(`Updated HubSpot deal ${user.hubspotDealId} to closed/lost for user ${user.email}`);
      }
    } catch (error) {
      console.error(`HubSpot deal update failed on cancellation for ${user.email}:`, error);
    }

    // Downgrade to FREE tier
    user.role = 'FREE';
    user.subscriptionStatus = 'canceled';
    user.subscriptionId = null;
    user.vapi.usage.monthlyLimit = 10; // FREE tier limit
    await user.save();

    console.log(`User ${user.email} downgraded to FREE tier`);

  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    console.log('Processing successful payment:', invoice.id);

    const user = await User.findOne({ customerId: invoice.customer as string });
    
    if (!user) {
      console.error('User not found for customer:', invoice.customer);
      return;
    }

    // Update last payment date and ensure account is active
    await User.findByIdAndUpdate(user._id, {
      lastPaymentDate: new Date(invoice.created * 1000),
      accountStatus: 'ACTIVE',
      updatedAt: new Date(),
    });

    console.log(`Payment recorded for user ${user.email}: $${invoice.amount_paid / 100}`);

  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    console.log('Processing failed payment:', invoice.id);

    const user = await User.findOne({ customerId: invoice.customer as string });
    
    if (!user) {
      console.error('User not found for customer:', invoice.customer);
      return;
    }

    // Mark account as having payment issues
    await User.findByIdAndUpdate(user._id, {
      accountStatus: 'PAYMENT_FAILED',
      updatedAt: new Date(),
    });

    console.log(`Payment failed for user ${user.email}`);

  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

async function handleCustomerChange(customer: Stripe.Customer) {
  try {
    console.log('Processing customer change:', customer.id);

    const user = await User.findOne({ customerId: customer.id });
    
    if (user) {
      // Update user details from Stripe
      await User.findByIdAndUpdate(user._id, {
        email: customer.email || user.email,
        name: customer.name || user.name,
        updatedAt: new Date(),
      });
    }

  } catch (error) {
    console.error('Error handling customer change:', error);
  }
}

async function handleCustomerDeleted(customer: Stripe.Customer) {
  try {
    console.log('Processing customer deletion:', customer.id);

    const user = await User.findOne({ customerId: customer.id });
    
    if (user) {
      // Clear Stripe customer ID but keep user record
      await User.findByIdAndUpdate(user._id, {
        customerId: null,
        role: 'FREE',
        subscriptionStatus: null,
        subscriptionId: null,
        'vapi.usage.monthlyLimit': 10,
        updatedAt: new Date(),
      });
    }

  } catch (error) {
    console.error('Error handling customer deletion:', error);
  }
}
