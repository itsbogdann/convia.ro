import { Injectable, OnModuleInit, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

export interface CreateCheckoutSessionParams {
  teamId: string;
  teamName: string;
  email: string;
  priceId: string;
  planId: string;
  billingCycle: 'monthly' | 'yearly';
  customerId?: string;
}

export interface StripeCustomerData {
  email: string;
  name: string;
  metadata: {
    teamId: string;
  };
}

@Injectable()
export class StripeService implements OnModuleInit {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const secretKey = this.configService.get<string>('stripe.secretKey');

    if (!secretKey) {
      this.logger.warn('Stripe secret key not configured - payment features will be disabled');
      return;
    }

    this.stripe = new Stripe(secretKey, {
      // Note: Dashboard uses 2026-03-25.dahlia — webhooks arrive in dashboard version.
      // Using 'as any' because the stripe SDK types may not include the dashboard version yet.
      apiVersion: '2025-02-24.acacia' as any,
      typescript: true,
    });

    this.logger.log('Stripe service initialized');
  }

  isConfigured(): boolean {
    return !!this.stripe;
  }

  getStripe(): Stripe {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured. Please set STRIPE_SECRET_KEY.');
    }
    return this.stripe;
  }

  // ============================================
  // CUSTOMERS
  // ============================================

  async createCustomer(data: StripeCustomerData): Promise<Stripe.Customer> {
    return this.getStripe().customers.create({
      email: data.email,
      name: data.name,
      metadata: data.metadata,
    });
  }

  async getCustomer(customerId: string): Promise<Stripe.Customer | Stripe.DeletedCustomer> {
    return this.getStripe().customers.retrieve(customerId);
  }

  async updateCustomer(
    customerId: string,
    data: Partial<Stripe.CustomerUpdateParams>,
  ): Promise<Stripe.Customer> {
    return this.getStripe().customers.update(customerId, data);
  }

  async getOrCreateCustomer(
    email: string,
    name: string,
    teamId: string,
    existingCustomerId?: string,
  ): Promise<Stripe.Customer> {
    // If we have an existing customer ID, try to retrieve it
    if (existingCustomerId) {
      try {
        const customer = await this.getCustomer(existingCustomerId);
        if (!('deleted' in customer)) {
          return customer;
        }
      } catch (error) {
        this.logger.warn(`Customer ${existingCustomerId} not found, creating new one`);
      }
    }

    // Search for existing customer by email
    const existingCustomers = await this.getStripe().customers.list({
      email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      const customer = existingCustomers.data[0];
      // Update metadata if needed
      if (customer.metadata.teamId !== teamId) {
        return this.updateCustomer(customer.id, {
          metadata: { ...customer.metadata, teamId },
        });
      }
      return customer;
    }

    // Create new customer
    return this.createCustomer({
      email,
      name,
      metadata: { teamId },
    });
  }

  // ============================================
  // CHECKOUT SESSIONS
  // ============================================

  async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<Stripe.Checkout.Session> {
    const successUrl = this.configService.get<string>('stripe.successUrl');
    const cancelUrl = this.configService.get<string>('stripe.cancelUrl');

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: params.priceId,
          quantity: 1,
        },
      ],
      success_url: `${successUrl}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        teamId: params.teamId,
        planId: params.planId,
        billingCycle: params.billingCycle,
      },
      subscription_data: {
        metadata: {
          teamId: params.teamId,
          planId: params.planId,
          billingCycle: params.billingCycle,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    };

    // Use existing customer or create via email
    if (params.customerId) {
      sessionParams.customer = params.customerId;
    } else {
      sessionParams.customer_email = params.email;
    }

    return this.getStripe().checkout.sessions.create(sessionParams);
  }

  async getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    return this.getStripe().checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    });
  }

  // ============================================
  // SUBSCRIPTIONS
  // ============================================

  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return this.getStripe().subscriptions.retrieve(subscriptionId, {
      expand: ['default_payment_method', 'latest_invoice'],
    });
  }

  async updateSubscription(
    subscriptionId: string,
    params: Stripe.SubscriptionUpdateParams,
  ): Promise<Stripe.Subscription> {
    return this.getStripe().subscriptions.update(subscriptionId, params);
  }

  async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd = true,
  ): Promise<Stripe.Subscription> {
    if (cancelAtPeriodEnd) {
      return this.getStripe().subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    }
    return this.getStripe().subscriptions.cancel(subscriptionId);
  }

  async reactivateSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return this.getStripe().subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
  }

  async changeSubscriptionPlan(
    subscriptionId: string,
    newPriceId: string,
  ): Promise<Stripe.Subscription> {
    const subscription = await this.getSubscription(subscriptionId);

    return this.getStripe().subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: 'create_prorations',
    });
  }

  // ============================================
  // BILLING PORTAL
  // ============================================

  async createBillingPortalSession(
    customerId: string,
    returnUrl: string,
  ): Promise<Stripe.BillingPortal.Session> {
    return this.getStripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }

  // ============================================
  // INVOICES
  // ============================================

  async listInvoices(customerId: string, limit = 12): Promise<Stripe.ApiList<Stripe.Invoice>> {
    return this.getStripe().invoices.list({
      customer: customerId,
      limit,
      expand: ['data.subscription'],
    });
  }

  async getInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    return this.getStripe().invoices.retrieve(invoiceId);
  }

  async getUpcomingInvoice(customerId: string): Promise<Stripe.UpcomingInvoice | null> {
    try {
      return await this.getStripe().invoices.retrieveUpcoming({
        customer: customerId,
      });
    } catch (error) {
      // No upcoming invoice (no active subscription)
      return null;
    }
  }

  // ============================================
  // PAYMENT METHODS
  // ============================================

  async listPaymentMethods(customerId: string): Promise<Stripe.ApiList<Stripe.PaymentMethod>> {
    return this.getStripe().paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
  }

  async setDefaultPaymentMethod(
    customerId: string,
    paymentMethodId: string,
  ): Promise<Stripe.Customer> {
    return this.getStripe().customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
  }

  async detachPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    return this.getStripe().paymentMethods.detach(paymentMethodId);
  }

  async createSetupIntent(customerId: string): Promise<Stripe.SetupIntent> {
    return this.getStripe().setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
    });
  }

  // ============================================
  // PRODUCTS & PRICES
  // ============================================

  async createProduct(name: string, metadata: Record<string, string>): Promise<Stripe.Product> {
    return this.getStripe().products.create({
      name,
      metadata,
    });
  }

  async createPrice(params: {
    productId: string;
    unitAmount: number;
    currency: string;
    interval: 'month' | 'year';
    metadata?: Record<string, string>;
  }): Promise<Stripe.Price> {
    return this.getStripe().prices.create({
      product: params.productId,
      unit_amount: params.unitAmount,
      currency: params.currency,
      recurring: {
        interval: params.interval,
      },
      metadata: params.metadata,
    });
  }

  async getProduct(productId: string): Promise<Stripe.Product> {
    return this.getStripe().products.retrieve(productId);
  }

  async getPrice(priceId: string): Promise<Stripe.Price> {
    return this.getStripe().prices.retrieve(priceId);
  }

  // ============================================
  // WEBHOOKS
  // ============================================

  constructWebhookEvent(
    payload: Buffer,
    signature: string,
  ): Stripe.Event {
    const webhookSecret = this.configService.get<string>('stripe.webhookSecret');

    if (!webhookSecret) {
      throw new BadRequestException('Stripe webhook secret not configured');
    }

    return this.getStripe().webhooks.constructEvent(payload, signature, webhookSecret);
  }
}
