import { createServerClient } from '@/lib/supabase'

/**
 * Clerk webhook handler — syncs user data to Supabase
 * Configure in Clerk Dashboard → Webhooks → user.created, user.updated, user.deleted
 */
export async function POST(request: Request) {
  const supabase = createServerClient()
  if (!supabase) {
    return new Response('Supabase not configured', { status: 503 })
  }

  try {
    const payload = await request.json()
    const { type, data } = payload

    switch (type) {
      case 'user.created':
      case 'user.updated': {
        const email = data.email_addresses?.[0]?.email_address || null
        const name =
          [data.first_name, data.last_name].filter(Boolean).join(' ') || null
        const imageUrl = data.image_url || null

        await supabase.from('users').upsert(
          {
            id: data.id,
            email,
            name,
            image_url: imageUrl,
          },
          { onConflict: 'id' }
        )
        break
      }

      case 'user.deleted': {
        await supabase.from('users').delete().eq('id', data.id)
        break
      }
    }

    return Response.json({ ok: true })
  } catch (error) {
    console.error('Clerk webhook error:', error)
    return Response.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
