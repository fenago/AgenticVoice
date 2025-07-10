import Stripe from "stripe";

// Initialize Stripe once and export it for use in all functions
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-08-16",
  typescript: true,
});

interface CreateCheckoutParams {
  priceId: string;
  mode: "payment" | "subscription";
  successUrl: string;
  cancelUrl: string;
  couponId?: string | null;
  clientReferenceId?: string;
  user?: {
    customerId?: string;
    email?: string;
  };
}

interface CreateCustomerPortalParams {
  customerId: string;
  returnUrl: string;
}

/**
 * Retrieves the start date of a customer's earliest subscription.
 * @param customerId The Stripe customer ID.
 * @returns A Date object representing the start date, or null if not found.
 */
export const getSubscriptionStartDate = async (customerId: string): Promise<Date | null> => {
  try {
    const customer = await stripe.customers.retrieve(customerId, {
      expand: ['subscriptions'],
    });

    // Definitive type guard to ensure the customer is not deleted
    if ('deleted' in customer && customer.deleted) {
      console.error(`Stripe customer ${customerId} is deleted.`);
      return null;
    }
    
    // Type assertion after deleted check
    const activeCustomer = customer as Stripe.Customer;
    const subscriptions = activeCustomer.subscriptions?.data;

    if (subscriptions && subscriptions.length > 0) {
      subscriptions.sort((a: Stripe.Subscription, b: Stripe.Subscription) => a.created - b.created);
      const firstSubscription = subscriptions[0];
      return new Date(firstSubscription.start_date * 1000);
    }

    return null;
  } catch (error) {
    console.error("Stripe API Error - getSubscriptionStartDate:", error);
    return null;
  }
};

// This is used to create a Stripe Checkout for one-time payments. It's usually triggered with the <ButtonCheckout /> component. Webhooks are used to update the user's state in the database.
export const createCheckout = async ({
  user,
  mode,
  clientReferenceId,
  successUrl,
  cancelUrl,
  priceId,
  couponId,
}: CreateCheckoutParams): Promise<string | null> => {
  try {
    const extraParams: {
      customer?: string;
      customer_creation?: "always";
      customer_email?: string;
      invoice_creation?: { enabled: boolean };
      payment_intent_data?: { setup_future_usage: "on_session" };
      tax_id_collection?: { enabled: boolean };
    } = {};

    if (user?.customerId) {
      extraParams.customer = user.customerId;
    } else {
      // Create a new customer for the checkout session
      extraParams.customer_creation = "always";

      if (mode === "payment") {
        // The option below costs 0.4% (up to $2) per invoice. Alternatively, you can use https://zenvoice.io/ to create unlimited invoices automatically.
        // extraParams.invoice_creation = { enabled: true };
        extraParams.payment_intent_data = { setup_future_usage: "on_session" };
      }
      if (user?.email) {
        extraParams.customer_email = user.email;
      }
      extraParams.tax_id_collection = { enabled: true };
    }

    const stripeSession = await stripe.checkout.sessions.create({
      mode,
      allow_promotion_codes: true,
      client_reference_id: clientReferenceId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      discounts: couponId
        ? [
            {
              coupon: couponId,
            },
          ]
        : [],
      success_url: successUrl,
      cancel_url: cancelUrl,
      ...extraParams,
    });

    return stripeSession.url;
  } catch (e) {
    console.error(e);
    return null;
  }
};

// This is used to create Customer Portal sessions, so users can manage their subscriptions (payment methods, cancel, etc..)
export const createCustomerPortal = async ({
  customerId,
  returnUrl,
}: CreateCustomerPortalParams): Promise<string | null> => {
  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return portalSession.url;
  } catch (e) {
    console.error(e);
    return null;
  }
};

// This is used to get the user checkout session and populate the data so we get the planId the user subscribed to
export const findCheckoutSession = async (sessionId: string) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    return session;
  } catch (e) {
    console.error(e);
    return null;
  }
};
