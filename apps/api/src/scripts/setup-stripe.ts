/**
 * Convia Stripe setup script.
 *
 * Creates the 3 products + their prices + metered overage prices + meters
 * in your Stripe account. Run once when setting up a new Stripe environment
 * (test mode now, live mode later).
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_... bun run src/scripts/setup-stripe.ts
 *
 * The script is idempotent: it looks for existing products by lookup_key
 * before creating. Re-running won't duplicate, but it will print all the
 * IDs you need to paste into `.env`.
 */

import Stripe from 'stripe';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  console.error('❌ STRIPE_SECRET_KEY is not set');
  process.exit(1);
}

const stripe = new Stripe(secretKey, { apiVersion: '2024-12-18.acacia' as any });

const CURRENCY = 'ron';

interface PlanConfig {
  id: string;
  name: string;
  description: string;
  monthlyAmountRon: number;
  yearlyAmountRonPerMonth: number;
  includedConversations: number;
  overageAmountRonPerConv: number;
  meterEventName: string;
}

const PLANS: PlanConfig[] = [
  {
    id: 'business',
    name: 'Convia Business',
    description: '1.000 conversații/lună incluse + 0,25 RON per conversație suplimentară',
    monthlyAmountRon: 149,
    yearlyAmountRonPerMonth: 119,
    includedConversations: 1000,
    overageAmountRonPerConv: 0.25,
    meterEventName: 'convia_business_overage',
  },
  {
    id: 'premium',
    name: 'Convia Premium',
    description: '5.000 conversații/lună incluse + 0,12 RON per conversație suplimentară',
    monthlyAmountRon: 349,
    yearlyAmountRonPerMonth: 279,
    includedConversations: 5000,
    overageAmountRonPerConv: 0.12,
    meterEventName: 'convia_premium_overage',
  },
];

async function findProduct(lookupKey: string): Promise<Stripe.Product | null> {
  const products = await stripe.products.list({ active: true, limit: 100 });
  return (
    products.data.find((p) => p.metadata?.lookup_key === lookupKey) || null
  );
}

async function findPrice(lookupKey: string): Promise<Stripe.Price | null> {
  const prices = await stripe.prices.list({ active: true, limit: 100 });
  return prices.data.find((p) => p.metadata?.lookup_key === lookupKey) || null;
}

async function findMeter(eventName: string): Promise<Stripe.Billing.Meter | null> {
  const meters = await stripe.billing.meters.list({ limit: 100 });
  return meters.data.find((m) => m.event_name === eventName) || null;
}

async function upsertProduct(plan: PlanConfig): Promise<Stripe.Product> {
  const lookupKey = `convia_${plan.id}_product`;
  const existing = await findProduct(lookupKey);
  if (existing) {
    console.log(`✓ Product exists: ${existing.id} (${plan.name})`);
    return existing;
  }
  const product = await stripe.products.create({
    name: plan.name,
    description: plan.description,
    metadata: { lookup_key: lookupKey, plan_id: plan.id },
  });
  console.log(`+ Created product: ${product.id} (${plan.name})`);
  return product;
}

async function upsertMeter(plan: PlanConfig): Promise<Stripe.Billing.Meter> {
  const existing = await findMeter(plan.meterEventName);
  if (existing) {
    console.log(`✓ Meter exists: ${existing.id} (${plan.meterEventName})`);
    return existing;
  }
  const meter = await stripe.billing.meters.create({
    display_name: `${plan.name} — overage`,
    event_name: plan.meterEventName,
    default_aggregation: { formula: 'sum' },
    customer_mapping: {
      event_payload_key: 'stripe_customer_id',
      type: 'by_id',
    },
    value_settings: {
      event_payload_key: 'value',
    },
  });
  console.log(`+ Created meter: ${meter.id} (${plan.meterEventName})`);
  return meter;
}

async function upsertPrice(
  product: Stripe.Product,
  lookupKey: string,
  amountRon: number,
  interval: 'month' | 'year',
  meta: Record<string, string> = {},
): Promise<Stripe.Price> {
  const existing = await findPrice(lookupKey);
  if (existing) {
    console.log(`✓ Price exists: ${existing.id} (${lookupKey})`);
    return existing;
  }
  const price = await stripe.prices.create({
    product: product.id,
    currency: CURRENCY,
    unit_amount: Math.round(amountRon * 100),
    recurring: { interval },
    metadata: { lookup_key: lookupKey, ...meta },
  });
  console.log(`+ Created price: ${price.id} (${lookupKey}, ${amountRon} RON / ${interval})`);
  return price;
}

async function upsertMeteredPrice(
  product: Stripe.Product,
  lookupKey: string,
  amountRonPerUnit: number,
  meter: Stripe.Billing.Meter,
): Promise<Stripe.Price> {
  const existing = await findPrice(lookupKey);
  if (existing) {
    console.log(`✓ Metered price exists: ${existing.id} (${lookupKey})`);
    return existing;
  }
  const price = await stripe.prices.create({
    product: product.id,
    currency: CURRENCY,
    unit_amount_decimal: (amountRonPerUnit * 100).toFixed(4),
    recurring: {
      interval: 'month',
      usage_type: 'metered',
      meter: meter.id,
    } as any,
    metadata: { lookup_key: lookupKey, meter_id: meter.id },
  });
  console.log(
    `+ Created metered price: ${price.id} (${lookupKey}, ${amountRonPerUnit} RON/unit)`,
  );
  return price;
}

async function main(): Promise<void> {
  console.log('\n=== Convia Stripe setup ===');
  console.log(`Currency: ${CURRENCY.toUpperCase()}\n`);

  const envOut: Record<string, string> = {};

  for (const plan of PLANS) {
    console.log(`\n--- ${plan.name} ---`);
    const product = await upsertProduct(plan);
    const meter = await upsertMeter(plan);
    const monthly = await upsertPrice(
      product,
      `convia_${plan.id}_monthly`,
      plan.monthlyAmountRon,
      'month',
      { plan_id: plan.id, cycle: 'monthly' },
    );
    const yearly = await upsertPrice(
      product,
      `convia_${plan.id}_yearly`,
      plan.yearlyAmountRonPerMonth * 12,
      'year',
      { plan_id: plan.id, cycle: 'yearly' },
    );
    const overage = await upsertMeteredPrice(
      product,
      `convia_${plan.id}_overage`,
      plan.overageAmountRonPerConv,
      meter,
    );

    const upper = plan.id.toUpperCase();
    envOut[`STRIPE_PRICE_${upper}_MONTHLY`] = monthly.id;
    envOut[`STRIPE_PRICE_${upper}_YEARLY`] = yearly.id;
    envOut[`STRIPE_PRICE_${upper}_OVERAGE`] = overage.id;
    envOut[`STRIPE_METER_${upper}`] = meter.id;
  }

  console.log('\n=== Paste into your .env ===\n');
  for (const [key, value] of Object.entries(envOut)) {
    console.log(`${key}=${value}`);
  }
  console.log('\nDone.\n');
}

main().catch((err) => {
  console.error('\n❌ Setup failed:', err);
  process.exit(1);
});
