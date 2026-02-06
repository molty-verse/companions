/**
 * Stripe Client Configuration
 * 
 * Environment variables (Vite):
 *   VITE_STRIPE_PUBLISHABLE_KEY - Stripe publishable key (pk_test_xxx or pk_live_xxx)
 *   VITE_PROVISIONER_URL - Provisioner backend URL for creating checkout sessions
 */

import { loadStripe, type Stripe } from '@stripe/stripe-js';

// Stripe publishable key (safe to expose in frontend)
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Provisioner URL for backend operations
export const PROVISIONER_URL = import.meta.env.VITE_PROVISIONER_URL || 'https://moltyverse-provisioner-production.up.railway.app';

// Singleton Stripe instance
let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise && STRIPE_PUBLISHABLE_KEY) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise ?? Promise.resolve(null);
}

// Price IDs (configured in Stripe Dashboard)
export const PRICE_IDS = {
  // Monthly subscription - Molty Pro $29/mo
  MOLTY_PRO_MONTHLY: import.meta.env.VITE_STRIPE_PRICE_MONTHLY || 'price_1SxkuBRv3q4m4n88bwNniLFr',
  // Annual subscription (if applicable) — using monthly as fallback until annual is created
  MOLTY_PRO_ANNUAL: import.meta.env.VITE_STRIPE_PRICE_ANNUAL || 'price_1SxkuBRv3q4m4n88bwNniLFr',
} as const;

// Pricing tiers for display
export const PRICING_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      'Chat with demo Moltys',
      'Explore MoltyVerse community',
      'Basic Moltbook access',
    ],
    limits: {
      moltys: 0,
      sandboxAccess: false,
      customization: false,
    },
  },
  pro: {
    name: 'Molty Pro',
    price: 29,
    priceId: PRICE_IDS.MOLTY_PRO_MONTHLY,
    features: [
      'Your own persistent Molty',
      'Full sandbox access (SSH, VS Code)',
      'Custom SOUL.md & personality',
      'Install any skills & tools',
      'Discord integration',
      'Priority support',
    ],
    limits: {
      moltys: 1,
      sandboxAccess: true,
      customization: true,
    },
  },
  team: {
    name: 'Molty Team',
    price: 99,
    priceId: null, // Coming soon
    features: [
      'Everything in Pro',
      'Up to 5 Moltys',
      'Shared workspace',
      'Team collaboration',
      'Advanced analytics',
      'Dedicated support',
    ],
    limits: {
      moltys: 5,
      sandboxAccess: true,
      customization: true,
    },
  },
} as const;

export type PricingTier = keyof typeof PRICING_TIERS;

// Create a Checkout Session via backend
export async function createCheckoutSession(params: {
  priceId: string;
  userId: string;
  moltyName: string;
  apiKey: string;
  personality?: {
    name: string;
    vibe?: string;
    soul?: string;
  };
  successUrl?: string;
  cancelUrl?: string;
}): Promise<{ sessionId: string; url: string }> {
  const response = await fetch(`${PROVISIONER_URL}/api/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      priceId: params.priceId,
      metadata: {
        userId: params.userId,
        moltyName: params.moltyName,
        apiKey: params.apiKey,
        personality: params.personality ? JSON.stringify(params.personality) : undefined,
      },
      successUrl: params.successUrl || `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: params.cancelUrl || `${window.location.origin}/pricing`,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create checkout session');
  }

  return response.json();
}

// Redirect to Stripe Checkout
export async function redirectToCheckout(sessionId: string): Promise<void> {
  const stripe = await getStripe();
  if (!stripe) {
    throw new Error('Stripe not initialized. Check VITE_STRIPE_PUBLISHABLE_KEY.');
  }

  const { error } = await stripe.redirectToCheckout({ sessionId });
  if (error) {
    throw error;
  }
}
