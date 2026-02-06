import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

/**
 * Check if Stripe is configured
 */
export function hasStripe(): boolean {
  return !!stripeSecretKey && stripeSecretKey.startsWith('sk_')
}

/**
 * Server-side Stripe client
 */
let stripeClient: Stripe | null = null

export function getStripe(): Stripe | null {
  if (!hasStripe()) return null
  if (stripeClient) return stripeClient
  stripeClient = new Stripe(stripeSecretKey!)
  return stripeClient
}
