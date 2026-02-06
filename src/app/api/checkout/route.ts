import { getStripe } from '@/lib/stripe'
import { createServerClient } from '@/lib/supabase'

/**
 * POST /api/checkout — Create a Stripe Checkout session
 */
export async function POST(request: Request) {
  const stripe = getStripe()
  if (!stripe) {
    return Response.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const { userId, email } = (await request.json()) as {
    userId: string
    email?: string
  }

  const priceId = process.env.STRIPE_PRICE_ID_PRO
  if (!priceId) {
    return Response.json({ error: 'No price configured' }, { status: 503 })
  }

  try {
    // Check if user already has a Stripe customer ID
    const supabase = createServerClient()
    let customerId: string | undefined

    if (supabase) {
      const { data: user } = await supabase
        .from('users')
        .select('stripe_customer_id')
        .eq('id', userId)
        .single()

      customerId = user?.stripe_customer_id || undefined
    }

    // Create or reuse Stripe customer
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: email || undefined,
        metadata: { clerkUserId: userId },
      })
      customerId = customer.id

      // Save customer ID to Supabase
      if (supabase) {
        await supabase
          .from('users')
          .update({ stripe_customer_id: customerId })
          .eq('id', userId)
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${request.headers.get('origin')}/build?upgrade=success`,
      cancel_url: `${request.headers.get('origin')}/pricing`,
      metadata: { clerkUserId: userId },
    })

    return Response.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return Response.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
