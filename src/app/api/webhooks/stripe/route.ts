import { getStripe } from '@/lib/stripe'
import { createServerClient } from '@/lib/supabase'

/**
 * POST /api/webhooks/stripe — Handle Stripe webhook events
 */
export async function POST(request: Request) {
  const stripe = getStripe()
  const supabase = createServerClient()

  if (!stripe || !supabase) {
    return new Response('Not configured', { status: 503 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return new Response('No webhook secret', { status: 503 })
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return new Response('Missing signature', { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Stripe webhook signature error:', err)
    return new Response('Invalid signature', { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const clerkUserId = session.metadata?.clerkUserId
        if (clerkUserId) {
          await supabase
            .from('users')
            .update({
              subscription_status: 'pro',
              stripe_customer_id: session.customer as string,
            })
            .eq('id', clerkUserId)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        const customerId = subscription.customer as string
        const status = subscription.status === 'active' ? 'pro' : 'free'

        await supabase
          .from('users')
          .update({ subscription_status: status })
          .eq('stripe_customer_id', customerId)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const customerId = subscription.customer as string

        await supabase
          .from('users')
          .update({ subscription_status: 'free' })
          .eq('stripe_customer_id', customerId)
        break
      }
    }

    return Response.json({ ok: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return Response.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
