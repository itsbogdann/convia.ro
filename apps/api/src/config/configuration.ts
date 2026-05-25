export default () => ({
  // Application
  app: {
    port: parseInt(process.env.API_PORT || '9002', 10),
    env: process.env.NODE_ENV || 'development',
    // Convia port layout: landing 9000, web 9001, api 9002, widget 9003
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || [
      'http://localhost:9000',
      'http://localhost:9001',
      'http://localhost:9003',
    ],
  },

  // Supabase
  // New API keys: sb_publishable_... (client-safe) and sb_secret_... (backend only).
  supabase: {
    url: process.env.SUPABASE_URL,
    publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY,
    secretKey: process.env.SUPABASE_SECRET_KEY,
    jwtSecret: process.env.SUPABASE_JWT_SECRET,
    // Legacy keys (still accepted for compatibility)
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },

  // Database (TypeORM connection to Supabase PostgreSQL)
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '6543', 10),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME || 'postgres',
    ssl: process.env.DATABASE_SSL !== 'false', // default true for Supabase
  },

  // AI providers
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    defaultModel: process.env.OPENAI_DEFAULT_MODEL || 'gpt-4o-mini',
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    defaultModel: process.env.ANTHROPIC_DEFAULT_MODEL || 'claude-3-5-haiku-20241022',
  },

  // Provider selection (Convia defaults to Supabase for everything)
  providers: {
    vector: process.env.VECTOR_PROVIDER || 'supabase', // 'supabase' (pgvector) | 'pinecone'
    realtime: process.env.REALTIME_PROVIDER || 'supabase', // 'supabase' | 'pusher'
  },

  // Optional: Pusher (only used if REALTIME_PROVIDER=pusher)
  pusher: {
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER || 'eu',
  },

  // Optional: Pinecone (only used if VECTOR_PROVIDER=pinecone)
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY,
    host: process.env.PINECONE_HOST,
    indexName: process.env.PINECONE_INDEX || 'convia',
  },

  // Email (transactional)
  email: {
    apiKey: process.env.EMAIL_PROVIDER_API_KEY,
    fromEmail: process.env.EMAIL_FROM || 'salut@convia.ro',
  },

  // Stripe (billing)
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    successUrl:
      process.env.STRIPE_SUCCESS_URL ||
      'http://localhost:9001/settings/billing?success=true',
    cancelUrl:
      process.env.STRIPE_CANCEL_URL ||
      'http://localhost:9001/settings/billing?canceled=true',
    // Convia plan price IDs (created by the Stripe setup script)
    prices: {
      businessMonthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY,
      businessYearly: process.env.STRIPE_PRICE_BUSINESS_YEARLY,
      businessOverage: process.env.STRIPE_PRICE_BUSINESS_OVERAGE,
      premiumMonthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY,
      premiumYearly: process.env.STRIPE_PRICE_PREMIUM_YEARLY,
      premiumOverage: process.env.STRIPE_PRICE_PREMIUM_OVERAGE,
    },
    meters: {
      business: process.env.STRIPE_METER_BUSINESS,
      premium: process.env.STRIPE_METER_PREMIUM,
    },
  },

  // Credential encryption (used for channel tokens, WhatsApp credentials, etc.)
  encryption: {
    credentialKey: process.env.CREDENTIAL_ENCRYPTION_KEY,
  },

  // Convia-specific
  convia: {
    // Per-session billing rule: a new conversation starts when the previous
    // conversation's last_activity_at is older than this threshold.
    sessionTimeoutMinutes: parseInt(
      process.env.CONVERSATION_SESSION_TIMEOUT_MINUTES || '30',
      10,
    ),
    // Free plan hard cap (matches usage_periods.included_conversations for free teams)
    freePlanCap: parseInt(process.env.FREE_PLAN_CONVERSATION_CAP || '100', 10),
  },

  // App URLs (for emails, redirects)
  urls: {
    landing: process.env.NEXT_PUBLIC_LANDING_URL || 'http://localhost:9000',
    web: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9001',
    api: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9002',
    widget: process.env.NEXT_PUBLIC_WIDGET_URL || 'http://localhost:9003',
  },
});
