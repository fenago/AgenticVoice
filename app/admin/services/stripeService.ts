import Stripe from 'stripe';

class StripeService {
  private stripe: Stripe;

  constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables.');
    }
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-08-16',
    });
  }

  async createCustomer(customerData: {
    email: string;
    name: string;
    mongoUserId: string;
    role: string;
    industryType: string;
  }): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.create({
        email: customerData.email,
        name: customerData.name,
        metadata: {
          mongoUserId: customerData.mongoUserId,
          role: customerData.role,
          industry: customerData.industryType,
        },
      });
      return customer;
    } catch (error: any) {
      console.error('Failed to create Stripe customer:', error.message);
      throw new Error('Could not create customer in Stripe.');
    }
  }

  async getCustomer(customerId: string): Promise<Stripe.Customer | null> {
    try {
      const customer = await this.stripe.customers.retrieve(customerId);
      if (customer.deleted) {
        return null;
      }
      return customer as Stripe.Customer;
    } catch (error: any) {
      if (error.type === 'StripeInvalidRequestError') {
        return null;
      }
      console.error(`Failed to retrieve Stripe customer ${customerId}:`, error.message);
      throw new Error('Could not retrieve customer from Stripe.');
    }
  }

  async updateCustomer(
    customerId: string,
    data: { name?: string; role?: string; industryType?: string }
  ): Promise<Stripe.Customer> {
    try {
      const updateData: Stripe.CustomerUpdateParams = {};
      if (data.name) {
        updateData.name = data.name;
      }

      const metadata: Stripe.MetadataParam = {};
      if (data.role) {
        metadata.role = data.role;
      }
      if (data.industryType) {
        metadata.industry = data.industryType;
      }

      if (Object.keys(metadata).length > 0) {
        updateData.metadata = metadata;
      }

      const customer = await this.stripe.customers.update(customerId, updateData);
      return customer;
    } catch (error: any) {
      console.error(`Failed to update Stripe customer ${customerId}:`, error.message);
      throw new Error('Could not update customer in Stripe.');
    }
  }

  async listAllCustomers(): Promise<Stripe.Customer[]> {
    try {
      const customers: Stripe.Customer[] = [];
      let hasMore = true;
      let startingAfter: string | undefined = undefined;

      while (hasMore) {
        const result: Stripe.ApiList<Stripe.Customer> = await this.stripe.customers.list({
          limit: 100,
          starting_after: startingAfter,
        });

        customers.push(...result.data);
        hasMore = result.has_more;
        if (hasMore && result.data.length > 0) {
          startingAfter = result.data[result.data.length - 1].id;
        }
      }

      return customers.filter(customer => (customer as any).deleted !== true);
    } catch (error: any) {
      console.error('Failed to list all Stripe customers:', error.message);
      throw new Error('Could not retrieve customers from Stripe.');
    }
  }
}

export const stripeService = new StripeService();
